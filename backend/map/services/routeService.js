const Route = require('../models/routeModel');

exports.save = async (payload) => {
  return await Route.create(payload);
};

exports.findById = async (routeId) => {
  return await Route.findById(routeId);
};

exports.findByPoi = async (poiId) => {
  return await Route.find({ poi: poiId });
};

exports.deleteById = async (routeId) => {
  return await Route.findByIdAndDelete(routeId);
};

exports.findAll = async () => {
  return await Route.find().sort({ createdAt: -1 });
};

// Paginated, searchable, sortable fetch of all routes
exports.fetchRoutes = async ({ page, limit, sort, search }) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (search) {
    query.$or = [
      { startAddress: { $regex: search, $options: 'i' } },
      { endAddress: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOption = { createdAt: -1 };

  return await Route.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
};

// Fetch saved routes by user with pagination, search, and sort
exports.fetchUserRoutes = async ({ userId, page, limit, search, direction = 'desc' }) => {
  const skip = (page - 1) * limit;
  const query = { userId };

  if (search) {
    query.$or = [
      { startAddress: { $regex: search, $options: 'i' } },
      { endAddress: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOrder = direction === 'asc' ? 1 : -1;

  return await Route.find(query)
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(limit);
};
