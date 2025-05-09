const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../../utils/upload');
const poiController = require('../controllers/poiController');

// upload 
router.post('/', uploadSingle, poiController.createPOI);

// 🌟 这是你的测试上传接口
router.post('/test-upload', uploadSingle, (req, res) => {
    console.log("🧪 [TEST] req.body:", req.body);
    console.log("🧪 [TEST] req.file:", req.file);
  
    if (!req.file) {
      return res.status(400).json({ error: "❌ File upload failed — req.file is undefined" });
    }
  
    res.status(200).json({
      message: "✅ Upload successful",
      fileInfo: req.file
    });
  });

  
// Get all POIs
router.get('/', poiController.getAllPOIs);

module.exports = router;
