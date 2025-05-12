const { getProfile, updateProfile, deleteProfile } = require('../services/profileService');

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

module.exports = {
    getProfileHandler,
    updateProfileHandler,
    deleteProfileHandler,
};
