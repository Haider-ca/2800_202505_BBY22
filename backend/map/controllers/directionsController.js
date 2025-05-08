// backend/map/controllers/directionsController.js

const { getRoute } = require('../services/directionsService');

exports.directions = async (req, res) => {
  try {
    const { start, end, profile } = req.query;
    const route = await getRoute(start, end, profile);
    res.json(route);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
