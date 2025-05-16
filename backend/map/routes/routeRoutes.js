const express = require('express');
const router = express.Router();
const routeCtrl = require('../controllers/routeController');

router.get('/test', (req, res) => {
  res.json({ message: 'Minimal route works!' });
});

router.post('/', routeCtrl.createRoute); 

router.get('/:routeId', routeCtrl.getRouteById);

router.delete('/:routeId', routeCtrl.deleteRouteById);

router.get('/', routeCtrl.getAllRoutes);

module.exports = router;
