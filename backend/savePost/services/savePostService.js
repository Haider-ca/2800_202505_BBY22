/**
 * savePostService.js
 * 
 * This service handles the logic for saving and unsaving content (POIs or general posts)
 * to and from a user's saved list. It updates the corresponding field in the User model.
 * 
 * Exported Functions:
 * - saveToUser: Adds a post or POI ID to the user's `savedPosts` or `savedPOIs` array,
 *               depending on the type. Prevents duplicate entries.
 * - removeFromUser: Removes a post or POI ID from the corresponding saved array.
 * 
 * Supported types: 'post' and 'poi'
 */

const User = require('../../models/user');

exports.saveToUser = async (userId, type, targetId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const field = type === 'poi' ? 'savedPOIs' : 'savedPosts';
  if (user[field].includes(targetId)) return;

  user[field].push(targetId);
  await user.save();
};

exports.removeFromUser = async (userId, type, targetId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const field = type === 'poi' ? 'savedPOIs' : 'savedPosts';
  user[field] = user[field].filter(id => id.toString() !== targetId);
  await user.save();
};