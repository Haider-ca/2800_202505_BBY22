/**
 * voteController.js
 * 
 * This controller handles voting logic (like/dislike) for both posts and POIs.
 * It performs input validation and delegates the voting logic to voteService.
 * 
 * Supported content types: 'post', 'poi'
 * 
 * Exported Functions:
 * - votePost: Validates vote request and updates the like/dislike count on the specified content.
 *   Requires:
 *   - `modelType` (in URL params): either 'post' or 'poi'
 *   - `id` (in URL params): the ID of the target document
 *   - `voteType` (in body): either 'like' or 'dislike'
 *   - `voterId` (in body): anonymous voter ID stored in localStorage on the client side
 */

const mongoose = require('mongoose');
const voteService = require('../services/voteService');

// Handle vote request for a specific post
exports.votePost = async (req, res) => {
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
