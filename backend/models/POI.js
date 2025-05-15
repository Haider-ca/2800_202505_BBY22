const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  title: String,
  description: String,
  imageUrl: String,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: {
    type: [String],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

poiSchema.index({ coordinates: '2dsphere' });

const POI = mongoose.models.POI || mongoose.model('POI', poiSchema);
module.exports = POI;