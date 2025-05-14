const { getProfile, updateProfile, deleteProfile, resetPassword, getUserPOIs, updatePOI, deletePOI } = require('../services/profileService');

// Handler for retrieving the user's profile based on the session email
const getProfileHandler = async (req, res) => {
    try {
        const profile = await getProfile(req.session.email);
        res.json(profile);
    } catch (error) {
        res.status(404).json('Failed to get profile');
    }
};

// Handler for updating the user's profile
const updateProfileHandler = async (req, res) => {
    try {
        // Check if session email exists
        if (!req.session.email) {
            throw new Error('Session email is missing. Please log in again.');
        }

        const updates = req.body;

        // If an image file was uploaded, update the avatar path
        if (req.file) {
            updates.avatar = req.file.path;
        }
        // If image is expected but not properly uploaded
        else if (req.body.image) {
            return res.status(400).json({ error: 'Failed to upload image' });
        }

        // Update the profile with new data
        const profile = await updateProfile(req.session.email, updates);

        // If email was updated, update the session email to the new value
        if (updates.email && updates.email !== req.session.email) {
            req.session.email = updates.email;
        }

        res.json(profile);
    } catch (error) {
        res.status(400).json('Failed to update profile');
    }
};

// Handler for deleting the user's profile and ending the session
const deleteProfileHandler = async (req, res) => {
    try {
        const result = await deleteProfile(req.session.email);
        req.session.destroy(); // Destroy session after deleting profile
        res.json(result);
    } catch (error) {
        res.status(400).json('Failed to delete profile');
    }
};

// Handler to reset the user's password
const resetPasswordHandler = async (req, res) => {
    try {
        const { newPassword } = req.body;
        await resetPassword(req.user.id, newPassword);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to reset password' });
    }
};

// Handler to get the user's POIs
const getUserPOIsHandler = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('req.user or _id is undefined:', req.user);
            return res.status(401).json({ message: 'User not authenticated or _id missing' });
        }
        const userId = req.user._id;
        const { limit, page, sort, filter, q } = req.query;
        const pois = await getUserPOIs(userId, limit, page, sort, filter, q);
        res.status(200).json(pois);
    } catch (error) {
        console.error('Get user POIs error:', error);
        res.status(500).json({ message: error.message || 'Failed to get user POIs' });
    }
};

// Handler to update a user's POI
const updatePOIHandler = async (req, res) => {
    try {
        // Check if session email exists
        if (!req.session.email) {
            throw new Error('Session email is missing. Please log in again.');
        }

        const poiId = req.params.id;
        const updates = req.body;

        const tags = updates.tags ? JSON.parse(updates.tags) : [];
        const coordinates = updates.coordinates ? JSON.parse(updates.coordinates) : [];

        // If a file was uploaded, pass the file path to the service
        const filePath = req.file ? req.file.path : null;

        // Update the POI with new data
        const updatedPOI = await updatePOI(req.session.email, poiId, {
            title: updates.title,
            description: updates.description,
            tags: tags,
            coordinates: coordinates,
            filePath: filePath // Pass file path to service for upload
        });

        res.json(updatedPOI);
    } catch (error) {
        console.error('Error updating POI:', error);
        res.status(400).json({ message: error.message || 'Failed to update POI' });
    }
};

// Delete a user's POI
const deletePOIHandler = async (req, res) => {
    try {
        const email = req.session.email;
        const poiId = req.params.id;
        const result = await deletePOI(email, poiId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting POI:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getProfileHandler,
    updateProfileHandler,
    deleteProfileHandler,
    resetPasswordHandler,
    getUserPOIsHandler,
    updatePOIHandler,
    deletePOIHandler
};
