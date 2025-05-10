const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../../utils/upload');
const poiController = require('../controllers/poiController');

// upload 
router.post('/', uploadSingle, poiController.createPOI);

// Get all POIs
router.get('/', poiController.getAllPOIs);

module.exports = router;
