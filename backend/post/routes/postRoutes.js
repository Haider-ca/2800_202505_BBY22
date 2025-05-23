/**
 * postRoutes.js
 * 
 * This route module defines all Express endpoints related to general community posts.
 * It handles post creation, retrieval, and fetching saved posts for the current user.
 * 
 * Routes:
 * - POST `/`            : Create a new post with optional media upload (image or video).
 * - GET `/all`          : Fetch a paginated list of general posts (with sorting, filtering, and search).
 * - GET `/favorites`    : Retrieve posts that the current user has saved.
 * 
 * Media uploads are handled via the `uploadSingleMedia` middleware before passing to the controller.
 */

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
