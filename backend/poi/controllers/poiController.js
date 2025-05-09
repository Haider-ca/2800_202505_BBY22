const poiService = require('../services/poiService');
const POI = require('../../models/POI');

// exports.createPOI = async (req, res) => {
//   try {
//     const { title, description, lng, lat } = req.body;
//     const imageUrl = req.file.path;
//     const coordinates = {
//       type: 'Point',
//       coordinates: [parseFloat(lng), parseFloat(lat)]
//     };

//     const newPOI = await poiService.createPOI({ title, description, imageUrl, coordinates });

//     res.status(201).json({ message: 'POI saved', poi: newPOI });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to save POI' });
//   }
// };
exports.createPOI = async (req, res) => {
  try {
    console.log("✅ [createPOI] Controller triggered");
console.log("🧾 title:", title);
console.log("🧾 lng / lat:", lng, lat);
console.log("🖼️ imageUrl:", req.file?.secure_url || req.file?.path || 'undefined');

    console.log("📥 [POI] req.body:", req.body);
    console.log("📷 [POI] req.file:", req.file);

    const { title, description, lng, lat } = req.body;

    // 安全地提取 Cloudinary 返回的图片链接
    const imageUrl = req.file?.secure_url || req.file?.path || '';

    if (!imageUrl) {
      return res.status(400).json({ error: "Image upload failed or image not provided" });
    }

    const coordinates = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };

    const newPOI = await poiService.createPOI({
      title,
      description,
      imageUrl,
      coordinates
    });

    console.log("✅ POI saved:", newPOI);
    res.status(201).json({ message: 'POI saved', poi: newPOI });
  } catch (err) {
    console.error("❌ [createPOI] Error stack:", err.stack);
    console.error("❌ [createPOI] Error message:", err.message);
    res.status(500).json({
      error: 'Failed to save POI',
      detail: err.message,
      stack: err.stack
    });
  }  
};


exports.getAllPOIs = async (req, res) => {
  try {
    const allPOIs = await POI.find({});
    res.json(allPOIs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch POIs' });
  }
};
