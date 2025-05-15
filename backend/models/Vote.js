const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  poiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'POI',
    required: false,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: false,
  },
  type: { type: String, enum: ['like', 'dislike'], required: true },
}, { timestamps: true });

voteSchema.index({ voterId: 1, poiId: 1 }, { unique: true });

// Ensure either poiId or postId is present
voteSchema.pre('validate', function (next) {
  if (!this.poiId && !this.postId) {
    this.invalidate('poiId', 'Either poiId or postId must be provided');
  }
  next();
});

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);
module.exports = Vote;
