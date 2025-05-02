
require('dotenv').config();      // looks for .env in project root
const express = require('express');
const path = require("path");
//const app = express();
const port = 8000;
const { connect } = require('./db');  // relative to server.js

async function start() {
  const db = await connect();
  const app = express();
  app.use('/main', express.static(path.join(__dirname, 'src')));
app.use('/static', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, '../src/css')));
app.use('/script', express.static(path.join(__dirname, '../src/script')));
app.use('/partials', express.static(path.join(__dirname, '../src/html/partials')));
app.use('/src/data', express.static(path.join(__dirname, '../src/data')));
app.use('/public', express.static(path.join(__dirname, '../public')));

/** Routes */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/html/map.html'));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, '../src/html/home.html'));
});

app.get("/POI", (req, res) => {
  res.sendFile(path.join(__dirname, '../src/html/POI.html'));
});

app.get("/You", (req, res) => {
  res.sendFile(path.join(__dirname, '../src/html/You.html'));
});


// /*** DEFAULT ***/


// app.get("*", (req, res) => {
//     res.set('Content-Type', 'text/html');
//     res.sendFile(path.join(__dirname, '/views/not-found.html'));
//     return res.status(404);
//   });
  
   app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
  });

}

start().catch(console.error);
