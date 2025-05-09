const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  poiId: { type: mongoose.Schema.Types.ObjectId, ref: 'POI', required: true },
  type: { type: String, enum: ['like', 'dislike'], required: true },
}, { timestamps: true });

voteSchema.index({ voterId: 1, poiId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
