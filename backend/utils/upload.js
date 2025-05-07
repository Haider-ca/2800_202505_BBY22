const multer = require('multer'); // handlle the upload file
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // upload file to Cloudinary
const cloudinary = require('../config/cloudinary');

// Setup Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pathpal-images',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

// Expose two middlewares: single and array
const uploadSingle = multer({ storage }).single('image');
const uploadMultiple = multer({ storage }).array('images', 5);

module.exports = {
  uploadSingle,
  uploadMultiple
};
