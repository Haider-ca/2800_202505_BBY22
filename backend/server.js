//Get environment variables from .env file.
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect MongoDB
connectDB();

// CORS setup
app.use(cors()); 

// Middleware
app.use(express.json()); // Parse incoming JSON
app.use('/src', express.static(path.join(__dirname, 'src'))); // Serve static files if needed

// Mount route modules
app.use('/api/poi', require('./routes/poi'));
// add your routes here...

// Basic test route to confirm the API server is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handler (catch all server errors)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
