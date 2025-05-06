// src/script/mapDirections.js

import mapboxgl from 'mapbox-gl';

const token = mapboxgl.accessToken;

// show/hide helpers (you'll style these in CSS)
function showSpinner()   { document.getElementById('dir-spinner').classList.remove('hidden'); }
function hideSpinner()   { document.getElementById('dir-spinner').classList.add('hidden'); }
function showError(msg)  { 
  const el = document.getElementById('dir-error');
  el.textContent = msg; 
  el.classList.remove('hidden');
}
function clearError()    { 
  const el = document.getElementById('dir-error');
  el.textContent = '';
  el.classList.add('hidden');
}

async function fetchRoute(start, end, profile='driving') {
  const res = await fetch(`/api/directions?start=${start}&end=${end}&profile=${profile}`);
  if (!res.ok) throw new Error('Couldn’t fetch route');
  return res.json();
}

function renderRoute(map, route) {
  const id = 'route-line';
  if (map.getLayer(id)) {
    map.removeLayer(id);
    map.removeSource(id);
  }
  map.addSource(id, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: route.geometry
    }
  });
  map.addLayer({
    id,
    type: 'line',
    source: id,
    paint: { 'line-width': 4, 'line-color': '#007cbf' }
  });
}

function renderSteps(route) {
  const ul = document.getElementById('directions-steps');
  ul.innerHTML = route.legs[0].steps
    .map(s => `<li>${s.maneuver.instruction}</li>`)
    .join('');
}

export function initDirections(map) {
  const go = document.getElementById('dir-go');
  const startEl = document.getElementById('dir-start');
  const endEl   = document.getElementById('dir-end');
  const modeEls = document.querySelectorAll('#mode-buttons button');

  let profile = 'driving';
  modeEls.forEach(btn => {
    btn.addEventListener('click', () => {
      modeEls.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      profile = btn.dataset.mode;
    });
  });

  go.addEventListener('click', async () => {
    clearError();
    showSpinner();
    try {
      const start = startEl.value;
      const end   = endEl.value;
      const route = await fetchRoute(start, end, profile);
      renderRoute(map, route);
      renderSteps(route);
    } catch (e) {
      showError(e.message);
    } finally {
      hideSpinner();
    }
  });
}
