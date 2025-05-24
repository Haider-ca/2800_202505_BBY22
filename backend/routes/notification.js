const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Poi = require('../models/POI');
const User = require('../models/user');

router.get('/', async (req, res) => {
  if (!req.session?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const lastChecked = new Date(req.query.lastChecked);

    const [posts, pois] = await Promise.all([
      Post.find({ userId: user._id }),
      Poi.find({ userId: user._id })
    ]);

    const allItems = posts.concat(pois);
    const latestUpdated = allItems
      .filter(item => item.updatedAt > lastChecked)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0]; 

    const hasNew = !!latestUpdated;

    let type = null;
    if (latestUpdated) {
      type = posts.some(p => p._id.equals(latestUpdated._id)) ? 'post' : 'poi';
    }

    res.json({
      hasNew,
      latestId: latestUpdated?._id,
      type
    });
  } catch (err) {
    console.error('Notification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


