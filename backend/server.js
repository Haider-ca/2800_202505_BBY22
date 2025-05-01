
require('dotenv').config();      // looks for .env in project root
const express = require('express');
const { connect } = require('./db');  // relative to server.js

async function start() {
  const db = await connect();
  const app = express();
  // … your routes …
  app.listen(process.env.PORT || 3000, () =>
    console.log('🚀 Server running')
  );
}

start().catch(console.error);
