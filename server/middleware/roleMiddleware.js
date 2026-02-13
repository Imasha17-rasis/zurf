// Authorize based on user roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is verified
exports.checkVerified = (req, res, next) => {
  if (!req.user.isVerified && req.user.role !== 'surfer') {
    return res.status(403).json({
      success: false,
      message: 'Your account is not verified yet. Please wait for admin approval.'
    });
  }
  next();
};