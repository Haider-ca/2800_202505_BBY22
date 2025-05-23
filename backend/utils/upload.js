/**
 * This module configures and exports Cloudinary-based file upload middlewares using Multer.
 * It supports uploading images, videos, or detecting media type dynamically for general use.
 * 
 * Upload Types:
 * - `uploadSingleImage` – Upload a single image (used in POI submissions).
 * - `uploadMultipleImages` – Upload up to 5 images at once (optional use).
 * - `uploadVideo` – Upload a single video file.
 * - `uploadSingleMedia` – Automatically detects whether the file is image or video and uploads accordingly.
 * 
 * All uploads are stored in separate Cloudinary folders: `pathpal-images` and `pathpal-videos`.
 * 
 * Dependencies:
 * - Multer: Handles multipart form data
 * - Multer-Storage-Cloudinary: Connects Multer with Cloudinary
 * - Cloudinary config: Provided via `../config/cloudinary`
 */

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
