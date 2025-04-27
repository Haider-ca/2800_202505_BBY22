// src/script/map.js

/**
 * Initializes Mapbox, draws Metro Vancouver boundary,
 * and toggles wheelchair- and senior-friendly POIs.
 *
 * Requires Turf.js & MapboxGeocoder loaded before this.
 */

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFpZGVyLTIwMjUiLCJhIjoiY205dXZ5YmIwMGQ0NTJpcTNzb2prYnZpOCJ9.QzrbaFW5l9KvuKO-cqOaFg';

const map = new mapboxgl.Map({
  container: 'map',
  style:     'mapbox://styles/mapbox/streets-v11',
  center:    [-123.037605, 49.226791],
  zoom:      11
});

// 1️⃣ UI Controls: zoom, geolocate, search
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading:   true
});
map.addControl(geolocate, 'top-right');
map.addControl(new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl,
  placeholder: 'Search for a place',
  marker:      { color: 'orange' }
}), 'top-left');

// 2️⃣ Boundary: fetch from src/data, union & outline
async function loadBoundary() {
  try {
    const url = '/src/data/metro-vancouver-boundaries.geojson';
    console.log('Fetching boundary from:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const geojson = await res.json();

    // merge into one polygon
    let merged = geojson.features[0];
    for (let i = 1; i < geojson.features.length; i++) {
      merged = turf.union(merged, geojson.features[i]);
    }
    // turn it into a LineString
    const boundaryLine = turf.polygonToLine(merged);

    map.addSource('lowerMainland', { type: 'geojson', data: boundaryLine });
    map.addLayer({
      id: 'lowerMainland-boundary',
      type: 'line',
      source: 'lowerMainland',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint:  { 'line-color': '#FF0000', 'line-width': 3 }
    });
  } catch (err) {
    console.error('Boundary load/outline error:', err);
  }
}

// 3️⃣ POIs: load two files from src/data and create markers
function makeMarkers(features, array, iconName) {
  features.forEach(f => {
    const [lng, lat] = f.geometry.coordinates;
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(/icons/${iconName}.svg)`;
    el.style.width  = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'contain';
    array.push(new mapboxgl.Marker(el).setLngLat([lng, lat]));
  });
}

async function loadPOIs() {
  const wheelchair = [], senior = [];
  try {
    let res = await fetch('/src/data/wheelchair-friendly.geojson');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let data = await res.json();
    makeMarkers(data.features, wheelchair, 'wheelchair');

    res = await fetch('/src/data/senior-friendly.geojson');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    makeMarkers(data.features, senior, 'senior');
  } catch (err) {
    console.error('POI load error:', err);
  }

  // ToggleControl definition (same as before)
  class ToggleControl {
    constructor(type, markers) {
      this.type = type;
      this.markers = markers;
      this.visible = false;
    }
    onAdd(map) {
      this.map = map;
      const container = document.createElement('div');
      container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      const btn = document.createElement('button');
      btn.className = 'mapboxgl-ctrl-icon';
      btn.title = `${this.type} friendly`;
      btn.style.backgroundImage = `url(/icons/${this.type}.svg)`;
      btn.style.backgroundRepeat = 'no-repeat';
      btn.style.backgroundPosition = 'center';
      btn.style.backgroundSize = '24px';
      btn.onclick = () => {
        this.visible
          ? this.markers.forEach(m => m.remove())
          : this.markers.forEach(m => m.addTo(this.map));
        this.visible = !this.visible;
        btn.classList.toggle('active', this.visible);
      };
      container.appendChild(btn);
      return container;
    }
    onRemove() {
      this.container.remove();
      this.map = null;
    }
  }

  map.addControl(new ToggleControl('wheelchair', wheelchair), 'top-right');
  map.addControl(new ToggleControl('senior', senior),       'top-right');
}

// 4️⃣ Kickoff on map load
map.on('load', () => {
  geolocate.trigger();
  loadBoundary();
  loadPOIs();
});
