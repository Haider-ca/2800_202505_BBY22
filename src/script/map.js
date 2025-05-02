// src/script/map.js

/**
 * Initializes Mapbox, draws Metro Vancouver boundary,
 * and toggles wheelchair- and senior-friendly POIs.
 *
 * Requires Turf.js & MapboxGeocoder loaded before this.
 */

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFpZGVyLTIwMjUiLCJhIjoiY205dXZ5YmIwMGQ0NTJpcTNzb2prYnZpOCJ9.QzrbaFW5l9KvuKO-cqOaFg';

// Initialize the map with default settings
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-123.037605, 49.226791],
  zoom: 11
});

// 1- UI Controls: zoom, geolocate, search
// Add zoom and rotation controls to the top right of the map
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Configure the geolocation control to track user position
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true
});
map.addControl(geolocate, 'top-right');

// Add a search (geocoder) control in the top-left
map.addControl(new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl,
  placeholder: 'Search for a place',
  marker: { color: 'orange' }
}), 'top-left');

// 2- Boundary: fetch from src/data, union & outline
async function loadBoundary() {
  try {
    // Define the GeoJSON file path for Metro Vancouver boundaries
    const url = '/src/data/metro-vancouver-boundaries.geojson';
    console.log('Fetching boundary from:', url);

    // Fetch the boundary GeoJSON
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Parse the GeoJSON response
    const geojson = await res.json();

    // Merge all boundary features into a single polygon
    let merged = geojson.features[0];
    for (let i = 1; i < geojson.features.length; i++) {
      merged = turf.union(merged, geojson.features[i]);
    }

    // Convert merged polygon to a line for outlining
    const boundaryLine = turf.polygonToLine(merged);

    // Add the boundary line as a GeoJSON source
    map.addSource('lowerMainland', { type: 'geojson', data: boundaryLine });
    // Draw the boundary line layer on the map
    map.addLayer({
      id: 'lowerMainland-boundary',
      type: 'line',
      source: 'lowerMainland',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#FF0000', 'line-width': 3 }
    });
  } catch (err) {
    // Log any errors encountered during boundary loading
    console.error('Boundary load/outline error:', err);
  }
}

// 3- POIs: load two files from src/data and create markers
// Helper function to create markers for features
function makeMarkers(features, array, iconName) {
  features.forEach(f => {
    // Extract or compute feature coordinates
    let coords;
    if (f.geometry && f.geometry.type === 'Point') {
      coords = f.geometry.coordinates;
    } else {
      try {
        // Fallback: compute centroid for non-point geometries
        const centerFeature = turf.centroid(f);
        coords = centerFeature.geometry.coordinates;
      } catch (e) {
        // Skip features without valid geometry
        console.warn('Skipping feature without valid geometry', f);
        return;
      }
    }

    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      console.warn('Skipping feature with invalid coords', coords);
      return;
    }

    // Create a custom HTML element for the marker icon
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(/public/icons/${iconName}.png)`;
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'contain'; // Style the marker with the specified icon

    // Create popup HTML content
const popupContent = `
<div class="custom-popup">
  <div class="popup-header">
    <strong>${f.properties.username || 'Anonymous'}</strong>
    <span>${f.properties.time || 'Unknown time'}</span>
  </div>
  <img src="${f.properties.image || '/icons/default.jpg'}" alt="POI photo" class="popup-img" />
  <div class="popup-desc">${f.properties.description || 'No description available.'}</div>
  <div class="popup-votes">
    <span>👍 ${f.properties.likes || 0}</span>
    <span>💬 ${f.properties.comments || 0}</span>
  </div>
</div>
`;

const popup = new mapboxgl.Popup({
closeButton: false,
closeOnClick: false,
offset: 25,
}).setHTML(popupContent);

// Hover listeners
el.addEventListener('mouseenter', () => popup.addTo(map).setLngLat([lng, lat]));
el.addEventListener('mouseleave', () => popup.remove());

    // Instantiate and store the Mapbox marker
    array.push(new mapboxgl.Marker(el).setLngLat([lng, lat]));
  });
}


async function loadPOIs() {
  // Arrays to hold marker instances for toggling
  const wheelchair = [], senior = [];
  try {
    // Load wheelchair-friendly POIs from GeoJSON
    let res = await fetch('/src/data/wheelchair-friendly.geojson');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let data = await res.json();
    makeMarkers(data.features, wheelchair, 'wheelchair');

    // Load senior-friendly POIs from GeoJSON
    res = await fetch('/src/data/senior-friendly.geojson');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    makeMarkers(data.features, senior, 'senior');

    // Populate markers arrays (done in makeMarkers calls)
  } catch (err) {
    console.error('POI load error:', err);
  }

  // Custom control to toggle marker visibility
  class ToggleControl {
    // Initialize control with type (wheelchair/senior) and markers list
    constructor(type, markers) {
      this.type = type;
      this.markers = markers;
      this.visible = false;
    }
    onAdd(map) {
      this.map = map;
      // Create control container and button
      this.container = document.createElement('div');
      this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      // Configure button appearance and accessibility
      btn.setAttribute('aria-label', `${this.type} friendly`);
      btn.className = 'mapboxgl-ctrl-icon';
      btn.style.backgroundImage = `url(/public/icons/${this.type}.png)`;
      btn.style.backgroundRepeat = 'no-repeat';
      btn.style.backgroundPosition = 'center';
      btn.style.backgroundSize = '24px';
      btn.style.width = '32px';
      btn.style.height = '32px';

      // Toggle markers on map when button is clicked
      btn.addEventListener('click', () => {
        // Show or hide each marker based on current visibility state
        this.visible
          ? this.markers.forEach(m => m.remove())
          : this.markers.forEach(m => m.addTo(this.map));
        this.visible = !this.visible;
        btn.classList.toggle('active', this.visible);
      });

      this.container.appendChild(btn);
      return this.container;
    }
    onRemove() {
      // Cleanup control when removed from the map
      this.container.parentNode.removeChild(this.container);
      this.map = null;
    }
  }

  // Add toggle controls to map for each marker type
  map.addControl(new ToggleControl('wheelchair', wheelchair), 'top-right');
  map.addControl(new ToggleControl('senior', senior), 'top-right');
}

// 4- Kickoff on map load
map.on('load', () => {
  // Automatically trigger geolocation to center map on user
  geolocate.trigger();
  // Draw the Metro Vancouver boundary
  loadBoundary();
  // Load and prepare POI markers
  loadPOIs();
});
