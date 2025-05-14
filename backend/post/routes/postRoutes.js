const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadSingleMedia } = require('../../utils/upload');

// upload 
router.post('/', uploadSingleMedia, postController.createPost);

// // Get all POIs
// router.get('/all', poiController.getAllPOIs);

// // Get favorites POIs
// // router.get('/favorites', poiController.getFavoritePOIs);

module.exports = router;
