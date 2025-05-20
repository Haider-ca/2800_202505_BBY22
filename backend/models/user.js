const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '/public/img/defaultUser.png'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  userType: {
    type: String,
    enum: ['senior', 'wheelchair', 'caregiver'],
    default: 'caregiver'
  },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  savedPOIs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'POI' }]
});

// Add a method to compare a given password with the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
