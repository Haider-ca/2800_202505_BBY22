// backend/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  // use MONGODB_URI (not MONGO_URI)
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pathpal';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
