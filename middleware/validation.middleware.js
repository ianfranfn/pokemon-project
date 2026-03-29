import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  // Define validation and sanitization rules
  body('email') // 'email' input validation
    .isEmail()
    .withMessage('Email format is not valid.') // should be an email
    .normalizeEmail(), // Sanitize: Converts the email to lowercase and delete periods.

  body('password')
    .isLength({ min: 6 })
    .withMessage('The password should have (at least) 6 characters.'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(400).json({
      errors: extractedErrors,
    });
  },
];
