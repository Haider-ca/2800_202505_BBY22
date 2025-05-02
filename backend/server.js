//Get environment variables from .env file.
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const PORT = 5001;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/src', express.static(path.join(__dirname, 'src')));

// Connect MongoDB
connectDB();

// Mount route modules
app.use('/api/poi', require('./routes/poi'));
// other routes...

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
