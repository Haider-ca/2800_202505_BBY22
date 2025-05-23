/**
 * poiRoutes.js
 * 
 * This module defines all Express routes related to Point of Interest (POI) operations.
 * It connects client requests to the corresponding controller logic in poiController.js.
 * 
 * Routes:
 * - POST `/`               : Submit a new POI with image upload (requires login).
 * - GET `/markers`        : Get all POIs for map marker display.
 * - GET `/all`            : Get paginated and filtered list of all POIs for feed display.
 * - GET `/favorites`      : Get the current user's saved POIs.
 * - GET `/:id`            : Get a specific POI by its unique ID.
 * 
 * Image uploading is handled using the `uploadSingleImage` middleware.
 */

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
router.get('/favorites', poiController.getSavedPOIs);

// Get a single POI by ID
router.get('/:id', poiController.getPOIById);

module.exports = router;
