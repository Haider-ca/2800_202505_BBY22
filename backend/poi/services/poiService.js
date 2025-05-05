const POI = require('../../models/POI');

exports.createPOI = async ({ title, description, imageUrl }) => {
  const newPOI = new POI({ title, description, imageUrl });
  return await newPOI.save();
};
