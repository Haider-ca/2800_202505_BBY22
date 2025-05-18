/**
 * These functions help automatically apply coordinates from the URL
 * and prefill the destination input in the directions panel.
 * 
 * Code generated with the assistance of ChatGPT.
 */

// Adds a blue marker to the map based on lat/lng from URL,
// flies the map to the location, and sets it as route end point.
export function applyPOITargetFromURL(map) {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));

    if (!isNaN(lat) && !isNaN(lng)) {
        // Add a blue marker on the map
        new mapboxgl.Marker({ color: 'blue' }).setLngLat([lng, lat]).addTo(map);
        // Center and zoom the map
        map.flyTo({ center: [lng, lat], zoom: 16 });

        // Set the route's destination if function is available
        if (window.setCoordEnd) {
            window.setCoordEnd(`${lng},${lat}`);
        } else {
            console.warn('setCoordEnd is not available yet');
        }
    }
}

// Automatically fills the destination input in the directions panel
// using lat/lng from the URL, sets the endpoint, and reverse geocodes to display address.
export function autoFillEndInputFromURL() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));

    if (!isNaN(lat) && !isNaN(lng)) {
        const coord = `${lng},${lat}`;
        // Store in global variable for possible future use
        window.preselectedDestination = coord;

        // Set as destination in routing logic, if method exists
        if (typeof window.setCoordEnd === 'function') {
            window.setCoordEnd(coord);
        }

        // Perform reverse geocoding and prefill the geocoder input field
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
            .then(res => res.json())
            .then(data => {
                const address = data.features?.[0]?.place_name || 'Selected location';
                const input = document.querySelector('#geocoder-end input');
                if (input) {
                    input.value = address;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            })
            .catch(err => console.warn('Reverse geocode failed:', err));
    }
}  