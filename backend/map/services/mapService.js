// MAP MODULE — DO NOT MODIFY
const POI = require('../../models/POI');

exports.buildGeoJSON = async ({ wheelchair, senior, bbox }) => {
  const filter = {};
  if (wheelchair != null) filter.wheelchairFriendly = wheelchair === 'true';
  if (senior    != null) filter.seniorFriendly   = senior    === 'true';
  if (bbox) {
    const [minLng,minLat,maxLng,maxLat] = bbox.split(',').map(Number);
    filter.location = { $geoWithin: { $box: [[minLng,minLat],[maxLng,maxLat]] } };
  }

  const docs = await POI.find(filter).lean();
  return {
    type: 'FeatureCollection',
    features: docs.map(d => ({
      type:     'Feature',
      geometry: d.location,
      properties: {
        id:                 d._id,
        title:              d.title,
        description:        d.description,
        wheelchairFriendly: d.wheelchairFriendly,
        seniorFriendly:     d.seniorFriendly,
        imageUrl:           d.imageUrl
      }
    }))
  };
};
