// services/voteService.js
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
