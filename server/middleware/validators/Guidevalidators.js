const { body } = require('express-validator');

const specialtiesEnum = [
  'Beginner Lessons',
  'Advanced Techniques',
  'Reef Breaks',
  'Beach Breaks',
  'Wave Selection',
  'Safety Training',
  'Video Analysis',
  'Group Lessons',
  'Ocean Safety',
  'Longboarding',
  'Shortboarding',
  'Competition Prep',
  'Kids Lessons',
  'Barrel Riding',
  'Point Breaks'
];

exports.validateCreateGuideProfile = [
    body('experienceYears')
        .notEmpty().withMessage('experienceYears is required')
        .isInt({ min: 0, max: 70 }).withMessage('experienceYears must be between 0 and 70'),

    body('pricePerSession')
        .notEmpty().withMessage('pricePerSession is required')
        .isFloat({ min: 0 }).withMessage('pricePerSession must be a non-negative number'),

    body('surfSpot')
        .optional({ nullable: true })
        .isMongoId().withMessage('surfSpot must be a valid ID'),

    body('availability')
        .optional()
        .isArray().withMessage('availability must be an array'),

    body('availability.*')
        .isISO8601().withMessage('Each availability entry must be a valid date'),

    body('specialties')
        .optional()
        .isArray().withMessage('specialties must be an array'),

    body('specialties.*')
        .isIn(specialtiesEnum).withMessage('Each specialty must be from the allowed list'),

    body('rating')
        .optional()
        .isFloat({ min: 0, max: 5 }).withMessage('rating must be between 0 and 5'),

    body('totalReviews')
        .optional()
        .isInt({ min: 0 }).withMessage('totalReviews must be a non-negative integer'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean')
];

// All fields optional on update
exports.validateUpdateGuideProfile = [
    body('experienceYears')
        .optional()
        .isInt({ min: 0, max: 70 }).withMessage('experienceYears must be between 0 and 70'),

    body('pricePerSession')
        .optional()
        .isFloat({ min: 0 }).withMessage('pricePerSession must be a non-negative number'),

    body('surfSpot')
        .optional({ nullable: true })
        .isMongoId().withMessage('surfSpot must be a valid ID'),

    body('availability')
        .optional()
        .isArray().withMessage('availability must be an array'),

    body('availability.*')
        .isISO8601().withMessage('Each availability entry must be a valid date'),

    body('specialties')
        .optional()
        .isArray().withMessage('specialties must be an array'),

    body('specialties.*')
        .isIn(specialtiesEnum).withMessage('Each specialty must be from the allowed list'),

    body('rating')
        .optional()
        .isFloat({ min: 0, max: 5 }).withMessage('rating must be between 0 and 5'),

    body('totalReviews')
        .optional()
        .isInt({ min: 0 }).withMessage('totalReviews must be a non-negative integer'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean')
];