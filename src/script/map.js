// src/script/map.js

import { initDirections } from './mapDirections.js';
import { setupAddPOIFeature } from './addPoi.js';

mapboxgl.accessToken = window.MAPBOX_TOKEN;


const map = new mapboxgl.Map({
  container: 'map',
  style:     'mapbox://styles/mapbox/streets-v11',
  center:    [-123.037605, 49.226791],
  zoom:      11
});

// Filter flags
let filterWheelchair = false;
let filterSenior     = false;
let filterUserPOI = false;

// Marker arrays (never reassign)
const wheelchairMarkers = [];
const seniorMarkers     = [];
const userPOIMarkers = [];

// ─── VoiceControl ───
class VoiceControl {
  constructor(onToggle) {
    this.onToggle = onToggle;
    this.enabled  = false;
  }
  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    this.btn = document.createElement('button');
    this.btn.type = 'button';
    this.btn.className = 'mapboxgl-ctrl-icon';
    this.btn.setAttribute('aria-label', 'Toggle voice guidance');
    this.btn.textContent = '🔊';
    this.btn.style.opacity = '0.4';

    this.btn.addEventListener('click', () => {
      this.enabled = !this.enabled;
      this.btn.style.opacity = this.enabled ? '1.0' : '0.4';
      window.voiceGuidanceEnabled = this.enabled;
    });

    this.container.appendChild(this.btn);
    return this.container;
  }
  onRemove() {
    this.container.remove();
    this.map = null;
  }
}

map.on('load', () => {
  // ─── 1) Load bench icon at native resolution ───
  map.loadImage('/icons/bench.png', (err, img) => {
    if (err) {
      console.error('Failed to load bench icon:', err);
      return;
    }
    if (!map.hasImage('bench-15')) {
      map.addImage('bench-15', img);
    }
  });

  // ─── 2) Live‑traffic source & layer (hidden by default) ───
  map.addSource('traffic', {
    type: 'vector',
    url:  'mapbox://mapbox.mapbox-traffic-v1'
  });
  map.addLayer({
    id:            'traffic-layer',
    type:          'line',
    source:        'traffic',
    'source-layer':'traffic',
    layout: {
      'line-join': 'round',
      'line-cap':  'round',
      visibility:  'none'
    },
    paint: {
      'line-color': [
        'match',
        ['get','congestion'],
        'low',      '#2DC4B2',
        'moderate', '#FFFF00',
        'heavy',    '#FF0000',
        /*default*/ '#000000'
      ],
      'line-width': 2
    }
  });

  // ─── 3) Built‑in navigation & geolocate ───
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions:   { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading:   true
  }), 'top-right');

  // ─── 4) Traffic Toggle Button ───
  const trafficBtn = document.createElement('button');
  trafficBtn.className = 'mapboxgl-ctrl-icon';
  trafficBtn.setAttribute('aria-label','Toggle traffic');
  trafficBtn.textContent = '🚦';
  trafficBtn.style.fontSize = '18px';
  trafficBtn.addEventListener('click', () => {
    const vis = map.getLayoutProperty('traffic-layer','visibility');
    map.setLayoutProperty(
      'traffic-layer',
      'visibility',
      vis === 'none' ? 'visible' : 'none'
    );
  });
  const trafficControl = {
    onAdd() {
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      this._container.appendChild(trafficBtn);
      return this._container;
    },
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  };
  map.addControl(trafficControl, 'top-right');

  // ─── 5) Voice toggle control ───
  const voiceControl = new VoiceControl(enabled => {
    window.voiceGuidanceEnabled = enabled;
  });
  map.addControl(voiceControl, 'top-right');

  // ─── 6) POI Toggle Controls ───
  const wcCtrl = new ToggleControl('wheelchair', wheelchairMarkers, visible => {
    filterWheelchair = visible;
    loadPOIs();
  });
  const srCtrl = new ToggleControl('senior', seniorMarkers, visible => {
    filterSenior = visible;
    loadPOIs();
  });
  const userPOICtrl = new ToggleControl('poi', userPOIMarkers, visible => {
    filterUserPOI = visible;
    loadPOIs();
  });
  map.addControl(wcCtrl, 'top-right');
  map.addControl(srCtrl, 'top-right');
  map.addControl(userPOICtrl, 'top-right');

  // ─── 7) Draw boundary & load initial POIs ───
  loadBoundary();
  loadPOIs();

  // ─── 8) Initialize directions ───
  initDirections(map);

  // ─── 9) Initialize Add-POI feature ───
  console.log('🌐 map loaded, initializing POI feature');
  setupAddPOIFeature();
});

//////////////////////////////
// Boundary & POI functions //
//////////////////////////////

async function loadBoundary() {
  try {
    const res = await fetch('/data/metro-vancouver-boundaries.geojson');
    const geo = await res.json();
    const fc  = turf.featureCollection(geo.features);
    const hull = turf.convex(fc);
    if (!hull) throw new Error('Convex hull failed');

    if (!map.getSource('boundary')) {
      map.addSource('boundary', { type: 'geojson', data: hull });
      map.addLayer({
        id:    'boundary-line',
        type:  'line',
        source:'boundary',
        layout:{ 'line-join':'round','line-cap':'round' },
        paint: { 'line-color':'#FF0000','line-width':2 }
      });
    } else {
      map.getSource('boundary').setData(hull);
    }
  } catch (err) {
    console.error('Boundary error:', err);
  }
}

async function loadPOIs() {
  wheelchairMarkers.forEach(m => m.remove());
  seniorMarkers.forEach(m => m.remove());
  userPOIMarkers.forEach(m => m.remove());
  wheelchairMarkers.length = 0;
  seniorMarkers.length     = 0;
  userPOIMarkers.length = 0;

  try {
    if (filterWheelchair) {
      const res = await fetch('/data/wheelchair-friendly.geojson');
      const geo = await res.json();
      makeMarkers(geo.features, wheelchairMarkers, 'wheelchair');
    }
    if (filterSenior) {
      const res = await fetch('/data/senior-friendly.geojson');
      const geo = await res.json();
      makeMarkers(geo.features, seniorMarkers, 'senior');
    }
    if (filterUserPOI) {
      const res = await fetch('/api/poi');
      const data = await res.json();
    
      // Convert to GeoJSON Feature format
      const features = data.map(poi => ({
        type: 'Feature',
        geometry: poi.coordinates,
        properties: {
          title: poi.title,
          description: poi.description
        }
      }));
    
      makeMarkers(features, userPOIMarkers, 'poi');
    }
    

    // --- To switch back to dynamic API when your DB has locations, replace the above block with: ---
    /*
    // Build query string only for active filters
    const params = new URLSearchParams();
    if (filterWheelchair) params.set('wheelchair', 'true');
    if (filterSenior)     params.set('senior',     'true');
    const url = '/api/map' + (params.toString() ? `?${params}` : '');

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const wcFeatures = data.features.filter(f => f.properties.wheelchairFriendly);
    const srFeatures = data.features.filter(f => f.properties.seniorFriendly);
    makeMarkers(wcFeatures, wheelchairMarkers, 'wheelchair');
    makeMarkers(srFeatures, seniorMarkers, 'senior');
    */
  } catch (err) {
    console.error('POI load error:', err);
  }
}

function makeMarkers(features, list, icon) {
  for (const f of features) {
    const coords = f.geometry.type === 'Point'
      ? f.geometry.coordinates
      : turf.centroid(f).geometry.coordinates;

    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(/icons/${icon}.png)`;
    el.style.width           = '32px';
    el.style.height          = '32px';
    el.style.backgroundSize  = 'contain';

    const marker = new mapboxgl.Marker(el).setLngLat(coords).addTo(map);
    list.push(marker);
  }
}

///////////////////////
// ToggleControl     //
///////////////////////

class ToggleControl {
  constructor(type, markersArray, onToggle) {
    this.type         = type;
    this.markersArray = markersArray;
    this.onToggle     = onToggle;
    this.visible      = false;
  }
  onAdd(map) {
    this.map       = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'mapboxgl-ctrl-icon';
    btn.setAttribute('aria-label', `${this.type} friendly`);
    btn.style.backgroundImage  = `url(/icons/${this.type}.png)`;
    btn.style.backgroundSize   = '24px 24px';
    btn.style.backgroundRepeat = 'no-repeat';
    btn.style.backgroundPosition = 'center';

    btn.addEventListener('click', () => {
      this.visible = !this.visible;
      btn.classList.toggle('active', this.visible);
      this.markersArray.forEach(m =>
        this.visible ? m.addTo(this.map) : m.remove()
      );
      this.onToggle(this.visible);

      // If the POI toggle is activated, pan to the user's current location
      if (this.type === 'poi' && this.visible && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords;
          this.map.flyTo({ center: [longitude, latitude], zoom: 14 });
        });
      }
    });

    this.container.appendChild(btn);
    return this.container;
  }
  onRemove() {
    this.container.remove();
    this.map = null;
  }
}

// Expose the map instance and user POI markers globally for access from other scripts
window.pathpalMap = map;
window.userPOIMarkers = userPOIMarkers;
