// Format ISO date string to localized readable format (e.g. "2025-05-17 14:35")
export function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Get or generate a unique anonymous voter ID and store it in localStorage
export function getOrCreateVoterId() {
    let id = localStorage.getItem('voterId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('voterId', id);
    }
    return id;
}

// Reverse geocode a coordinate to a readable place name (for tooltips or address display)
export async function reverseGeocodeDisplay(coord) {
    const [lng, lat] = coord;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${window.MAPBOX_TOKEN}`);
      const data = await res.json();
      const name = data?.features?.[0]?.place_name;
      return typeof name === 'string' ? name : '';
    } catch {
      return '';
    }
}

export function reverseGeocodeAndFill(coord, selector) {
    const [lng, lat] = coord;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
      .then(res => res.json())
      .then(data => {
        const address = data.features?.[0]?.place_name || '';
        console.log(address);
        const input = document.querySelector(selector);
        if (input) {
          input.value = address;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })
      .catch(err => console.warn('Reverse geocode failed:', err));
}

/**
 * Shortens a full “Place Name, City, Province” down to
 * “Place Name, City”.
 */
export function shortenAddress(fullAddress) {
  const parts = fullAddress.split(',');
  return parts.slice(0, 2).join(',');
}