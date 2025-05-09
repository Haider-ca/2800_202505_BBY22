const communityService = require('../services/communityService');

exports.getCommunityPosts = async (req, res) => {
  try {
    // Extract query parameters
    const page   = parseInt(req.query.page) || 1;
    const limit  = parseInt(req.query.limit) || 5;
    const sort   = req.query.sort;
    const filter = req.query.filter;
    const search = req.query.q;

    const pois = await communityService.fetchPOIs({ page, limit, sort, filter, search });
    res.json(pois);
  } catch (err) {
    console.error('Failed to fetch community posts:', err);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
};
