const cloudinary = require('cloudinary').v2;

// Configure once here so every controller that imports this module
// gets a fully initialised instance, regardless of which route is
// hit first at runtime.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;