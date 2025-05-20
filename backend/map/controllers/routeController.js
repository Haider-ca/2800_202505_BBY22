const routeService = require('../services/routeService');

exports.createRoute = async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: 'Not logged in' });
    const payload = {
      userId,
      profile:     req.body.profile,
      name:        req.body.name,
      description: req.body.description,
      geometry:    req.body.geometry,
      steps:       req.body.steps,
      summary:     req.body.summary,
      startAddress: req.body.startAddress,
      endAddress: req.body.endAddress
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
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Not logged in' });

    const route = await routeService.findById(req.params.routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });

    if (route.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this route' });
    }

    await routeService.deleteById(req.params.routeId);
    res.json({ message: 'Route deleted' });
  } catch (err) {
    console.error('Error deleting route:', err);
    res.status(500).json({ message: 'Could not delete route' });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const search = req.query.q;

    const routes = await routeService.fetchRoutes({
      page, limit, sort, search,
      userId: req.session?.userId || null
    });

    res.json(routes);
  } catch (err) {
    console.error('Failed to fetch routes:', err);
    res.status(500).json({ error: 'Server error while fetching routes' });
  }
};

exports.getSavedRoutes = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.q;
    const direction = req.query.direction || 'desc';

    const routes = await routeService.fetchUserRoutes({
      userId,
      page,
      limit,
      search,
      direction
    });

    res.json(routes);
  } catch (err) {
    console.error('Error fetching saved routes:', err);
    res.status(500).json({ error: 'Failed to fetch saved routes' });
  }
};
