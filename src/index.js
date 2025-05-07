// const express = require('express');
// const path = require("path");
// const app = express();
// const port = 8000;

// app.use('main', express.static(path.join(__dirname, 'src')));
// app.use('/static', express.static(path.join(__dirname, 'html')));
// app.use('/css', express.static(path.join(__dirname, 'css')));
// app.use('/script', express.static(path.join(__dirname, 'script')));
// // Serve static HTML partials
// app.use('/partials', express.static(path.join(__dirname, 'html/partials')));

// // Serve GeoJSON data
// app.use('/src/data', express.static(path.join(__dirname, 'data')));

// /** Routes */

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '/html/map.html'));
// });

// app.get("/home", (req, res) => {
//   res.sendFile(path.join(__dirname, '/html/home.html'));
// });

// app.get("/POI", (req, res) => {
//   res.sendFile(path.join(__dirname, '/html/POI.html'));
// });

// app.get("/You", (req, res) => {
//   res.sendFile(path.join(__dirname, '/html/You.html'));
// });


// // /*** DEFAULT ***/


// // app.get("*", (req, res) => {
// //     res.set('Content-Type', 'text/html');
// //     res.sendFile(path.join(__dirname, '/views/not-found.html'));
// //     return res.status(404);
// //   });
  
//    app.listen(port, () => {
//    console.log(`Example app listening on port ${port}`)
//   });