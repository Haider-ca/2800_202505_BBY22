const User = require('../../models/User');

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