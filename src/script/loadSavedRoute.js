/**
 * This module loads and visualizes a previously saved route on the map.
 * It retrieves the route ID from the URL (`?routeId=...`) and fetches the corresponding route data from the backend.
 * 
 * Features:
 * - Draws a route line on the Mapbox map using GeoJSON geometry
 * - Automatically fits the map to show the full route bounds
 * - Updates or initializes the 'route-line' layer if already present
 * - Saves route metadata (steps, summary, profile) to global window variables for use in other scripts
 * - Renders turn-by-turn instructions in the sidebar if available
 * - Reveals the "Save Route" button for reuse or re-saving
 * 
 * Parameters:
 * - `map`: An initialized Mapbox GL JS map object
 * 
 * Used in:
 * - feed-post.js (when navigating to a saved route from the community feed)
 * 
 * Side effects:
 * - Writes to `window.lastRouteGeoJSON`, `window.currentProfile`, `window.lastRouteSteps`, and `window.lastRouteSummary`
 * - Modifies DOM elements: `#directions-steps`, `#turn-by-turn`, and `#btn-save-route`
 */

export async function loadSavedRoutes(map) {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('routeId');
    if (!routeId) return;
  
    try {
      const res = await fetch(`/api/routes/${routeId}`);
      const route = await res.json();
  
      if (!route || !route.geometry) {
        console.warn('Route not found');
        return;
      }
  
      // Draw route on map
      if (!map.getSource('route-line')) {
        map.addSource('route-line', {
          type: 'geojson',
          data: { type: 'Feature', geometry: route.geometry }
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-line',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#007cbf', 'line-width': 6 }
        });
      } else {
        map.getSource('route-line').setData({ type: 'Feature', geometry: route.geometry });
      }
  
      // Fit bounds
      const coords = route.geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 40 });
  
      // Save global references
      window.lastRouteGeoJSON = { type: 'Feature', geometry: route.geometry };
      window.currentProfile = route.profile || 'driving';
      window.lastRouteSteps = route.steps || [];
      window.lastRouteSummary = route.summary || {};
  
      // Render turn-by-turn
      const stepsEl = document.getElementById('directions-steps');
      if (stepsEl && window.lastRouteSteps.length > 0) {
        stepsEl.innerHTML = window.lastRouteSteps.map((s, i) => `
          <li>${i + 1}. ${s.instruction}
            <div class="step-meta">${s.distance} · ${s.duration}</div>
          </li>
        `).join('');
        document.getElementById('turn-by-turn')?.classList.remove('d-none');
      }
  
      // Show save button
      document.getElementById('btn-save-route')?.classList.remove('d-none');
  
    } catch (err) {
      console.error('Failed to load saved route:', err);
    }
  }  