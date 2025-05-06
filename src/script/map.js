// src/script/map.js
// MAP MODULE — now as an ES module, plus initDirections hookup

import { initDirections } from './mapDirections.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFpZGVyLTIwMjUiLCJhIjoiY205dXZ5YmIwMGQ0NTJpcTNzb2prYnZpOCJ9.QzrbaFW5l9KvuKO-cqOaFg';

const map = new mapboxgl.Map({
  container: 'map',
  style:     'mapbox://styles/mapbox/streets-v11',
  center:    [-123.037605, 49.226791],
  zoom:      11
});

// Filter flags
let filterWheelchair = false;
let filterSenior     = false;

// Marker arrays (never reassign)
const wheelchairMarkers = [];
const seniorMarkers     = [];

map.on('load', () => {
  // Built-in controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }), 'top-right');
  map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'Search for a place',
    marker:      false
  }), 'top-left');

  // Toggle controls
  const wcCtrl = new ToggleControl('wheelchair', wheelchairMarkers, visible => {
    filterWheelchair = visible;
    loadPOIs();
  });
  const srCtrl = new ToggleControl('senior', seniorMarkers, visible => {
    filterSenior = visible;
    loadPOIs();
  });
  map.addControl(wcCtrl, 'top-right');
  map.addControl(srCtrl, 'top-right');

  // Draw boundary and load initial POIs
  loadBoundary();
  loadPOIs();
});

// initialize the Directions panel logic
initDirections(map);

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
  // Clear existing markers
  wheelchairMarkers.forEach(m => m.remove());
  seniorMarkers.forEach(m => m.remove());
  wheelchairMarkers.length = 0;
  seniorMarkers.length     = 0;

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

    btn.addEventListener('click', () => {
      this.visible = !this.visible;
      btn.classList.toggle('active', this.visible);
      this.markersArray.forEach(m => this.visible ? m.addTo(this.map) : m.remove());
      this.onToggle(this.visible);
    });

    this.container.appendChild(btn);
    return this.container;
  }
  onRemove() {
    this.container.remove();
    this.map = null;
  }
}
