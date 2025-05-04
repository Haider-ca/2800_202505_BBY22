// backend/map/controllers/mapController.js
// MAP MODULE — DO NOT MODIFY

const mapService = require('../services/mapService');

exports.getMapData = async (req, res) => {
  try {
    // Extract filters from query string
    // e.g. /api/map?wheelchair=true&senior=false&bbox=minLng,minLat,maxLng,maxLat
    const { wheelchair, senior, bbox } = req.query;

    // Delegate to service to build GeoJSON
    const geojson = await mapService.buildGeoJSON({ wheelchair, senior, bbox });

    // Return the FeatureCollection
    res.json(geojson);
  } catch (err) {
    console.error('mapController.getMapData error:', err);
    res.status(500).json({ error: 'Map data fetch failed' });
  }
};
