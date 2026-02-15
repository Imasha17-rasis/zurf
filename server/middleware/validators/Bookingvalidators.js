const { body } = require('express-validator');

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];

exports.validateCalculatePrice = [
    body('surfSpotId')
        .notEmpty().withMessage('surfSpotId is required')
        .isMongoId().withMessage('surfSpotId must be a valid ID'),

    body('durationHours')
        .notEmpty().withMessage('durationHours is required')
        .isInt({ min: 1 }).withMessage('durationHours must be a whole number of at least 1'),

    body('guideId')
        .optional({ nullable: true })
        .isMongoId().withMessage('guideId must be a valid ID'),

    body('gearIds')
        .optional()
        .isArray().withMessage('gearIds must be an array'),

    body('gearIds.*')
        .isMongoId().withMessage('Each gear ID must be a valid ID'),
];

exports.validateCreateBooking = [
    body('surfSpot')
        .notEmpty().withMessage('surfSpot is required')
        .isMongoId().withMessage('surfSpot must be a valid ID'),

    body('bookingDate')
        .notEmpty().withMessage('bookingDate is required')
        .isISO8601().withMessage('bookingDate must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
            if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                throw new Error('bookingDate cannot be in the past');
            }
            return true;
        }),

    body('startTime')
        .notEmpty().withMessage('startTime is required')
        .matches(/^\d{2}:\d{2}$/).withMessage('startTime must be in HH:MM format'),

    body('durationHours')
        .notEmpty().withMessage('durationHours is required')
        .isInt({ min: 1 }).withMessage('durationHours must be a whole number of at least 1'),

    body('guide')
        .optional({ nullable: true })
        .isMongoId().withMessage('guide must be a valid ID'),

    body('gears')
        .optional()
        .isArray().withMessage('gears must be an array'),

    body('gears.*')
        .isMongoId().withMessage('Each gear ID must be a valid ID'),
];

exports.validateUpdateBookingStatus = [
    body('status')
        .notEmpty().withMessage('status is required')
        .isIn(VALID_STATUSES)
        .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
];