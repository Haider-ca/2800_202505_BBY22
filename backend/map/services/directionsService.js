// backend/map/services/directionsService.js

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  throw new Error('Missing MAPBOX_TOKEN in environment');
}

async function fetchUrl(url) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url);
}

exports.getRoute = async (start, end, profile = 'driving') => {
  // driving-wheelchair not supported → fall back to driving
  let endpoint =
    profile === 'senior'    ? 'walking' :
    profile === 'wheelchair' ? 'driving' :
    profile;

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/${endpoint}/${start};${end}`
  );
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('steps', 'true');
  url.searchParams.set('access_token', MAPBOX_TOKEN);

  const res = await fetchUrl(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err  = new Error(`Mapbox API ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  if (!Array.isArray(data.routes) || !data.routes.length) {
    const err = new Error('No routes returned from Mapbox');
    err.status = 404;
    throw err;
  }

  return data.routes[0];
};
