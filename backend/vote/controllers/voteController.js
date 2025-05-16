const mongoose = require('mongoose');
const voteService = require('../services/voteService');

// Handle vote request for a specific post
exports.votePost = async (req, res) => {
  // const postId = req.params.id;
  // const { type, voterId } = req.body;
  const { type: modelType, id: targetId } = req.params;
  const { type: voteType, voterId } = req.body;

  if (!['post', 'poi'].includes(modelType)) {
    return res.status(400).json({ error: 'Invalid content type' });
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (!['like', 'dislike'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  if (!voterId) {
    return res.status(400).json({ error: 'Missing voterId' });
  }

  try {
    const updated = await voteService.voteTarget(modelType, targetId, voteType, voterId);

    res.json({ likes: updated.likes, dislikes: updated.dislikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Voting failed' });
  }
};
