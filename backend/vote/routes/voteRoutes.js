/**
 * voteRoutes.js
 * 
 * This route module handles voting actions (like/dislike) for posts and POIs.
 * 
 * Routes:
 * - POST `/:type/:id` : Submit a like or dislike vote for a post or POI.
 *   - `type`: content type ('post' or 'poi')
 *   - `id`: ID of the content to vote on
 *   - Body must include:
 *     - `voterId`: an anonymous ID (e.g. from localStorage)
 *     - `type`: either 'like' or 'dislike'
 * 
 * All voting logic is handled in the voteController.
 */

const express = require('express');
const router = express.Router();
const { votePost } = require('../controllers/voteController');

router.post('/:type/:id', votePost);

module.exports = router;