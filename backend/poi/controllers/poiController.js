const poiService = require('../services/poiService');
const POI = require('../../models/POI');

exports.createPOI = async (req, res) => {
  try {
    const { title, description, lng, lat, tags } = req.body;
    const imageUrl = req.file.path;
    const coordinates = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };

    const parsedTags = tags ? JSON.parse(tags) : [];
    const newPOI = await poiService.createPOI({ title, description, imageUrl, coordinates, tags: parsedTags });

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
