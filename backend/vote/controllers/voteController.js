const mongoose = require('mongoose');
const voteService = require('../services/voteService');

// Handle vote request for a specific post
exports.votePost = async (req, res) => {
  const postId = req.params.id;
  const { type, voterId } = req.body;

  // Validate post ID format
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  // Ensure vote type is either 'like' or 'dislike'
  if (!['like', 'dislike'].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  // Ensure voterId is provided (for anonymous voting tracking)
  if (!voterId) {
    return res.status(400).json({ error: 'Missing voterId' });
  }

  try {
    // Call vote service
    const updated = await voteService.votePost(postId, type, voterId);

    // Respond with updated like/dislike counts
    res.json({ likes: updated.likes, dislikes: updated.dislikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Voting failed' });
  }
};
