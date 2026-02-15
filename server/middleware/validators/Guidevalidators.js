const { body } = require('express-validator');

exports.validateCreateGuideProfile = [
    body('experienceYears')
        .notEmpty().withMessage('experienceYears is required')
        .isInt({ min: 0 }).withMessage('experienceYears must be a non-negative integer'),

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
];

// All fields optional on update
exports.validateUpdateGuideProfile = [
    body('experienceYears')
        .optional()
        .isInt({ min: 0 }).withMessage('experienceYears must be a non-negative integer'),

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
];