const express = require('express');
const router = express.Router();
const routeCtrl = require('../controllers/routeController');

router.get('/test', (req, res) => {
  res.json({ message: 'Minimal route works!' });
});

router.post('/', routeCtrl.createRoute); 

router.get('/:routeId', routeCtrl.getRouteById);

module.exports = router;
