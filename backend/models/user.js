const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema with email and password fields
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  }
});

// Hash the password before saving the user document
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);            // Generate a salt
    this.password = await bcrypt.hash(this.password, salt);  // Hash the password
    next();
  } catch (err) {
    next(err);
  }
});

// Add a method to compare a given password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
