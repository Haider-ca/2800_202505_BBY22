const mongoose = require('mongoose');
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
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Delete all POIs of the user before deleting the user
  const userId = user._id;
  const userPOIs = await POI.find({ userId });
  for (const poi of userPOIs) {
    if (poi.imageUrl && poi.imageUrl.startsWith('https://res.cloudinary.com')) {
      const publicId = poi.imageUrl.split('/').slice(-1)[0].split('.')[0];
      try {
        await cloudinary.uploader.destroy(`pathpal-images/${publicId}`);
      } catch (error) {
        console.error('Failed to delete POI image on Cloudinary:', error);
      }
    }
  }
  await POI.deleteMany({ userId });

  // Delete avatar from Cloudinary if it exists there
  if (user.avatar && user.avatar.startsWith('https://res.cloudinary.com')) {
    const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
    try {
      await cloudinary.uploader.destroy(`pathpal-images/${publicId}`);
    } catch (error) {
      console.error('Failed to delete image on Cloudinary:', error);
    }
  }

  // Delete the user profile after deleting POIs
  await User.findOneAndDelete({ email });

  return { message: 'Profile deleted successfully' };
};

// Fetch user's POIs based on userId, with optional pagination, sorting, filtering, and search
const getUserPOIs = async (userId, limit, page, sort, filter, q) => {
  const query = {};
  let userIdObj;

  if (!userId) {
    throw new Error('userId is undefined or null');
  }

  // Handle userId: If it's an ObjectId object, convert to string; then create a new ObjectId
  let userIdStr = userId;
  if (userId instanceof mongoose.Types.ObjectId) {
    userIdStr = userId.toString();
  } else if (typeof userId !== 'string') {
    throw new Error(`Invalid userId type: ${typeof userId}, value: ${userId}`);
  }

  // Turn userId string into ObjectId
  if (mongoose.Types.ObjectId.isValid(userIdStr)) {
    userIdObj = new mongoose.Types.ObjectId(userIdStr);
  } else {
    throw new Error(`Invalid userId format: ${userIdStr}`);
  }

  // Use the ObjectId directly in the query
  query.userId = userIdObj;

  if (q) query.description = { $regex: q, $options: 'i' };
  if (filter) {
    const filters = filter.split(',').map(f => f.trim());
    query.tags = { $in: filters };
  }
  const skip = (page - 1) * (limit || 5);

  // Fetch POIs
  const pois = await POI.find(query)
    .sort({ [sort || 'createdAt']: -1 })
    .limit(limit ? parseInt(limit) : 5)
    .skip(skip || 0);

  // Fetch user to get avatar
  const user = await User.findById(userIdObj).select('avatar');
  if (!user) throw new Error('User not found');

  // Map POIs and include user's avatar
  return pois.map(poi => ({
    _id: poi._id,
    userId: poi.userId,
    username: poi.username || '',
    title: poi.title || '',
    description: poi.description || '',
    imageUrl: poi.imageUrl || '',
    coordinates: poi.coordinates ? poi.coordinates.coordinates : [], // Extract [longitude, latitude] from GeoJSON
    tags: poi.tags || [],
    likes: poi.likes || 0,
    dislikes: poi.dislikes || 0,
    comments: poi.comments || [],
    createdAt: poi.createdAt,
    avatar: user.avatar || '/public/img/defaultUser.png' // Add user's avatar to each POI
  }));
};

// Update a user's POI based on email and POI ID
const updatePOI = async (email, poiId, updates) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const poi = await POI.findById(poiId);
  if (!poi) {
    throw new Error('POI not found');
  }
  if (poi.userId.toString() !== user._id.toString()) {
    throw new Error('Unauthorized to update this POI');
  }
  let imageUrl = poi.imageUrl;
  if (updates.filePath) {
    try {
      // Upload the new image to Cloudinary
      const result = await cloudinary.uploader.upload(updates.filePath, { folder: 'pathpal-images' });
      imageUrl = result.secure_url;

      // Delete the old image from Cloudinary if it exists
      if (poi.imageUrl && poi.imageUrl.startsWith('https://res.cloudinary.com')) {
        const publicId = poi.imageUrl.split('/').slice(-1)[0].split('.')[0];
        try {
          await cloudinary.uploader.destroy(`pathpal-images/${publicId}`);
        } catch (error) {
          console.error('Failed to delete old image on Cloudinary:', error);
        }
      }
    } catch (uploadError) {
      console.error('Failed to upload new image to Cloudinary:', uploadError);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  // Update other POI fields if provided
  poi.title = updates.title || poi.title;
  poi.description = updates.description || poi.description;
  poi.tags = updates.tags || poi.tags;
  poi.imageUrl = imageUrl; // Update imageUrl with the new or existing value

  // Save and return the updated POI
  const updatedPOI = await POI.findByIdAndUpdate(poiId, poi, { new: true, runValidators: true });
  return {
    _id: updatedPOI._id,
    userId: updatedPOI.userId,
    username: updatedPOI.username || '',
    title: updatedPOI.title || '',
    description: updatedPOI.description || '',
    imageUrl: updatedPOI.imageUrl || '',
    coordinates: updatedPOI.coordinates ? updatedPOI.coordinates.coordinates : [], // Extract [longitude, latitude] from GeoJSON
    tags: updatedPOI.tags || [],
    likes: updatedPOI.likes || 0,
    dislikes: updatedPOI.dislikes || 0,
    comments: updatedPOI.comments || [],
    createdAt: updatedPOI.createdAt
  };
};

// Delete a user's POI based on email and POI ID
const deletePOI = async (email, poiId) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const poi = await POI.findById(poiId);
  if (!poi) {
    throw new Error('POI not found');
  }
  if (poi.userId.toString() !== user._id.toString()) {
    throw new Error('Unauthorized to delete this POI');
  }
  if (poi.imageUrl && poi.imageUrl.startsWith('https://res.cloudinary.com')) {
    const publicId = poi.imageUrl.split('/').slice(-1)[0].split('.')[0];
    try {
      await cloudinary.uploader.destroy(`pathpal-images/${publicId}`);
    } catch (error) {
      console.error('Failed to delete image on Cloudinary:', error);
    }
  }

  // Delete the POI from the database
  await POI.findByIdAndDelete(poiId);
  return { message: 'POI deleted successfully' };
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  resetPassword,
  getUserPOIs,
  updatePOI,
  deletePOI
};
