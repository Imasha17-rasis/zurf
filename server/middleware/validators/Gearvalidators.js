const { body } = require('express-validator');

// Must match the enum in server/models/Gear.js
const GEAR_TYPES = ['board', 'wetsuit', 'leash', 'fins', 'other'];

exports.validateAddGear = [
    body('surfSpot')
        .notEmpty().withMessage('surfSpot is required')
        .isMongoId().withMessage('surfSpot must be a valid ID'),

    body('name')
        .trim()
        .notEmpty().withMessage('Gear name is required'),

    body('type')
        .notEmpty().withMessage('Gear type is required')
        .isIn(GEAR_TYPES)
        .withMessage(`type must be one of: ${GEAR_TYPES.join(', ')}`),

    body('pricePerHour')
        .notEmpty().withMessage('pricePerHour is required')
        .isFloat({ min: 0 }).withMessage('pricePerHour must be a non-negative number'),

    body('quantityAvailable')
        .notEmpty().withMessage('quantityAvailable is required')
        .isInt({ min: 0 }).withMessage('quantityAvailable must be a non-negative integer'),
];

// All fields optional on update — only validate the ones present
exports.validateUpdateGear = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('name cannot be empty'),

    body('type')
        .optional()
        .isIn(GEAR_TYPES)
        .withMessage(`type must be one of: ${GEAR_TYPES.join(', ')}`),

    body('pricePerHour')
        .optional()
        .isFloat({ min: 0 }).withMessage('pricePerHour must be a non-negative number'),

    body('quantityAvailable')
        .optional()
        .isInt({ min: 0 }).withMessage('quantityAvailable must be a non-negative integer'),
];