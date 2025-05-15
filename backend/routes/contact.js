const express = require('express');
const router = express.Router();
const Contact = require('../models/contactInformation');
const User = require('../models/user'); 

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.session?.userId;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contact = new Contact({
      userId: user._id,
      username: user.name,
      email: user.email,
      title,
      description
    });

    await contact.save();

    res.status(200).json({ message: 'Contact saved successfully!' });
  } catch (err) {
    console.error('❌ Error saving contact:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
