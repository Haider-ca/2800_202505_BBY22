/**
 * poiController.js
 * 
 * This controller handles all server-side logic related to Points of Interest (POIs).
 * It manages creation, retrieval, filtering, and saved POIs functionality.
 * All functions return JSON responses and are protected by login checks where required.
 * 
 * Exported Functions:
 * - createPOI: Creates and saves a new POI submitted by a logged-in user.
 * - getPOIMarkers: Returns all POIs for map marker display.
 * - getAllPOIs: Retrieves a paginated list of POI posts with support for filtering, sorting, and search.
 * - getSavedPOIs: Returns the current user's saved POIs with pagination and filters.
 * - getPOIById: Fetches a single POI by its ID.
 */

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
      tags: parsedTags
    });

    res.status(201).json({ message: 'POI saved', poi: newPOI });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save POI' });
  }
};

exports.getPOIMarkers = async (req, res) => {
  try {
    const allPOIs = await POI.find({});
    res.json(allPOIs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch POIs' });
  }
};

exports.getAllPOIs = async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const filter = req.query.filter;
    const search = req.query.q;

    const pois = await poiService.fetchPOIs({ page, limit, sort, filter, search });
    await POI.populate(pois, { path: 'userId', select: 'avatar' });
    res.json(pois);
  } catch (err) {
    console.error('Failed to fetch POI posts:', err);
    res.status(500).json({ error: 'Server error while fetching POI posts' });
  }
};

// Get saved POIs
exports.getSavedPOIs = async (req, res) => {
  // Extract query parameters
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const filter = req.query.filter;
    const search = req.query.q;

    const pois = await poiService.fetchSavedPOIs({
      userId,
      page,
      limit,
      sort,
      filter,
      search
    });
    res.json(pois);
  } catch (err) {
    console.error('Failed to fetch saved POIs:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get POI by Id
exports.getPOIById = async (req, res) => {
  try {
    const poi = await POI.findById(req.params.id);
    if (!poi) return res.status(404).json({ error: 'POI not found' });
    res.json(poi);
  } catch (err) {
    console.error('Failed to fetch POI by ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
};