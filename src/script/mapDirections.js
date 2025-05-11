// src/script/mapDirections.js
export function initDirections(map) {
  let coordStart = null,
    coordEnd = null,
    profile = 'driving',
    startMarker = null,
    endMarker = null,
    _watchId = null,
    _liveCount = 0;

  // ─── Voice helper & live-tracking ───
  function speak(text) {
    if (!window.voiceGuidanceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }

  //GPS live tracking
  function startLiveTracking(fetchRoute, drawRoute, renderSteps, showError) {
    if (_watchId !== null) navigator.geolocation.clearWatch(_watchId);
    _liveCount = 0;
    _watchId = navigator.geolocation.watchPosition(async pos => {
      _liveCount++;
      if (_liveCount <= 3) return;  // skip the first few callbacks

      coordStart = `${pos.coords.longitude},${pos.coords.latitude}`;
      try {
        const route = await fetchRoute(coordStart, coordEnd, profile);
        drawRoute(route);
        renderSteps(route);
      } catch (e) {
        console.warn('Live update failed:', e);
        showError(e.message);
      }
    }, err => console.warn('Live watch error:', err), {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 60000
    });
  }

  // ─── 1) Geocoders ───
  let startInputEl;

  const geocoderStart = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'Start (city, address…)',
    types: 'place,address,poi',
    limit: 5,
    marker: false,
    filter: feature => startInputEl?.value !== 'Current Location'
  });

  const startGc = geocoderStart.onAdd(map);
  document.getElementById('geocoder-start').appendChild(startGc);
  startInputEl = startGc.querySelector('input.mapboxgl-ctrl-geocoder--input');
  const startClearBtn = startGc.querySelector('button.mapboxgl-ctrl-geocoder--clear');

  const geocoderEnd = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'End (city, address…)',
    types: 'place,address,poi',
    limit: 5,
    marker: false
  });
  document.getElementById('geocoder-end')
    .appendChild(geocoderEnd.onAdd(map));

  geocoderStart.on('result', e => {
    coordStart = e.result.geometry.coordinates.join(',');
    if (startMarker) startMarker.remove();
    startMarker = new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat(e.result.geometry.coordinates)
      .addTo(map);
  });
  geocoderEnd.on('result', e => {
    coordEnd = e.result.geometry.coordinates.join(',');
    if (endMarker) endMarker.remove();
    endMarker = new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat(e.result.geometry.coordinates)
      .addTo(map);
  });


  // ─── 2) Inline “Current Location” button ───
  const panelGeo = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true, maximumAge: 60000, timeout: 5000 },
    trackUserLocation: false,
    showUserHeading: false,
    showAccuracyCircle: false
  });
  document.querySelector('.start-wrapper')
    .appendChild(panelGeo.onAdd(map));

  panelGeo.on('geolocate', e => {
    coordStart = `${e.coords.longitude},${e.coords.latitude}`;
    if (startMarker) startMarker.remove();
    startMarker = new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat([e.coords.longitude, e.coords.latitude])
      .addTo(map);
    geocoderStart.setInput('Current Location');
    startInputEl.dispatchEvent(new Event('input', { bubbles: true }));
    startInputEl.focus();
  });

  // ─── 3) Mode buttons ───
  document.querySelectorAll('#mode-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mode-buttons button')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      profile = btn.dataset.mode;
      if (coordStart && coordEnd) {
        route();
      }
    });
  });

  // ─── 4) UI refs & helpers ───
  const spinnerEl = document.getElementById('dir-spinner'),
    errorEl = document.getElementById('dir-error'),
    summaryEl = document.getElementById('dir-summary'),
    stepsEl = document.getElementById('directions-steps'),
    turnBox = document.getElementById('turn-by-turn');

  const showSpinner = () => spinnerEl.classList.remove('hidden');
  const hideSpinner = () => spinnerEl.classList.add('hidden');
  const showError = msg => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };
  const clearError = () => { errorEl.textContent = ''; errorEl.classList.add('hidden'); };

  function clearRoute() {
    if (map.getLayer('route-line')) map.removeLayer('route-line');
    if (map.getSource('route-line')) map.removeSource('route-line');
    if (map.getLayer('benches-layer')) map.removeLayer('benches-layer');
    if (map.getSource('benches')) map.removeSource('benches');
    if (_watchId !== null) {
      navigator.geolocation.clearWatch(_watchId);
      _watchId = null;
    }
    turnBox.style.display = 'none';
    summaryEl.textContent = '';
    stepsEl.innerHTML = '';
  }

  function formatDistance(m) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  }
  function formatTime(s) {
    const mins = Math.ceil(s / 60);
    return `${mins} m`;
  }

  // ─── 5) Fetch route ───
  async function fetchRoute(start, end, prof) {
    const apiProfile = prof === 'senior' ? 'walking'
      : prof === 'wheelchair' ? 'driving'
        : prof;
    const url = new URL(`/api/directions`, window.location.origin);
    url.searchParams.set('start', start);
    url.searchParams.set('end', end);
    url.searchParams.set('profile', apiProfile);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Route error ${res.status}`);
    const data = await res.json();
    if (!data.geometry) throw new Error('No route found');
    return data;
  }

  // ─── 6) Draw & fit ───
  function drawRoute(route) {
    const dashed = profile === 'walking' || profile === 'senior';
    const paint = {
      'line-color': '#007cbf',
      'line-width': dashed ? 6 : 14,
      ...(dashed ? { 'line-dasharray': [0, 4] } : {})
    };
    if (map.getLayer('route-line')) map.removeLayer('route-line');
    if (map.getSource('route-line')) map.removeSource('route-line');

    map.addSource('route-line', {
      type: 'geojson',
      data: { type: 'Feature', geometry: route.geometry }
    });
    map.addLayer({
      id: 'route-line', type: 'line', source: 'route-line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint
    });

    const coords = route.geometry.coordinates;
    const bounds = coords.reduce((b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
  }

  // ─── 7) Add benches (senior) ───
  async function addBenches(route) {
    try {
      const resp = await fetch('/data/benches.geojson');
      if (!resp.ok) throw new Error('Benches data not found');
      const data = await resp.json();
      const buffer = turf.buffer(route.geometry, 0.05, { units: 'kilometers' });
      const nearby = data.features.filter(f => turf.booleanPointInPolygon(f, buffer));
      const fc = { type: 'FeatureCollection', features: nearby };

      if (map.getSource('benches')) {
        map.getSource('benches').setData(fc);
      } else {
        map.addSource('benches', { type: 'geojson', data: fc });
        map.addLayer({
          id: 'benches-layer', type: 'symbol', source: 'benches',
          layout: { 'icon-image': 'bench-15', 'icon-size': 0.04, 'icon-allow-overlap': true }
        });
      }
    } catch (e) {
      console.warn('Benches load error:', e);
    }
  }

  // ─── 8) Render steps & voice ───
  function renderSteps(route) {
    const steps = route.legs[0].steps;
    if (steps.length) speak(steps[0].maneuver.instruction);

    stepsEl.innerHTML = steps.map(s => `
      <li data-instruction="${s.maneuver.instruction}">
        ${s.maneuver.instruction}
        <div class="step-meta">
          ${formatDistance(s.distance)} · ${formatTime(s.duration)}
        </div>
      </li>
    `).join('');

    stepsEl.onclick = e => {
      const li = e.target.closest('li[data-instruction]');
      if (li) speak(li.dataset.instruction);
    };
  }

  async function route() {
    clearError();
    clearRoute();
    showSpinner();
    try {
      const r = await fetchRoute(coordStart, coordEnd, profile);
      // apply senior / wheelchair speed modifiers
      if (profile === 'senior') {
        r.duration *= 1.5;
        r.legs[0].steps.forEach(s => (s.duration *= 1.5));
      }
      if (profile === 'wheelchair') {
        r.duration *= 1.25;
        r.legs[0].steps.forEach(s => (s.duration *= 1.25));
      }

      // update summary & speak
      summaryEl.textContent = `Total: ${formatDistance(r.distance)} · ETA ${formatTime(r.duration)}`;
      speak(summaryEl.textContent);

      // draw & list steps
      drawRoute(r);
      renderSteps(r);

      // add benches if senior mode
      if (profile === 'senior') {
        await addBenches(r);
      }

      // reveal turn‐by‐turn and start live‐tracking
      turnBox.style.display = 'block';
      startLiveTracking(fetchRoute, drawRoute, renderSteps, showError);

    } catch (err) {
      showError(err.message);
    } finally {
      hideSpinner();
    }
  }

  // ─── 9) “Go” button ───
  document.getElementById('dir-go').addEventListener('click', () => {
    clearError();
    if (!coordStart) {
      showError('Please set a start location.');
      return;
    }
    if (!coordEnd) {
      showError('Please set an end location.');
      return;
    }
    route();
  });

  // ─── 10) “Clear” button ───
  document.getElementById('dir-clear').addEventListener('click', () => {
    clearRoute();
    geocoderStart.clear();
    geocoderEnd.clear();
    if (startMarker) startMarker.remove();
    if (endMarker) endMarker.remove();
    coordStart = coordEnd = null;
    window.speechSynthesis.cancel();
  });
}
