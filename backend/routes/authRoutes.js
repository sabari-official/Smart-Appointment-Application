const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('username').trim().notEmpty().withMessage('Username required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least 1 capital letter (A-Z)')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least 1 small letter (a-z)')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least 1 number (0-9)')
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      .withMessage('Password must contain at least 1 special character (!@#$%^&* etc.)'),
    body('role').isIn(['customer', 'provider']).withMessage('Role must be customer or provider'),
    body('termsAccepted').custom((val) => val === true || val === 'true' || val === 1).withMessage('You must accept Terms & Conditions'),
  ],
  authController.register
);

router.post('/verify-otp', authController.verifyOtp);

router.post('/send-otp', authController.sendOtp);

router.post('/resend-otp', authController.resendOtp);

router.post(
  '/login',
  [
    body('password').notEmpty().withMessage('Password required'),
    body().custom((val, { req }) => {
      const hasEmail = req.body.email != null && String(req.body.email).trim() !== '';
      const hasUsername = req.body.username != null && String(req.body.username).trim() !== '';
      if (!hasEmail && !hasUsername) throw new Error('Email or username required');
      return true;
    }),
  ],
  authController.login
);

// Google OAuth Routes
router.post(
  '/google',
  [
    body('idToken').trim().notEmpty().withMessage('Google ID token required'),
    body('role').isIn(['customer', 'provider']).withMessage('Role must be customer or provider'),
    body('termsAccepted')
      .if(() => true)
      .custom((val) => {
        if (val !== undefined && val !== null) {
          return val === true || val === 'true' || val === 1;
        }
        return true;
      })
      .withMessage('You must accept Terms & Conditions'),
  ],
  authController.googleAuth
);

// Validate email endpoint
router.post(
  '/validate-email',
  [body('email').trim().notEmpty().withMessage('Email required')],
  authController.validateEmailAddress
);

// Check if Google OAuth is configured
router.get('/google/status', authController.getGoogleAuthStatus);

module.exports = router;
