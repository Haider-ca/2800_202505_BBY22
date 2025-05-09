const express = require('express');
const router = express.Router();

// Import controller functions for profile operations
const { getProfileHandler, updateProfileHandler, deleteProfileHandler } = require('../controllers/profileController');

// Import authentication middleware to protect the routes
const { authMiddleware } = require('../../routes/auth');

// Import file upload middleware for handling avatar uploads
const { uploadSingle } = require('../../utils/upload');

// Route to get the logged-in user's profile
router.get('/', authMiddleware, getProfileHandler);

// Route to update the user's profile, including optional avatar upload
router.put('/', authMiddleware, uploadSingle, updateProfileHandler);

// Route to delete the user's profile
router.delete('/', authMiddleware, deleteProfileHandler);

module.exports = router;
