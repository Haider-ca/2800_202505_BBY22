const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  email: String,
  title: String,
  description: String,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
