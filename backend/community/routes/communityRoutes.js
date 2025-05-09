const express = require('express');
const router = express.Router();
const { getCommunityPosts } = require('../controllers/communityController');

// GET /api/community?page=1&limit=5&sort=likes&filter=wheelchair,bench
router.get('/', getCommunityPosts);

module.exports = router;
