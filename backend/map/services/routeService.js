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