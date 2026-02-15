const { body } = require('express-validator');

exports.validateCreateSurfSpot = [
    body('name')
        .trim()
        .notEmpty().withMessage('Surf spot name is required'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),

    body('pricePerHour')
        .notEmpty().withMessage('pricePerHour is required')
        .isFloat({ min: 0 }).withMessage('pricePerHour must be a non-negative number'),

    body('location.country')
        .trim()
        .notEmpty().withMessage('location.country is required'),

    body('location.city')
        .trim()
        .notEmpty().withMessage('location.city is required'),

    body('location.coordinates.lat')
        .notEmpty().withMessage('location.coordinates.lat is required')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    body('location.coordinates.lng')
        .notEmpty().withMessage('location.coordinates.lng is required')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
];

// All fields are optional on update — only validate the ones that are present
exports.validateUpdateSurfSpot = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('name cannot be empty'),

    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('description cannot be empty'),

    body('pricePerHour')
        .optional()
        .isFloat({ min: 0 }).withMessage('pricePerHour must be a non-negative number'),

    body('location.country')
        .optional()
        .trim()
        .notEmpty().withMessage('location.country cannot be empty'),

    body('location.city')
        .optional()
        .trim()
        .notEmpty().withMessage('location.city cannot be empty'),

    body('location.coordinates.lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    body('location.coordinates.lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
];