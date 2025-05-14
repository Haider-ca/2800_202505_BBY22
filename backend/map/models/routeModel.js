const mongoose = require('mongoose');
const { Schema } = mongoose;

const routeSchema = new Schema({
  poi: { type: Schema.Types.ObjectId, ref: 'POI', required: false },
  profile:    { type: String, required: true },
  name:       { type: String, required: true },
  description:{ type: String },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: { type: [[Number]], required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', routeSchema);
