const multer = require('multer');

// memoryStorage keeps the file in req.file.buffer (a Node Buffer) rather than
// writing it to disk. This eliminates the whole class of "temp file left behind
// after a crash" bugs and removes the need for deleteLocalFile entirely.
const storage = multer.memoryStorage();

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  if (file.mimetype === 'application/pdf') {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.array('files', 10);
exports.uploadFields = upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

// Error handling middleware for multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.',
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};