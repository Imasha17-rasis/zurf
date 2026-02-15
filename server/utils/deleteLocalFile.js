const fs = require('fs');

/**
 * Silently removes a temp file that Multer wrote to disk.
 * Called after every Cloudinary upload (success or failure) so the
 * local uploads/ directory doesn't accumulate stale files over time.
 *
 * Errors are swallowed intentionally — a failed unlink should never
 * crash the request that is already being handled.
 *
 * @param {string} filePath  Absolute or relative path from req.file.path / file.path
 */
const deleteLocalFile = (filePath) => {
    if (!filePath) return;
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`[deleteLocalFile] Could not remove temp file "${filePath}":`, err.message);
        }
    });
};

module.exports = deleteLocalFile;