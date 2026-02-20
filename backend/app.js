require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('./config/constants');

const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// CORS Configuration
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true); // Allow all for dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disable for API
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: Prevent parameter pollution
app.use((req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
});

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI.windowMs,
  max: RATE_LIMITS.AI.max,
  message: { success: false, message: 'AI rate limit exceeded, please wait' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// Health Check
app.get('/health', (req, res) =>
  res.json({
    ok: true,
    message: 'Smart Appointment API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
);

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      success: false,
      message: `${field || 'Field'} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message || 'Server error',
  });
});

module.exports = app;
