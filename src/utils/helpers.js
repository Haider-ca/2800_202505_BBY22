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
  