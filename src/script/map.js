// src/script/map.js

import { initDirections } from './mapDirections.js';
import { setupAddPOIFeature } from './addPoi.js';
import { createPopup } from './popup.js';
import { loadSavedRoutes } from './loadSavedRoute.js';
import { applyPOITargetFromURL, autoFillEndInputFromURL, applySavedRouteFromURL } from './mapRouteFromURL.js';
import { handleVoteClick } from '../utils/vote.js';

mapboxgl.accessToken = window.MAPBOX_TOKEN;

// New globals to cache  point A to B coords
let lastOrigin = null;
let lastDestination = null;

// ─── Marker arrays (must come _before_ we export them) ───
const wheelchairMarkers = [];
const seniorMarkers = [];
const userPOIMarkers = [];

// ─── Export the *actual* arrays & map once they exist ───
window.userPOIMarkers = userPOIMarkers;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-123.037605, 49.226791],
  zoom: 11
});

window.pathpalMap = map;


// Filter flags
let filterWheelchair = false;
let filterSenior = false;
let filterUserPOI = false;


// ─── VoiceControl ───
class VoiceControl {
  constructor(onToggle) {
    this.onToggle = onToggle;
    this.enabled = false;
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

const profileMap = {
  driving: 'mapbox/driving',
  walking: 'mapbox/walking',
  senior: 'mapbox/walking',
  wheelchair: 'mapbox/cycling'
};

map.on('load', () => {

  map.loadImage('/icons/restroom.png', (err, img) => {
    if (err) {
      console.error('restroom.png load failed:', err);
      return;
    }
    map.addImage('custom-restroom', img);
  });
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

  // ─── preload ramp & restroom icons ───
  map.loadImage('/icons/ramp.png', (err, img) => {
    if (err) return console.error('ramp.png load error', err);
    if (!map.hasImage('ramp-15')) map.addImage('ramp-15', img);
  });


  // ─── 2) Live‑traffic source & layer (hidden by default) ───
  map.addSource('traffic', {
    type: 'vector',
    url: 'mapbox://mapbox.mapbox-traffic-v1'
  });
  map.addLayer({
    id: 'traffic-layer',
    type: 'line',
    source: 'traffic',
    'source-layer': 'traffic',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
      visibility: 'none'
    },
    paint: {
      'line-color': [
        'match',
        ['get', 'congestion'],
        'low', '#2DC4B2',
        'moderate', '#FFFF00',
        'heavy', '#FF0000',
        /*default*/ '#000000'
      ],
      'line-width': 2
    }
  });

  // ─── Toggle listener for turn-by-turn panel ───
  const turnBox = document.getElementById('turn-by-turn');
  const showTurnBtn = document.getElementById('btn-show-turns');
  const hideTurnBtn = document.getElementById('btn-toggle-turns');

  if (turnBox && showTurnBtn && hideTurnBtn) {
    // Hide the panel, show the “up arrow” button
    hideTurnBtn.addEventListener('click', () => {
      turnBox.classList.add('d-none');
      showTurnBtn.classList.remove('d-none');
    });

    // Show the panel again, hide the “up arrow”
    showTurnBtn.addEventListener('click', () => {
      turnBox.classList.remove('d-none');
      showTurnBtn.classList.add('d-none');
    });
  }




  // ─── 3) Built‑in navigation & geolocate ───
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }), 'top-right');

  // ─── 4) Traffic Toggle Button ───
  const trafficBtn = document.createElement('button');
  trafficBtn.className = 'mapboxgl-ctrl-icon';
  trafficBtn.setAttribute('aria-label', 'Toggle traffic');
  trafficBtn.textContent = '🚦';
  trafficBtn.style.fontSize = '18px';
  trafficBtn.addEventListener('click', () => {
    const vis = map.getLayoutProperty('traffic-layer', 'visibility');
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

  // ─── 7.1) Reload POIs on pan/zoom ───
  map.on('moveend', () => {
    if (filterWheelchair || filterSenior || filterUserPOI) {
      loadPOIs();
    }
  });


  // ─── 8) Initialize directions ───
  const directions = initDirections(map, {
    onRouteSet: ({ origin, destination }) => {
      lastOrigin = origin;
      lastDestination = destination;
    }
  });
  window.pathpalDirections = directions;


  // Get profile param from saved routes
  const profileFromURL = new URLSearchParams(window.location.search).get('profile');
  if (profileFromURL) {
    directions.setProfile(profileFromURL);
    
    // Highlight the correct tab
    document.querySelectorAll('#mode-buttons button').forEach(btn => {
      const mode = btn.dataset.mode;
      btn.classList.toggle('active', mode === profileFromURL);
    });
  }
  
  Object.entries(profileMap).forEach(([mode, profile]) => {
    const tab = document.getElementById(`${mode}Tab`);
    if (!tab) return;
    tab.addEventListener('click', () => {
      // Trigger save route prompt if available
      if (typeof window.triggerSaveRoutePrompt === 'function') {
        window.triggerSaveRoutePrompt();
      }

      directions.setProfile(profile);
      if (lastOrigin && lastDestination) {
        directions.setOrigin(lastOrigin);
        directions.setDestination(lastDestination);
      }
    });
  });
  // Load saved routes
  loadSavedRoutes(map);

  // Get lat and lng from POI post and auto fill End address input field
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  if (type === 'user-poi') {
    applyPOITargetFromURL(map);
    autoFillEndInputFromURL();
  } 
  if (type === 'savedRoutes')  {
    applySavedRouteFromURL(map, directions);
  }
});

// ─── 9) Initialize Add-POI feature ───
console.log('🌐 map loaded, initializing POI feature');
setupAddPOIFeature();

const closeDirBtn = document.getElementById('btn-close-directions');
if (closeDirBtn) {
  closeDirBtn.addEventListener('click', () => {
    document.getElementById('directions-panel')?.classList.add('d-none');
  });
}

// ─── 10) Mode-tab click handlers ───



//////////////////////////////
// Boundary & POI functions //
//////////////////////////////

async function loadBoundary() {
  try {
    const res = await fetch('/data/metro-vancouver-boundaries.geojson');
    const geo = await res.json();
    const fc = turf.featureCollection(geo.features);
    const hull = turf.convex(fc);
    if (!hull) throw new Error('Convex hull failed');

    if (!map.getSource('boundary')) {
      map.addSource('boundary', { type: 'geojson', data: hull });
      map.addLayer({
        id: 'boundary-line',
        type: 'line',
        source: 'boundary',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#FF0000', 'line-width': 2 }
      });
    } else {
      map.getSource('boundary').setData(hull);
    }
  } catch (err) {
    console.error('Boundary error:', err);
  }
}

async function loadPOIs() {
  // 1) clear out old markers
  wheelchairMarkers.forEach(m => m.remove());
  seniorMarkers.forEach(m => m.remove());
  userPOIMarkers.forEach(m => m.remove());
  wheelchairMarkers.length = seniorMarkers.length = userPOIMarkers.length = 0;

  // 2) viewport bounds
  const bounds = map.getBounds();

  try {
    // ─── Wheelchair ───
    if (filterWheelchair) {
      const res = await fetch('/data/wheelchair-friendly.geojson');
      const geo = await res.json();
      const inView = geo.features.filter(f => {
        const coords = (f.geometry.type === 'Point')
          ? f.geometry.coordinates
          : turf.centroid(f).geometry.coordinates;
        return bounds.contains(coords);
      });
      makeMarkers(inView, wheelchairMarkers, 'wheelchair');
    }

    // ─── Senior ───
    if (filterSenior) {
      const res = await fetch('/data/senior-friendly.geojson');
      const geo = await res.json();
      const inView = geo.features.filter(f => {
        const coords = (f.geometry.type === 'Point')
          ? f.geometry.coordinates
          : turf.centroid(f).geometry.coordinates;
        return bounds.contains(coords);
      });
      makeMarkers(inView, seniorMarkers, 'senior');
    }

    // ─── User‐added POIs ───
    if (filterUserPOI) {
      const res = await fetch('/api/poi/markers');
      const data = await res.json();
      // turn into GeoJSON‐like features
      const features = data.map(poi => ({
        type: 'Feature',
        geometry: poi.coordinates,
        properties: { ...poi }
      }));
      const inView = features.filter(f => {
        const coords = f.geometry.coordinates;
        return bounds.contains(coords);
      });
      makeMarkers(inView, userPOIMarkers, 'poi');
    }
  } catch (err) {
    console.error('POI load error:', err);
  }
}


function makeMarkers(features, list, icon) {
  for (const f of features) {
    const coords = f.geometry.type === 'Point'
      ? f.geometry.coordinates
      : turf.centroid(f).geometry.coordinates;

    const [lng, lat] = coords;

    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(/icons/${icon}.png)`;
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'contain';

      // ← Updated popup instantiation:
    const popup = createPopup({
      coordinates: [lng, lat],
      properties: {
        ...f.properties,
        image: f.properties.imageUrl
      }
    });
    
    // Hover listeners
    // el.addEventListener('mouseenter', () => popup.addTo(map).setLngLat([lng, lat]));
    // el.addEventListener('mouseleave', () => popup.remove());

    const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
    list.push(marker);
    // Open popup on marker click only
    el.addEventListener('click', () => {
      popup.addTo(map).setLngLat([lng, lat]);
    });
  }
}

///////////////////////
// ToggleControl     //
///////////////////////


class ToggleControl {
  constructor(type, markersArray, onToggle) {
    this.type = type;
    this.markersArray = markersArray;
    this.onToggle = onToggle;
    this.visible = false;
  }
  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mapboxgl-ctrl-icon';
    btn.setAttribute('aria-label', `${this.type} friendly`);
    btn.style.backgroundImage = `url(/icons/${this.type}.png)`;
    btn.style.backgroundSize = '24px 24px';
    btn.style.backgroundRepeat = 'no-repeat';
    btn.style.backgroundPosition = 'center';

    btn.addEventListener('click', () => {
      this.visible = !this.visible;
      btn.classList.toggle('active', this.visible);
      this.markersArray.forEach(m =>
        this.visible ? m.addTo(this.map) : m.remove()
      );
      this.onToggle(this.visible);

      // Clear navigation route and markers (if any)
      // Only clear directions and inputs when user-poi marker toggled OFF
      if (this.type === 'poi' && !this.visible) {
        // Clear route
        if (window.pathpalDirections?.clear) {
          window.pathpalDirections.clear();
        }
      
        // Clear input fields
        const inputStart = document.querySelector('#geocoder-start input');
        const inputEnd = document.querySelector('#geocoder-end input');
        if (inputStart) inputStart.value = '';
        if (inputEnd) inputEnd.value = '';
      
        // Hide error message
        document.querySelector('.directions-error')?.classList.add('d-none');
      
        // Hide turn-by-turn panel
        document.getElementById('turn-by-turn')?.classList.add('d-none');
        document.getElementById('btn-show-turns')?.classList.remove('d-none');
      
        // Remove all popups
        document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
      }


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

// Add global event delegation for voting on popups
document.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like-btn');
  const dislikeBtn = e.target.closest('.dislike-btn');

  if (likeBtn || dislikeBtn) {
    const btn = likeBtn || dislikeBtn;
    const type = btn.dataset.type || 'poi';
    await handleVoteClick(e, type);
  }
});

// Make URL-fill functions available globally for popup.js
window.applyPOITargetFromURL = applyPOITargetFromURL;
window.autoFillEndInputFromURL = autoFillEndInputFromURL;

// Expose the map instance and user POI markers globally for access from other scripts

