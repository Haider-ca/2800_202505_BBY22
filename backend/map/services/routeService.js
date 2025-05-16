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
