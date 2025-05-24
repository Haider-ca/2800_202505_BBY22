const mongoose = require('mongoose');
const { Schema } = mongoose;

const routeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  poi: { type: Schema.Types.ObjectId, ref: 'POI', required: false },
  profile:    { type: String, required: true },
  name:       { type: String, required: true },
  description:{ type: String },
  startAddress: { type: String },
  endAddress: { type: String },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: { type: [[Number]], required: true }
  },
  steps: [
    {
      instruction: String,
      distance: String,
      duration: String
    }
  ],
  summary: {
    distance: String,
    duration: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', routeSchema);
