const poiService = require('../services/poiService');
const POI = require('../../models/POI');

exports.createPOI = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    const userId = req.session.userId;
    const username = req.session.name;

    const { title, description, lng, lat, tags } = req.body;
    const imageUrl = req.file.path;
    const coordinates = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };

    const parsedTags = tags ? JSON.parse(tags) : [];
    const newPOI = await poiService.createPOI({ 
      userId, 
      username,
      title, 
      description, 
      imageUrl, 
      coordinates, 
      tags: parsedTags });

    res.status(201).json({ message: 'POI saved', poi: newPOI });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save POI' });
  }
};

exports.getAllPOIs = async (req, res) => {
  try {
    const allPOIs = await POI.find({});
    res.json(allPOIs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch POIs' });
  }
};
