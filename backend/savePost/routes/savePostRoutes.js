const express = require('express');
const router = express.Router();
const controller = require('../controllers/savePostController');

router.post('/:type/:id', controller.savePost);
router.delete('/:type/:id', controller.unsavePost);

module.exports = router;