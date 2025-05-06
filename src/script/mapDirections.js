// src/script/mapDirections.js

export function initDirections(map) {
  let coordStart   = null,
      coordEnd     = null,
      profile      = 'driving',
      startMarker  = null,
      endMarker    = null;

  // 1) Geocoders (no built-in marker)
  const geocoderStart = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'Start (city, address…)',
    types:       'place,address,poi',
    limit:       5,
    marker:      false
  });
  const geocoderEnd = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'End (city, address…)',
    types:       'place,address,poi',
    limit:       5,
    marker:      false
  });
  document.getElementById('geocoder-start')
          .appendChild(geocoderStart.onAdd(map));
  document.getElementById('geocoder-end')
          .appendChild(geocoderEnd.onAdd(map));

  // place/move start marker
  geocoderStart.on('result', e => {
    coordStart = e.result.geometry.coordinates.join(',');
    if (startMarker) startMarker.remove();
    startMarker = new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat(e.result.geometry.coordinates)
      .addTo(map);
  });
  // place/move end marker
  geocoderEnd.on('result', e => {
    coordEnd = e.result.geometry.coordinates.join(',');
    if (endMarker) endMarker.remove();
    endMarker = new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat(e.result.geometry.coordinates)
      .addTo(map);
  });

  // 2) Inline Current-location button
  const panelGeo = new mapboxgl.GeolocateControl({
    positionOptions:   { enableHighAccuracy: true, maximumAge:60000, timeout:5000 },
    trackUserLocation: false,
    showUserHeading:   false,
    showAccuracyCircle:false
  });
  document.querySelector('.start-wrapper')
          .appendChild(panelGeo.onAdd(map));
  panelGeo.on('geolocate', e => {
    coordStart = [e.coords.longitude, e.coords.latitude].join(',');
    if (startMarker) startMarker.remove();
    startMarker = new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat([e.coords.longitude, e.coords.latitude])
      .addTo(map);
    const input = document.querySelector('.start-wrapper .mapboxgl-ctrl-geocoder--input');
    if (input) input.value = 'Current Location';
  });

  // 3) Mode buttons
  document.querySelectorAll('#mode-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mode-buttons button')
              .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      profile = btn.dataset.mode;
    });
  });

  // 4) UI refs
  const spinnerEl = document.getElementById('dir-spinner'),
        errorEl   = document.getElementById('dir-error'),
        summaryEl = document.getElementById('dir-summary'),
        stepsEl   = document.getElementById('directions-steps'),
        turnBox   = document.getElementById('turn-by-turn');
  const showSpinner = () => spinnerEl.classList.remove('hidden');
  const hideSpinner = () => spinnerEl.classList.add('hidden');
  const showError   = msg => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };
  const clearError  = ()  => { errorEl.textContent = ''; errorEl.classList.add('hidden'); };

  function clearRoute() {
    if (map.getLayer('route-line')) {
      map.removeLayer('route-line');
      map.removeSource('route-line');
    }
    if (map.getLayer('benches-layer')) {
      map.removeLayer('benches-layer');
      map.removeSource('benches');
    }
    turnBox.style.display   = 'none';
    summaryEl.textContent   = '';
    stepsEl.innerHTML       = '';
  }

  // format distances and durations
  function formatDistance(m) {
    return m >= 1000
      ? `${(m/1000).toFixed(1)} km`
      : `${Math.round(m)} m`;
  }
  function formatTime(sec) {
    const mins = Math.ceil(sec / 60);
    return `${mins} m`;
  }

  // 5) Fetch route
  async function fetchRoute(start, end, prof) {
    const apiProfile = prof === 'senior'    ? 'walking'
                      : prof === 'wheelchair' ? 'driving'
                      : prof;
    const res = await fetch(`/api/directions?start=${start}&end=${end}&profile=${apiProfile}`);
    if (!res.ok) throw new Error(`Route error ${res.status}`);
    const json = await res.json();
    if (!json.geometry) throw new Error('No route found');
    return json;
  }

  // 6) Draw route & fit bounds
  function drawRoute(route) {
    const dashed = profile === 'walking' || profile === 'senior';
    const paint  = {
      'line-color': '#007cbf',
      'line-width': dashed ? 6 : 14,
      ...(dashed ? { 'line-dasharray': [0,4] } : {})
    };
    if (map.getLayer('route-line')) {
      map.removeLayer('route-line');
      map.removeSource('route-line');
    }
    map.addSource('route-line', { type:'geojson', data:{ type:'Feature', geometry:route.geometry }});
    map.addLayer({
      id:     'route-line',
      type:   'line',
      source: 'route-line',
      layout: { 'line-cap':'round','line-join':'round' },
      paint
    });
    const coords = route.geometry.coordinates;
    const bounds = coords.reduce(
      (b,c) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0])
    );
    map.fitBounds(bounds, { padding:40, maxZoom:14 });
  }

  // 7) Add benches in senior mode
  async function addBenches(route) {
    try {
      const resp = await fetch('/data/benches.geojson');
      if (!resp.ok) throw new Error('Benches data not found');
      const data = await resp.json();
      const buffer = turf.buffer(route.geometry, 0.05, { units:'kilometers' });
      const nearby = data.features.filter(f => turf.booleanPointInPolygon(f, buffer));
      const fc     = { type:'FeatureCollection', features:nearby };
      if (map.getSource('benches')) {
        map.getSource('benches').setData(fc);
      } else {
        map.addSource('benches', { type:'geojson', data:fc });
        map.addLayer({
          id:     'benches-layer',
          type:   'symbol',
          source: 'benches',
          layout:{
            'icon-image':'bench-15',
            'icon-size': 0.04,
            'icon-allow-overlap':true
          }
        });
      }
    } catch(e){
      console.warn('Benches load error:', e);
    }
  }

  // 8) Render turn-by-turn steps
  function renderSteps(route) {
    stepsEl.innerHTML = route.legs[0].steps
      .map(s => `
        <li>
          ${s.maneuver.instruction}
          <div class="step-meta">
            ${formatDistance(s.distance)} · ${formatTime(s.duration)}
          </div>
        </li>
      `).join('');
  }

  // 9) Go button
  document.getElementById('dir-go').addEventListener('click', async () => {
    clearError(); clearRoute(); showSpinner();
    try {
      if (!coordStart) throw new Error('Please set a start location.');
      if (!coordEnd)   throw new Error('Please set an end location.');

      const route = await fetchRoute(coordStart, coordEnd, profile);

      // adjust durations
      if (profile === 'senior') {
        route.duration *= 1.5;
        route.legs[0].steps.forEach(s => s.duration *= 1.5);
      }
      if (profile === 'wheelchair') {
        route.duration *= 1.25;
        route.legs[0].steps.forEach(s => s.duration *= 1.25);
      }

      // show summary
      summaryEl.textContent =
        `Total: ${formatDistance(route.distance)} · ETA ${formatTime(route.duration)}`;

      drawRoute(route);
      renderSteps(route);
      if (profile === 'senior') await addBenches(route);

      turnBox.style.display = 'block';
    } catch (err) {
      showError(err.message);
    } finally {
      hideSpinner();
    }
  });

  // 10) Clear button
  document.getElementById('dir-clear').addEventListener('click', () => {
    clearRoute();
    geocoderStart.clear();
    geocoderEnd.clear();
    if (startMarker) { startMarker.remove(); startMarker = null; }
    if (endMarker)   { endMarker.remove();   endMarker   = null; }
    coordStart = coordEnd = null;
  });
}
