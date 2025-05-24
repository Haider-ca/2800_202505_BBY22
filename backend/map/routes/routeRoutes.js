const express = require('express');
const router = express.Router();
const routeCtrl = require('../controllers/routeController');

router.get('/test', (req, res) => {
  res.json({ message: 'Minimal route works!' });
});

router.get('/saved', routeCtrl.getSavedRoutes);

router.post('/', routeCtrl.createRoute); 

router.get('/', routeCtrl.getAllRoutes);

router.get('/:routeId', routeCtrl.getRouteById);

router.delete('/:routeId', routeCtrl.deleteRouteById);

module.exports = router;
