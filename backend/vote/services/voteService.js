/**
 * voteService.js
 * 
 * This service handles voting logic (like/dislike) for both posts and POIs.
 * It ensures a user (identified by anonymous `voterId`) can vote only once per item,
 * and allows toggling votes (remove or switch between like and dislike).
 * 
 * Exported Functions:
 * - voteTarget: Handles the logic for voting on a post or POI. 
 *   - If a vote exists and is the same type, it removes the vote.
 *   - If a vote exists and is the opposite type, it switches the vote.
 *   - If no vote exists, it creates a new vote.
 *   - Updates the like/dislike count accordingly.
 * 
 * Parameters:
 * - `type`: 'post' or 'poi' (determines which model to update)
 * - `targetId`: ID of the post or POI being voted on
 * - `voteType`: 'like' or 'dislike'
 * - `voterId`: Unique user identifier from the frontend (anonymous, stored in localStorage)
 */

const Vote = require('../../models/Vote');
const POI = require('../../models/POI');
const Post = require('../../models/post');

exports.voteTarget = async (type, targetId, voteType, voterId) => {
  const Model = type === 'poi' ? POI : Post;
  const targetField = type === 'poi' ? 'poiId' : 'postId';

  const existingVote = await Vote.findOne({ [targetField]: targetId, voterId });

  if (existingVote && existingVote.type === voteType) {
    await Vote.deleteOne({ _id: existingVote._id });
    await Model.findByIdAndUpdate(targetId, {
      $inc: { [voteType === 'like' ? 'likes' : 'dislikes']: -1 }
    });
  } else {
    if (existingVote) {
      await Model.findByIdAndUpdate(targetId, {
        $inc: { [existingVote.type === 'like' ? 'likes' : 'dislikes']: -1 }
      });
      await Vote.deleteOne({ _id: existingVote._id });
    }

    const voteData = {
      voterId,
      type: voteType
    };
    
    if (type === 'post') {
      voteData.postId = targetId;
    } else if (type === 'poi') {
      voteData.poiId = targetId;
    }
    
    await Vote.create(voteData);
    
    await Model.findByIdAndUpdate(targetId, {
      $inc: { [voteType === 'like' ? 'likes' : 'dislikes']: 1 },
      $set: { updatedAt: new Date() }
    });
  }

  const updated = await Model.findById(targetId);
  return updated;
};
