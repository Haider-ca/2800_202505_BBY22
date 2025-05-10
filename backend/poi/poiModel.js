const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  tags: [String],
  likes: Number,
  dislikes: Number,
  comments: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  username: String
});

module.exports = mongoose.model('POI', poiSchema);
