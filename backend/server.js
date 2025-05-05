require('dotenv').config({path:'../.env'});
const express = require('express');
const connectDB = require('./config/databaseConnection');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
connectDB();
app.use(express.static(path.join(__dirname,'../public')));
app.use(express.static(path.join(__dirname,'../src')));

app.use(express.json());
app.use('/api', authRoutes);  // ⬅️ Mount the auth router

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
