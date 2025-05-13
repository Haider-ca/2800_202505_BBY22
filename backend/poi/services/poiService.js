const POI = require('../../models/POI');

exports.createPOI = async ({userId, username, title, description, imageUrl, coordinates, tags }) => {
  const newPOI = new POI({ userId, username, title, description, imageUrl, coordinates, tags });
  return await newPOI.save();
};
