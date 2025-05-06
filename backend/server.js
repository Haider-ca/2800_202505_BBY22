// backend/server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const favicon   = require('serve-favicon');
const connectDB = require('./config/db');

const app = express();
connectDB();

// serve favicon
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));

// middlewares
app.use(cors());
app.use(express.json());

// static assets
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'src')));

// API endpoints
app.use('/api/map', require('./map/routes/mapRoutes'));
app.use('/api/poi', require('./poi/routes/poiRoutes'));

// mount directionsRoutes at /api so that GET /api/directions works
app.use('/api', require('./map/routes/directionsRoutes'));

// health-check
app.get('/', (req, res) => res.send('API is running...'));

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
