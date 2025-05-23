/**
 * savePostController.js
 * 
 * This controller handles saving and unsaving content (posts or POIs) to a user's profile.
 * It works for both content types by accepting a dynamic `type` parameter in the route.
 * 
 * Exported Functions:
 * - savePost: Adds a specified post or POI to the user's saved items.
 * - unsavePost: Removes a specified post or POI from the user's saved items.
 * 
 * Supported types: 'post', 'poi'
 * Requires the user to be logged in (via session).
 */

const saveService = require('../services/savePostService');

exports.savePost = async (req, res) => {
  const { type, id } = req.params;
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ error: 'Not logged in' });
  if (!['post', 'poi'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

  try {
    await saveService.saveToUser(userId, type, id);
    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Save failed' });
  }
};

exports.unsavePost = async (req, res) => {
  const { type, id } = req.params;
  const userId = req.session.userId;

  try {
    await saveService.removeFromUser(userId, type, id);
    res.status(200).json({ message: 'Un-saved' });
  } catch (err) {
    console.error('Unsave error:', err);
    res.status(500).json({ error: 'Unsave failed' });
  }
};
