const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator
 * Returns 400 with error messages if validation fails
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().map((e) => e.msg).join(', '),
            errors: errors.array(),
        });
    }
    next();
};

/**
 * Sanitize request body: trim strings, remove HTML tags
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/<[^>]*>/g, '').trim();
            }
        }
    }
    next();
};

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
    const id = req.params[paramName];
    if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ success: false, message: `Invalid ${paramName} format` });
    }
    next();
};

module.exports = { validate, sanitizeBody, validateObjectId };
