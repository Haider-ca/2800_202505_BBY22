/**
 * These functions help automatically apply coordinates from the URL
 * and prefill the destination input in the directions panel.
 * 
 * Code generated with the assistance of ChatGPT.
 */

import { reverseGeocodeAndFill } from '../utils/helpers.js';
import { createPopup } from './popup.js';

// Adds a blue marker to the map based on lat/lng from URL,
// flies the map to the location, and sets it as route end point.
export async function applyPOITargetFromURL(map) {
  const params = new URLSearchParams(window.location.search);
  const poiId = params.get('poiId');

  if (!poiId) return;

  try {
    const res = await fetch(`/api/poi/${poiId}`);
    if (!res.ok) throw new Error('Failed to fetch POI');
    const poi = await res.json();

    const { coordinates } = poi;
    const [lng, lat] = coordinates?.coordinates || [];
    if (!lng || !lat) return;

    // Create marker element
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(/icons/poi.png)`;
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'contain';

    // Add marker to map
    const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);

    // Set destination
    if (typeof window.setCoordEnd === 'function') {
      window.setCoordEnd(`${lng},${lat}`, el);
    }

    // Show popup
    const popup = createPopup({
      coordinates: [lng, lat],
      properties: {
        ...poi,
        image: poi.imageUrl, // ensure correct field name
      }
    });
    popup.addTo(map).setLngLat([lng, lat]);

    // Optional: fly to location
    map.flyTo({ center: [lng, lat], zoom: 16 });

  } catch (err) {
    console.error('Failed to load POI from URL:', err);
  }
}
  

// Automatically fills the destination input in the directions panel
// using lat/lng from the URL, sets the endpoint, and reverse geocodes to display address.
export async function autoFillEndInputFromURL() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));
    const poiId = params.get('poiId');
  
    // use lat/lng if present
    if (!isNaN(lat) && !isNaN(lng)) {
      const coord = `${lng},${lat}`;
      window.preselectedDestination = coord;
      reverseGeocodeAndFill([lng, lat], '#geocoder-end input');
      return;
    }
  
    // fetch lat/lng from POI by ID
    if (poiId) {
      try {
        const res = await fetch(`/api/poi/${poiId}`);
        if (!res.ok) throw new Error('Failed to fetch POI');
        const poi = await res.json();
        const [lng, lat] = poi.coordinates?.coordinates || [];
        if (lng && lat) {
          const coord = `${lng},${lat}`;
          window.preselectedDestination = coord;
          reverseGeocodeAndFill([lng, lat], '#geocoder-end input');
        }
      } catch (err) {
        console.error('Failed to fetch and fill POI address:', err);
      }
    }
    // Clear the temporary parameters after use
    const cleanURL = new URL(window.location.href);
    cleanURL.searchParams.delete('lat');
    cleanURL.searchParams.delete('lng');
    cleanURL.searchParams.delete('type');
    window.history.replaceState({}, '', cleanURL.pathname);
  }  

// applySavedRouteFromURL
export function applySavedRouteFromURL(map, directions) {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('routeId');
    if (!routeId) return;
  
    fetch(`/api/routes/${routeId}`)
      .then(res => res.json())
      .then(route => {
        if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)) {
          console.warn('Invalid route data');
          return;
        }
  
        const coords = route.geometry.coordinates;
        const startCoord = coords[0];
        const endCoord = coords[coords.length - 1];
        const startLngLat = `${startCoord[0]},${startCoord[1]}`;
        const endLngLat = `${endCoord[0]},${endCoord[1]}`;
  
        // Set directions start and end
        if (typeof window.setCoordEnd === 'function') {
            window.setCoordEnd(endLngLat);
        }
        if (typeof directions.setOrigin === 'function') {
            directions.setOrigin(startLngLat);
        }
          
        // Fill address input fields
        reverseGeocodeAndFill(startCoord, '#geocoder-start input');
        reverseGeocodeAndFill(endCoord, '#geocoder-end input');
  
        // Auto-trigger navigation
        setTimeout(() => {
          document.getElementById('dir-go')?.click();
        }, 500);
      })
      .catch(err => console.error('Failed to fetch route:', err));
  }
  
  
  