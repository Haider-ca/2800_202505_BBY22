const express = require('express');
const router = express.Router();

// Import controller functions for profile operations
const { getProfileHandler, updateProfileHandler, deleteProfileHandler, resetPasswordHandler, getUserPOIsHandler, updatePOIHandler, deletePOIHandler } = require('../controllers/profileController');

// Import authentication middleware to protect the routes
const { authMiddleware } = require('../../routes/auth');

// Import file upload middleware for handling avatar uploads
const { uploadSingleImage } = require('../../utils/upload');

// Route to get the logged-in user's profile
router.get('/', authMiddleware, getProfileHandler);

// Route to update the user's profile, including optional avatar upload
router.put('/', authMiddleware, uploadSingleImage, updateProfileHandler);

// Route to delete the user's profile
router.delete('/', authMiddleware, deleteProfileHandler);

// Route to reset the user's password
router.post('/reset-password', authMiddleware, resetPasswordHandler);

// Route to get user's poi posts
router.get('/pois', authMiddleware, getUserPOIsHandler);

// Route to update a user's POI
router.put('/pois/:id', authMiddleware, uploadSingle, updatePOIHandler);

// Route to delete a user's POI
router.delete('/pois/:id', authMiddleware, deletePOIHandler);

module.exports = router;
