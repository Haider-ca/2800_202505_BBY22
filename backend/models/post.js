const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: String,
  mediaUrl: String,
  mediaType: {
    type: String,
    enum: ['image', 'video'],
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
module.exports = Post;