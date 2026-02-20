const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized - no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token structure' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const role = (...allowed) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (allowed.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: `Access denied. Required role: ${allowed.join(' or ')}`,
  });
};

module.exports = { protect, role };
