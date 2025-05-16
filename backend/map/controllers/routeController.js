const routeService = require('../services/routeService');

exports.createRoute = async (req, res) => {
  try {
const payload = {
  profile:     req.body.profile,
  name:        req.body.name,
  description: req.body.description,
  geometry:    req.body.geometry,
  steps:       req.body.steps,
  summary:     req.body.summary
};

    const route = await routeService.save(payload);
    res.status(201).json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not save route' });
  }
};

exports.getRoutesByPoi = async (req, res) => {
  try {
    const routes = await routeService.findByPoi(req.params.poiId);
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load routes' });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await routeService.findById(req.params.routeId);
    if (!route) return res.status(404).json({ message: 'Not found' });
    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load route' });
  }
};

exports.deleteRouteById = async (req, res) => {
  try {
    await routeService.deleteById(req.params.routeId);
    res.json({ message: 'Route deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete route' });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await routeService.findAll();
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load routes' });
  }
};
