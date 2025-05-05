// backend/map/routes/mapRoutes.js
// MAP MODULE — DO NOT MODIFY

const express       = require('express');
const mapController = require('../controllers/mapController');
const router        = express.Router();

// GET /api/map?wheelchair=true&senior=false&bbox=minLng,minLat,maxLng,maxLat
router.get('/', mapController.getMapData);

module.exports = router;
