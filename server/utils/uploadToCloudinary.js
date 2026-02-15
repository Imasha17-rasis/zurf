const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer directly to Cloudinary without touching the disk.
 * Used by all controllers that receive multipart uploads via multer memoryStorage.
 *
 * @param {Buffer} buffer   - req.file.buffer or similar
 * @param {object} options  - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<object>} Cloudinary upload result (contains secure_url, public_id, etc.)
 */
const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(buffer);
    });
};

module.exports = uploadToCloudinary;