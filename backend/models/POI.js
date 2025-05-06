const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  createdAt: { type: Date, default: Date.now }
});

poiSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('POI', poiSchema);
