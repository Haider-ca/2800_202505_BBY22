// backend/map/routes/directionsRoutes.js
const express = require('express');
const router  = express.Router();
const { getRoute } = require('../services/directionsService');

router.get('/directions', async (req, res, next) => {
  const { start, end, profile } = req.query;
  if (!start || !end) {
    return res.status(400).json({ message: 'start and end parameters are required' });
  }
  try {
    const route = await getRoute(start, end, profile);
    res.json(route);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
