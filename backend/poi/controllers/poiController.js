const poiService = require('../services/poiService');

exports.createPOI = async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = req.file.path;

    const newPOI = await poiService.createPOI({ title, description, imageUrl });

    res.status(201).json({ message: 'POI saved', poi: newPOI });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save POI' });
  }
};
