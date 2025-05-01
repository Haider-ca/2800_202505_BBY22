// db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("🚨  MONGODB_URI is undefined! Check your .env.");
}

// ← Insert this line to print out exactly what you’re connecting to:
console.log('🔗 Connecting to MongoDB at:', uri);

let dbClient;

async function connect() {
  if (!dbClient) {
    dbClient = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🌐 MongoDB connected');
  }
  return dbClient.db(); // or .db('mydbname') if you want to force a specific DB
}

module.exports = { connect };
