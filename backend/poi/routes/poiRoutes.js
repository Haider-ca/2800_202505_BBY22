const express = require('express');
const router = express.Router();
const POI = require('../../models/POI');


const { uploadSingle } = require('../../utils/upload');
const poiController = require('../controllers/poiController');

// upload 
router.post('/', uploadSingle, poiController.createPOI);

// Get all POIs
router.get('/', async (req, res) => {
    try {
      const pois = await POI.find({});
      res.json(pois);
    } catch (err) {
      console.error('Error fetching POIs:', err);
      res.status(500).json({ message: 'Failed to fetch POIs' });
    }
  });

module.exports = router;
