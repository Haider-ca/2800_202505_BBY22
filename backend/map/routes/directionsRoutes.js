// backend/map/routes/directionsRoutes.js

const express = require('express');
const { directions } = require('../controllers/directionsController');
const router = express.Router();

router.get('/directions', directions);

module.exports = router;
