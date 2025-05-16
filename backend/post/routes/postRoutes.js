const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { uploadSingleMedia } = require('../../utils/upload');

// upload 
router.post('/', uploadSingleMedia, postController.createPost);

// Get all Posts
router.get('/all', postController.getAllPosts);

// Get favorites Posts
router.get('/favorites', postController.getSavedPosts);

module.exports = router;
