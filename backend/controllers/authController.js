const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { createOTP, verifyOTP, generateCode } = require('../utils/otp');
const emailService = require('../services/emailService');
const googleOAuthService = require('../services/googleOAuthService');
const emailValidator = require('../utils/emailValidator');
const { ROLES } = require('../config/constants');
const { validationResult } = require('express-validator');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

// Sanitize user input
function sanitize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
}

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, username, email, password, role, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must accept Terms & Conditions' });
    }

    if (![ROLES.CUSTOMER, ROLES.PROVIDER].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const safeName = sanitize(name);
    const usernameTrim = sanitize(username);
    const emailNorm = (email || '').toLowerCase().trim();

    if (!usernameTrim) {
      return res.status(400).json({ success: false, message: 'Username required' });
    }

    // Validate email
    const emailValidation = emailValidator.validateEmail(emailNorm);
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: emailValidation.message });
    }

    const emailExists = await User.findOne({ email: emailNorm });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const usernameExists = await User.findOne({ username: usernameTrim });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const user = await User.create({
      name: safeName,
      username: usernameTrim,
      email: emailNorm,
      password,
      role,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    const code = await createOTP(emailNorm);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] OTP for', emailNorm, ':', code);
    }

    try {
      await emailService.sendOTP(emailNorm, code);
    } catch (emailErr) {
      console.error('❌ OTP email send failed during registration:', emailErr.message);
      // User is created but OTP email failed - inform the user
      return res.status(201).json({
        success: true,
        message: 'Account created but OTP email failed to send. Please use "Resend OTP" to try again.',
        data: { userId: user._id, email: user.email },
        emailError: true,
      });
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email',
      data: { userId: user._id, email: user.email },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const valid = await verifyOTP(emailNorm, code);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await User.findOneAndUpdate(
      { email: emailNorm },
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Account verified',
      data: { user, token },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, username, password } = req.body;
    let user;

    if (username !== undefined && username !== null && String(username).trim() !== '') {
      const u = sanitize(username);
      user = await User.findOne({ username: u }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (user.role !== ROLES.ADMIN && !user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email with OTP first' });
      }
    } else if (email !== undefined && email !== null && String(email).trim() !== '') {
      const e = String(email).trim().toLowerCase();
      user = await User.findOne({ email: e }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (user.role === ROLES.ADMIN) {
        return res.status(401).json({ success: false, message: 'Admin must login with username' });
      }
      if (!user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email with OTP first' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Email or username required' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Please login with Google' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const userObj = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: { user: userObj, token },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { idToken, role, termsAccepted } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token required' });
    }
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role required' });
    }

    if (![ROLES.CUSTOMER, ROLES.PROVIDER].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    let googleData;
    try {
      googleData = await googleOAuthService.verifyGoogleToken(idToken);
    } catch (err) {
      return res.status(401).json({ success: false, message: `Google authentication failed: ${err.message}` });
    }

    const emailValidation = emailValidator.validateEmail(googleData.email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: `Email validation failed: ${emailValidation.message}` });
    }

    const emailNorm = googleData.email.toLowerCase().trim();
    const googleId = googleData.googleId;

    let user = await User.findOne({
      $or: [{ googleId }, { email: emailNorm }],
    });

    if (user) {
      if (user.isSuspended) {
        return res.status(403).json({ success: false, message: 'Account suspended' });
      }

      if (!user.isVerified) {
        user.isVerified = true;
        user.termsAcceptedAt = new Date();
        await user.save();
      }

      const token = generateToken(user._id);
      const userObj = await User.findById(user._id).select('-password');
      return res.json({
        success: true,
        message: 'Login successful',
        data: { user: userObj, token },
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must accept Terms & Conditions' });
    }

    const newUser = await User.create({
      name: googleData.name || 'Google User',
      email: emailNorm,
      googleId,
      profilePicture: googleData.picture,
      password: null,
      role,
      authProvider: 'google',
      isVerified: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    try {
      await emailService.sendMail({
        to: newUser.email,
        subject: 'Welcome to Smart Appointment',
        text: `Hello ${newUser.name},\n\nWelcome to Smart Appointment! Your account has been created using Google.\nPlease complete your profile.\n\nBest regards,\nSmart Appointment Team`,
      });
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr.message);
    }

    const token = generateToken(newUser._id);
    const userObj = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Account created with Google successfully',
      data: { user: userObj, token },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validateEmailAddress = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const validation = emailValidator.validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.message, isValid: false });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        isValid: true,
        alreadyRegistered: true,
      });
    }

    return res.json({ success: true, message: 'Email is valid and available', isValid: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const validation = emailValidator.validateEmail(emailNorm);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const otp = generateCode();
    await OTP.deleteMany({ email: emailNorm });
    await OTP.create({
      email: emailNorm,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    try {
      await emailService.sendMail({
        to: emailNorm,
        subject: 'Verify your email - Smart Appointment',
        text: `Your OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.`,
      });
    } catch (emailErr) {
      console.error('OTP email send error:', emailErr.message);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] OTP for', emailNorm, ':', otp);
    }

    res.json({ success: true, message: 'OTP sent to email', expiresIn: 300 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailNorm = String(email).toLowerCase().trim();
    await OTP.deleteMany({ email: emailNorm });

    const otp = generateCode();
    await OTP.create({
      email: emailNorm,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    try {
      await emailService.sendMail({
        to: emailNorm,
        subject: 'Verify your email - Smart Appointment (Resend)',
        text: `Your OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.`,
      });
    } catch (emailErr) {
      console.error('Resend OTP email error:', emailErr.message);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Resent OTP for', emailNorm, ':', otp);
    }

    res.json({ success: true, message: 'OTP resent to email', expiresIn: 300 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGoogleAuthStatus = async (req, res) => {
  try {
    const config = googleOAuthService.getGoogleAuthConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
