const express = require('express');
const router = express.Router();
const { votePost } = require('../controllers/voteController');

router.post('/:type/:id', votePost);

module.exports = router;