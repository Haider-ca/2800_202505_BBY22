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
  function startLiveTracking(fetchRoute, drawRoute, renderSteps, showError) {
    if (_watchId !== null) navigator.geolocation.clearWatch(_watchId);
    _liveCount = 0;
    _watchId = navigator.geolocation.watchPosition(async pos => {
      _liveCount++;
      if (_liveCount <= 3) return;
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
  document.getElementById('geocoder-start')
    .appendChild(geocoderStart.onAdd(map));
  startInputEl = document.querySelector('#geocoder-start input.mapboxgl-ctrl-geocoder--input');

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

  // ─── 2) Geolocate control ───
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
  document.getElementById('btn-geolocate')
    .addEventListener('click', () => panelGeo.trigger());

  // ─── 3) Mode buttons ───
  document.querySelectorAll('#mode-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mode-buttons button')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      profile = btn.dataset.mode;
      if (coordStart && coordEnd) route();
    });
  });

  // ─── 4) UI refs & helpers ───
  const spinnerEl = document.getElementById('dir-spinner'),
    errorEl = document.getElementById('dir-error'),
    summaryEl = document.getElementById('dir-summary'),
    stepsEl = document.getElementById('directions-steps'),
    collapseEl = document.getElementById('turn-content');

  const showSpinner = () => spinnerEl.classList.remove('d-none');
  const hideSpinner = () => spinnerEl.classList.add('d-none');
  const showError = msg => { errorEl.textContent = msg; errorEl.classList.remove('d-none'); };
  const clearError = () => { errorEl.textContent = ''; errorEl.classList.add('d-none'); };

  // ─── 5) clearLayers(): remove route & benches, KEEP markers ───
  function clearLayers() {
    const style = map.getStyle();

    if (style.layers.some(l => l.id === 'route-line')) {
      map.removeLayer('route-line');
      map.removeSource('route-line');
    }
    if (style.layers.some(l => l.id === 'benches-layer')) {
      map.removeLayer('benches-layer');
      map.removeSource('benches');
    }
    if (style.layers.some(l => l.id === 'wheelchair-facilities-layer')) {
      map.removeLayer('wheelchair-facilities-layer');
      map.removeSource('wheelchair-facilities');
    }
    if (style.layers.some(l => l.id === 'ramps-layer')) {
      map.removeLayer('ramps-layer');
      map.removeSource('ramps');
    }
    if (style.layers.some(l => l.id === 'restrooms-layer')) {
      map.removeLayer('restrooms-layer');
      map.removeSource('restrooms');
    }

    if (_watchId !== null) {
      navigator.geolocation.clearWatch(_watchId);
      _watchId = null;
    }
    // collapse the steps panel
    new bootstrap.Collapse(collapseEl, { toggle: false }).hide();
    summaryEl.textContent = '';
    stepsEl.innerHTML = '';
  }

  // ─── 6) clearRoute(): remove markers + layers ───
  function clearRoute() {
    if (startMarker) { startMarker.remove(); startMarker = null; }
    if (endMarker) { endMarker.remove(); endMarker = null; }
    document.getElementById('btn-save-route')?.classList.add('d-none');
    clearLayers();
  }

  // ─── 7) Fetch route ───
  async function fetchRoute(start, end, prof) {
    const apiProfile = prof === 'senior' ? 'walking'
      : prof === 'wheelchair' ? 'cycling'
        : prof;
    const url = new URL('/api/directions', window.location.origin);
    url.searchParams.set('start', start);
    url.searchParams.set('end', end);
    url.searchParams.set('profile', apiProfile);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Route error ${res.status}`);
    const data = await res.json();
    if (!data.geometry) throw new Error('No route found');
    return data;
  }

  // ─── 8) Draw & fit ───
  function drawRoute(route) {
    let paint;
    if (profile === 'wheelchair') {
      paint = {
        'line-color': '#FF00FF',
        'line-width': 6
      };
    }
    else if (profile === 'driving') {
      paint = {
        'line-color': '#0000FF',
        'line-width': 6
      };
    }
    else {
      const dashed = profile === 'walking' || profile === 'senior';
      paint = {
        'line-color': '#FF00FF',
        'line-width': dashed ? 6 : 14,
        ...(dashed ? { 'line-dasharray': [0, 2] } : {})
      };
    }

    if (map.getSource('route-line')) {
      map.getSource('route-line').setData({
        type: 'Feature',
        geometry: route.geometry
      });

      Object.entries(paint).forEach(([prop, val]) =>
        map.setPaintProperty('route-line', prop, val)
      );

    } else {
      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: route.geometry
        }
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint
      });
    }

    const coords = route.geometry.coordinates;
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0])
    );
    map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
  }

  // ─── addWheelchairFacilities: show little wheelchair-friendly icons ───
  async function addWheelchairFacilities(route) {
    try {
      const resp = await fetch('/data/wheelchair-friendly.geojson');
      if (!resp.ok) throw new Error('Wheelchair facilities data missing');
      const data = await resp.json();

      const feature = turf.feature(route.geometry);
      const buf = turf.buffer(feature, 0.5, { units: 'kilometers' });

      const nearby = data.features
        .filter(f => f.geometry?.type === 'Point' && turf.booleanPointInPolygon(f, buf))
        .map(f => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: { icon: f.properties.facilityType }
        }));

      const fc = { type: 'FeatureCollection', features: nearby };

      if (map.getSource('wheelchair-facilities')) {
        map.getSource('wheelchair-facilities').setData(fc);
      } else {
        map.addSource('wheelchair-facilities', { type: 'geojson', data: fc });
        map.addLayer({
          id: 'wheelchair-facilities-layer',
          type: 'symbol',
          source: 'wheelchair-facilities',
          layout: {
            'icon-image': ['get', 'icon'],
            'icon-size': 0.5,
            'icon-allow-overlap': true
          }
        });
      }
    } catch (e) {
      console.warn('Wheelchair facilities load error:', e);
    }
  }

  // ─── addRamps: show little ramp icons ───
  async function addRamps(route) {
    try {
      const resp = await fetch('/data/wheelchair-ramps.geojson');
      if (!resp.ok) throw new Error('Ramps data missing');
      const data = await resp.json();
      const routeFeature = turf.feature(route.geometry);
      const buf = turf.buffer(routeFeature, 0.05, { units: 'kilometers' });
      const nearby = data.features
        .filter(f => f.geometry?.type === 'Point' && turf.booleanPointInPolygon(f, buf))
        .map(f => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: { icon: 'ramp-15' }
        }));

      const fc = { type: 'FeatureCollection', features: nearby };

      if (map.getSource('ramps')) {
        map.getSource('ramps').setData(fc);
      } else {
        map.addSource('ramps', { type: 'geojson', data: fc });
        map.addLayer({
          id: 'ramps-layer',
          type: 'symbol',
          source: 'ramps',
          layout: {
            'icon-image': ['get', 'icon'],
            'icon-size': 0.04,
            'icon-allow-overlap': true
          }
        });
      }
    } catch (e) {
      console.warn('Ramps load error:', e);
    }
  }

  // ─── addRestrooms: show toilet icons ───
  async function addRestrooms(route) {
    try {
      const debugResp = await fetch('/data/wheelchair-restrooms.geojson');
      if (!debugResp.ok) throw new Error(`Fetch failed: ${debugResp.status}`);
      const data = await debugResp.json();
      const routeFeature = turf.feature(route.geometry);
      const buf = turf.buffer(routeFeature, 0.5, { units: 'kilometers' });
      const nearbyPoints = data.features.filter(f =>
        f.geometry?.type === 'Point' && turf.booleanPointInPolygon(f, buf)
      );

      const nearby = nearbyPoints.map(f => ({
        type: 'Feature',
        geometry: f.geometry,
        properties: { icon: 'toilet-15' }
      }));

      const fc = { type: 'FeatureCollection', features: nearby };

      if (map.getSource('restrooms')) {
        map.getSource('restrooms').setData(fc);
      } else {
        map.addSource('restrooms', {
          type: 'geojson',
          data: fc
        });
        map.addLayer({
          id: 'restrooms-layer',
          type: 'symbol',
          source: 'restrooms',
          layout: {
            'icon-image': 'custom-restroom',
            'icon-size': 0.05,
            'icon-allow-overlap': true
          }
        });
        map.moveLayer('restrooms-layer');
      }

    } catch (e) {
      console.warn('Restrooms load error:', e);
    }
  }


  // ─── 9) Benches for seniors ───
  async function addBenches(route) {
    try {
      const resp = await fetch('/data/benches.geojson');
      if (!resp.ok) throw new Error('Benches data missing');
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

  // ─── 10) Render steps & voice ───
  function renderSteps(route) {
    const steps = route.legs[0].steps;
    if (!steps.length) return;

    // Log the current profile and raw instruction
    const raw = steps[0].maneuver.instruction;

    let text = raw;
    if (profile === 'wheelchair') {
      text = text.replace(/.*?(?=(Drive|Bike|Ride|Continue|Head))/i, '');
      text = text.replace(/^(Drive|Bike|Ride)\b/i, 'Roll');
      text = '🦽 ' + text;
    }

    speak(text);

    // ─── render list visually ───
    stepsEl.innerHTML = steps.map(s => `
    <li data-instruction="${s.maneuver.instruction}">
      ${s.maneuver.instruction}
      <div class="step-meta">${formatDistance(s.distance)} · ${formatTime(s.duration)}</div>
    </li>
  `).join('');

    // ─── click-to-speak ───
    stepsEl.onclick = e => {
      const li = e.target.closest('li[data-instruction]');
      if (!li) return;

      let t = li.dataset.instruction;
      if (profile === 'wheelchair') {
        t = t.replace(/.*?(?=(Drive|Bike|Ride|Continue|Head))/i, '');
        t = t.replace(/^(Drive|Bike|Ride)\b/i, 'Roll');
        t = '🦽 ' + t;
      }
      console.log('🔊 speaking on click:', t);
      speak(t);
    };
  }




  function formatDistance(m) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  }
  function formatTime(s) {
    return `${Math.ceil(s / 60)} m`;
  }

  // ─── 11) Route logic ───
  async function route() {
    clearError();
    clearLayers();
    showSpinner();
    try {
      const r = await fetchRoute(coordStart, coordEnd, profile);
      if (profile === 'senior') { r.duration *= 1.5; r.legs[0].steps.forEach(s => s.duration *= 1.5); }
      if (profile === 'wheelchair') { r.duration *= 1.25; r.legs[0].steps.forEach(s => s.duration *= 1.25); }

      const prefix = profile === 'wheelchair' ? '🦽 Roll—' : '';
      summaryEl.textContent = `${prefix}Total: ${formatDistance(r.distance)} · ETA ${formatTime(r.duration)}`;
      speak(summaryEl.textContent);


      drawRoute(r);
      renderSteps(r);

      window.lastRouteGeoJSON = r;
      window.currentProfile = profile;
      window.lastRouteSteps = r.legs[0].steps;
      window.lastRouteSummary = {
        distance: r.distance,
        duration: r.duration
      };
      console.log();
      window.lastRouteName = `${r.legs[0].steps[0]?.name || 'Start'} → ${r.legs[0].steps.at(-1)?.name || 'End'}`;
      document.getElementById('btn-save-route')?.classList.remove('d-none');

      if (profile === 'senior') await addBenches(r);

      if (profile === 'wheelchair') {
        await addWheelchairFacilities(r);
        await addRamps(r);
        await addRestrooms(r);
      }

      new bootstrap.Collapse(collapseEl, { toggle: true });
      startLiveTracking(fetchRoute, drawRoute, renderSteps, showError);

    } catch (err) {
      showError(err.message);
    } finally {
      hideSpinner();
    }
  }

  // ─── 12) Go button ───
  document.getElementById('dir-go').addEventListener('click', () => {
    clearError();
    if (!coordStart) { showError('Please set a start location.'); return; }
    if (!coordEnd) { showError('Please set an end location.'); return; }
    route();
  });

  // ─── 13) Clear button (✕) ───
  document.getElementById('dir-clear').addEventListener('click', () => {
    clearRoute();
    geocoderStart.clear();
    geocoderEnd.clear();
    coordStart = coordEnd = null;
    window.speechSynthesis.cancel();
  });

  // ─── 14) Hide-steps toggle ───
  document.getElementById('btn-hide-steps').addEventListener('click', () => {
    new bootstrap.Collapse(collapseEl, { toggle: true });
  });

  return {
  setOrigin([lng, lat]) {
    coordStart = `${lng},${lat}`;
    if (startMarker) startMarker.remove();
    startMarker = new mapboxgl.Marker({ color: '#007cbf' }).setLngLat([lng, lat]).addTo(map);
  },
  setDestination([lng, lat]) {
    coordEnd = `${lng},${lat}`;
    if (endMarker) endMarker.remove();
    endMarker = new mapboxgl.Marker({ color: '#007cbf' }).setLngLat([lng, lat]).addTo(map);
  },
  setProfile(p) {
    profile = p;
  },
  route() {
    if (coordStart && coordEnd) route();
  },
  clearRoute() {
    clearRoute();
  }
};

}
