const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../utils/upload');
const POI = require('../models/POI');

router.post('/', uploadSingle, async (req, res) => {
  try {
    const { title, description } = req.body;
    //const imageUrls = req.files.map(file => file.path); //upload multipule photos (!!!use uploadMultiple)
    const imageUrl = req.file.path; // upload one photo

    //create POI object
    const newPOI = new POI({ title, description, imageUrl });
    // insert data to MongoDB
    await newPOI.save();

    res.status(201).json({ message: 'POI saved', poi: newPOI });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save POI' });
  }
});

module.exports = router;