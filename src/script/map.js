// src/script/map.js

//  — Make sure you include Turf.js **before** this in your HTML:
//    <script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFpZGVyLTIwMjUiLCJhIjoiY205dXZ5YmIwMGQ0NTJpcTNzb2prYnZpOCJ9.QzrbaFW5l9KvuKO-cqOaFg';

const map = new mapboxgl.Map({
  container: 'map',
  style:     'mapbox://styles/mapbox/streets-v11',
  center:    [-123.037605, 49.226791],
  zoom:      11
});

// Zoom controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Geolocate + auto-center
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true
});
map.addControl(geolocate, 'top-right');

// Search box
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl,
  placeholder: 'Search for a place',
  marker:      { color: 'orange' }
});
map.addControl(geocoder, 'top-left');

map.on('load', () => {
  // 1️⃣ auto-center on user
  geolocate.trigger();

  // 2️⃣ build the path to your GeoJSON
  const path       = window.location.pathname;                    
  const dir        = path.substring(0, path.lastIndexOf('/'));    
  const geojsonURL = `${dir}/../data/metro-vancouver-boundaries.geojson`;
  console.log('Fetching boundary from:', geojsonURL);

  // 3️⃣ fetch & merge
  fetch(geojsonURL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('Raw GeoJSON loaded, feature count:', data.features.length);

      // union all features into one
      let merged = data.features[0];
      for (let i = 1; i < data.features.length; i++) {
        merged = turf.union(merged, data.features[i]);
      }

      // wrap it back into a FeatureCollection
      const outline = {
        type: 'FeatureCollection',
        features: [merged]
      };
      console.log('Dissolved outline ready:', outline);

      // 4️⃣ add as a source & layer
      map.addSource('lowerMainland', {
        type: 'geojson',
        data: outline
      });

      map.addLayer({
        id:     'lowerMainland-boundary',
        type:   'line',
        source: 'lowerMainland',
        layout: {
          'line-join': 'round',
          'line-cap':  'round'
        },
        paint: {
          'line-color': '#FF0000',
          'line-width': 3
        }
      });
    })
    .catch(err => console.error('Boundary load/dissolve error:', err));
});
