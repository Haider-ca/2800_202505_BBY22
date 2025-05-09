const Vote = require('../../models/Vote');
const POI = require('../../models/POI');

exports.votePost = async (postId, type, voterId) => {
  const existingVote = await Vote.findOne({ poiId: postId, voterId });

  if (existingVote && existingVote.type === type) {
    // If the same vote is cast again, treat it as a cancel
    await Vote.deleteOne({ _id: existingVote._id });
    await POI.findByIdAndUpdate(postId, {
      $inc: { [type === 'like' ? 'likes' : 'dislikes']: -1 }
    });
  } else {
    // If switching vote direction, first remove the previous vote
    if (existingVote) {
      await POI.findByIdAndUpdate(postId, {
        $inc: { [existingVote.type === 'like' ? 'likes' : 'dislikes']: -1 }
      });
      await Vote.deleteOne({ _id: existingVote._id });
    }

    // Add new vote
    await Vote.create({ poiId: postId, type, voterId });
    await POI.findByIdAndUpdate(postId, {
      $inc: { [type === 'like' ? 'likes' : 'dislikes']: 1 }
    });
  }

  // Return the latest vote count
  const poi = await POI.findById(postId);
  return poi;
};
