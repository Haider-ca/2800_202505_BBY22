const saveService = require('../services/savePostService');

exports.savePost = async (req, res) => {
  const { type, id } = req.params;
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ error: 'Not logged in' });
  if (!['post', 'poi'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

  try {
    await saveService.saveToUser(userId, type, id);
    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Save failed' });
  }
};

exports.unsavePost = async (req, res) => {
  const { type, id } = req.params;
  const userId = req.session.userId;

  try {
    await saveService.removeFromUser(userId, type, id);
    res.status(200).json({ message: 'Un-saved' });
  } catch (err) {
    console.error('Unsave error:', err);
    res.status(500).json({ error: 'Unsave failed' });
  }
};
