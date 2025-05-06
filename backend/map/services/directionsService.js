// backend/map/services/directionsService.js

const fetch = require('node-fetch');
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

exports.getRoute = async (start, end, profile) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start};${end}` +
              `?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Mapbox Directions failed');
  const json = await res.json();
  if (!json.routes.length) throw new Error('No routes found');
  return json.routes[0];
};
