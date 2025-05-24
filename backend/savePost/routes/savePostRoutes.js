/**
 * savePostRoutes.js
 * 
 * This route module handles saving and unsaving posts or POIs to a user's saved list.
 * It supports two content types: 'post' and 'poi', passed as a route parameter.
 * 
 * Routes:
 * - POST `/:type/:id`     : Save the specified post or POI to the current user's saved items.
 * - DELETE `/:type/:id`   : Remove the specified post or POI from the user's saved items.
 * 
 * Requires user to be logged in. `type` must be either 'post' or 'poi'.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/savePostController');

router.post('/:type/:id', controller.savePost);
router.delete('/:type/:id', controller.unsavePost);

module.exports = router;