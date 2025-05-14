const express = require('express');
const router = express.Router();
const { uploadSingleImage } = require('../../utils/upload');
const poiController = require('../controllers/poiController');

// upload 
router.post('/', uploadSingleImage, poiController.createPOI);

// Get all POIs for markers
router.get('/markers', poiController.getPOIMarkers);

// Get all POIs
router.get('/all', poiController.getAllPOIs);

// Get favorites POIs
// router.get('/favorites', poiController.getFavoritePOIs);

module.exports = router;
