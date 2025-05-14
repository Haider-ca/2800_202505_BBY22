const multer = require('multer'); // handlle the upload file
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // upload file to Cloudinary
const cloudinary = require('../config/cloudinary');

// Setup Cloudinary storage engine
// Image uploader
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pathpal-images',
    resource_type: 'image'
  }
});

// Video uploader
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pathpal-videos',
    resource_type: 'video'
  }
});

// Detect media type based on file (used for general post uploads)
const autoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: isVideo ? 'pathpal-videos' : 'pathpal-images',
      resource_type: isVideo ? 'video' : 'image'
    };
  }
});

// Expose middlewares
const uploadSingleImage = multer({ storage: imageStorage }).single('image');
const uploadMultipleImages = multer({ storage: imageStorage }).array('images', 5);
const uploadVideo = multer({ storage: videoStorage }).single('video');
const uploadSingleMedia = multer({ storage: autoStorage }).single('media');

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadVideo,
  uploadSingleMedia
};
