// src/script/mapDirections.js

export function initDirections(map) {
  let coordStart = null,
      coordEnd   = null,
      profile    = 'driving';

  // Arrays to hold markers so we can clear them
  const routeMarkers = [];
  const benchMarkers = [];

  // 1) Start & End geocoders
  const geocoderStart = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'Start (city, address...)',
    types:       'place,address,poi',
    limit:       5
  });
  const geocoderEnd = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'End (city, address...)',
    types:       'place,address,poi',
    limit:       5
  });
  document.getElementById('geocoder-start')
          .appendChild(geocoderStart.onAdd(map));
  document.getElementById('geocoder-end')
          .appendChild(  geocoderEnd.onAdd(map));

  geocoderStart.on('result', e => coordStart = e.result.geometry.coordinates.join(','));
  geocoderEnd  .on('result', e => coordEnd   = e.result.geometry.coordinates.join(','));

  // 2) Mode buttons
  document.querySelectorAll('#mode-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mode-buttons button')
              .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      profile = btn.dataset.mode;
    });
  });

  // 3) UI helpers
  const spinnerEl = document.getElementById('dir-spinner'),
        errorEl   = document.getElementById('dir-error'),
        stepsEl   = document.getElementById('directions-steps');
  const showSpinner = () => spinnerEl.classList.remove('hidden');
  const hideSpinner = () => spinnerEl.classList.add('hidden');
  const showError   = msg => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };
  const clearError  = ()  => { errorEl.textContent = ''; errorEl.classList.add('hidden'); };

  // Remove any previous route line and markers
  function clearRoute() {
    // clear layer if exists
    if (map.getLayer('route-line')) {
      map.removeLayer('route-line');
      map.removeSource('route-line');
    }
    // clear any markers we added
    routeMarkers.forEach(m => m.remove());
    routeMarkers.length = 0;
    benchMarkers.forEach(m => m.remove());
    benchMarkers.length = 0;
  }

  // 4) Fetch route from backend
  async function fetchRoute(start, end, prof) {
    // map senior→walking, wheelchair→driving
    const apiProfile = prof === 'senior' 
      ? 'walking' 
      : prof === 'wheelchair' 
      ? 'driving' 
      : prof;

    const res = await fetch(
      `/api/directions?start=${start}&end=${end}&profile=${apiProfile}`
    );
    if (!res.ok) throw new Error(`Route error ${res.status}`);
    const data = await res.json();
    if (!data.geometry) throw new Error('No route found');
    return data;
  }

  // 5) Draw the route line and add invisible markers for padding

  function drawRoute(route) {
    const isDashed = profile === 'walking' || profile === 'senior';
  
    // solid vs. dotted widths
    const solidWidth  = 10;  // driving
    const dotSize     = 8;  // diameter of each dot
    const gapSize     = 1.5;   // spacing between dots
  
    const paint = {
      'line-color': '#007cbf',
      'line-width': isDashed ? dotSize : solidWidth
    };
  
    if (isDashed) {
      // 0-length dash = full circle of `dotSize`, then small gap
      paint['line-dasharray'] = [0, gapSize];
    }
  
    // remove any existing route-line
    if (map.getLayer('route-line')) {
      map.removeLayer('route-line');
      map.removeSource('route-line');
    }
  
    // add source & layer
    map.addSource('route-line', {
      type: 'geojson',
      data: { type:'Feature', geometry: route.geometry }
    });
    map.addLayer({
      id:     'route-line',
      type:   'line',
      source: 'route-line',
      layout: {
        'line-cap':  'round',
        'line-join': 'round'
      },
      paint
    });

    // optional: add invisible markers at start/end for zoom-fit
    ['start','end'].forEach((pt, idx) => {
      const coords = idx===0
        ? route.geometry.coordinates[0]
        : route.geometry.coordinates.slice(-1)[0];
      const m = new mapboxgl.Marker({ color: 'transparent' })
        .setLngLat(coords)
        .addTo(map);
      routeMarkers.push(m);
    });
    // fit to bounds
    const coords = route.geometry.coordinates;
    const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 40 });
  }

  // 6) Overlay benches for senior
  async function addBenches(route) {
    try {
      const r = await fetch('/data/benches.geojson');
      if (!r.ok) throw new Error(`Benches load ${r.status}`);
      const benches = await r.json();
      const line    = turf.lineString(route.geometry.coordinates);
      const buffer  = turf.buffer(line, 0.05, { units: 'kilometers' });
      const pts     = benches.features.filter(f =>
        turf.booleanPointInPolygon(f, buffer)
      );

      pts.forEach(f => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundImage = 'url(/icons/bench.png)';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundSize = 'contain';
        const marker = new mapboxgl.Marker(el)
          .setLngLat(f.geometry.coordinates)
          .addTo(map);
        benchMarkers.push(marker);
      });
    } catch (err) {
      console.warn('Benches not displayed:', err.message);
    }
  }

  // 7) Render step-by-step instructions
  function renderSteps(route) {
    stepsEl.innerHTML = route.legs[0].steps
      .map(s => `<li>${s.maneuver.instruction}</li>`)
      .join('');
  }

  // 8) “Go” button handler
  document.getElementById('dir-go').addEventListener('click', async () => {
    clearError(); clearRoute(); showSpinner();
    try {
      let start = coordStart;
      if (!start) {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        start = `${pos.coords.longitude},${pos.coords.latitude}`;
      }
      if (!start || !coordEnd) {
        throw new Error('Please select both start & end points (or allow location).');
      }

      const route = await fetchRoute(start, coordEnd, profile);
      drawRoute(route);

      if (profile === 'senior') {
        await addBenches(route);
      }
      renderSteps(route);

    } catch (err) {
      showError(err.message);
    } finally {
      hideSpinner();
    }
  });
}
