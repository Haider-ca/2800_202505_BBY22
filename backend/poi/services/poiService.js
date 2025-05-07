const POI = require('../../models/POI');

exports.createPOI = async ({ title, description, imageUrl, coordinates }) => {
  const newPOI = new POI({ title, description, imageUrl, coordinates });
  return await newPOI.save();
};
