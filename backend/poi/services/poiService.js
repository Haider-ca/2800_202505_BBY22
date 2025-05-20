const POI = require('../../models/POI');
const User = require('../../models/user');
const { addLatLngToPOIs } = require('../../utils/poiHelpers');

exports.createPOI = async ({ userId, username, title, description, imageUrl, coordinates, tags }) => {
  const newPOI = new POI({ userId, username, title, description, imageUrl, coordinates, tags });
  return await newPOI.save();
};


// Fetch all POIs with pagination, sorting, filtering, and optional search
exports.fetchPOIs = async ({ page, limit, sort, filter, search }) => {
  // Calculate how many documents to skip for pagination
  const skip = (page - 1) * limit;
  // Determine sort order: by likes or by creation date
  const sortOption = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

  // Parse filter tags (comma-separated list)
  const filters = filter
    ? filter.split(',').map(f => f.trim().toLowerCase())
    : [];

  const filterQuery = {};

  // If filters are provided, match POIs with any of the specified tags
  if (filters.length > 0) {
    filterQuery.tags = { $in: filters };
  }

  // If search term is provided, perform a case-insensitive search in title or description
  if (search) {
    filterQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Execute query
  const rawPOIs = await POI.find(filterQuery)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();
  return addLatLngToPOIs(rawPOIs);
};

// Fetch saved POIs with pagination, sorting, filtering, and optional search
exports.fetchSavedPOIs = async ({ userId, page, limit, sort, filter, search }) => {
  const user = await User.findById(userId);
  const savedPOIIds = user.savedPOIs || [];
  const skip = (page - 1) * limit;
  const sortOption = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

  const query = { _id: { $in: savedPOIIds } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (filter) {
    const tags = filter.split(',').map(f => f.trim().toLowerCase());
    query.tags = { $in: tags };
  }

  const pois = await POI.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();

  await POI.populate(pois, { path: 'userId', select: 'avatar' });

  // Mark saved flag
  if (userId) {
    const user = await User.findById(userId);
    const savedSet = new Set(user.savedPOIs.map(id => id.toString()));
    pois.forEach(poi => {
      poi.isSaved = savedSet.has(poi._id.toString());
    });
  }

  return addLatLngToPOIs(pois);
};