const { validationResult } = require('express-validator');

/**
 * Runs after a chain of express-validator checks.
 * If any check failed, returns 422 with a structured error list so the
 * client knows exactly which fields are invalid and why.
 * If all checks passed, calls next() and the controller runs normally.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((e) => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }

    next();
};

module.exports = validate;