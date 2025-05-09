const POI = require('../../models/POI');

exports.createPOI = async ({ title, description, imageUrl, coordinates, tags }) => {
  const newPOI = new POI({ title, description, imageUrl, coordinates, tags });
  return await newPOI.save();
};
