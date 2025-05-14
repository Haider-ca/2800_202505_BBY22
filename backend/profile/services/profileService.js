const User = require('../../models/user');
const cloudinary = require('../../config/cloudinary');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const POI = require('../../models/POI');

// Fetch user profile by email, excluding password hash
const getProfile = async (email) => {
  const user = await User.findOne({ email }).select('-passwordHash');
  if (!user) throw new Error('User not found');

  // Return formatted profile data with defaults for missing fields
  return {
    _id: user._id,
    email: user.email || '',
    avatar: user.avatar || '/public/img/defaultUser.png',
    name: user.name || '',
    description: user.description || '',
  };
};

// Update user profile based on email and update data
const updateProfile = async (email, updates) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // If avatar is being updated and it's different from the current one
  if (updates.avatar && updates.avatar !== user.avatar) {
    // Delete the old avatar from Cloudinary if it's hosted there
    if (user.avatar && user.avatar.startsWith('https://res.cloudinary.com')) {
      const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
      try {
        await cloudinary.uploader.destroy(`pathpal-images/${publicId}`);
      } catch (error) {
        console.error('Failed to delete old image on Cloudinary:', error);
      }
    }
    user.avatar = updates.avatar;
  }

  // Update other profile fields if provided
  user.email = updates.email || user.email;
  user.name = updates.name || user.name;
  user.description = updates.description || user.description;

  // Save and return the updated user profile
  const updatedUser = await User.findOneAndUpdate({ email }, user, { new: true, runValidators: true });
  return {
    _id: updatedUser._id,
    email: updatedUser.email || '',
    avatar: updatedUser.avatar || '/public/img/defaultUser.png',
    name: updatedUser.name || '',
    description: updatedUser.description || '',
  };
};

// Service to reset the user's password
const resetPassword = async (userId, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.passwordHash = hashedPassword;

    await user.save();
  } catch (error) {
    throw error;
  }
};

// Delete a user profile and their avatar image if stored on Cloudinary
const deleteProfile = async (email) => {
  const user = await User.findOneAndDelete({ email });
  if (!user) throw new Error('User not found');

  // Delete avatar from Cloudinary if it exists there
  if (user.avatar && user.avatar.startsWith('https://res.cloudinary.com')) {
    const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
    try {
      await cloudinary.uploader.destroy(`pathpal-images/${publicId}`);
    } catch (error) {
      console.error('Failed to delete image on Cloudinary:', error);
    }
  }

  return { message: 'Profile deleted successfully' };
};

// Fetch user's POIs based on userId, with optional pagination, sorting, filtering, and search
const getUserPOIs = async (userId, limit, page, sort, filter, q) => {
  const query = {};
  let userIdStr = '';
  if (userId && typeof userId === 'object' && userId.toString) {
    userIdStr = userId.toString();
  } else if (userId) {
    userIdStr = userId;
  } else {
    throw new Error('userId is undefined or invalid');
  }

  query.userId = userIdStr;

  if (q) query.description = { $regex: q, $options: 'i' };
  if (filter) {
    const filters = filter.split(',').map(f => f.trim());
    query.tags = { $in: filters };
  }
  const skip = (page - 1) * (limit || 5);
  return await POI.find(query)
    .sort({ [sort || 'createdAt']: -1 })
    .limit(limit ? parseInt(limit) : 5)
    .skip(skip || 0);
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  resetPassword,
  getUserPOIs
};
