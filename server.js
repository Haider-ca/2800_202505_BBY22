const express = require('express');
const connectDB = require('./backend/config/databaseConnection');
const authRoutes = require('./backend/routes/auth');
require('dotenv').config();

const app = express();
connectDB();
app.use(express.static('public'));
app.use(express.static('src'));

app.use(express.json());
app.use('/api', authRoutes);  // ⬅️ Mount the auth router

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
