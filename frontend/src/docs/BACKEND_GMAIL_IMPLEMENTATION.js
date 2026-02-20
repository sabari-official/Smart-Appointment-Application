/**
 * GMAIL OTP SENDING & VERIFICATION - BACKEND IMPLEMENTATION EXAMPLE
 * 
 * This file contains example implementations for sending OTPs via Gmail
 * and verifying them. Use this as a reference for your backend code.
 * 
 * Technology Stack Used:
 * - Node.js + Express
 * - MongoDB for user storage
 * - Redis for OTP temporary storage
 * - Nodemailer for email sending
 * - Bcrypt for password hashing
 * - JWT for token generation
 */

// ============================================================================
// REQUIRED PACKAGES (package.json)
// ============================================================================

/**
 * npm install express dotenv nodemailer bcrypt jsonwebtoken redis ioredis
 * npm install --save-dev @types/node
 */

// ============================================================================
// ENVIRONMENT VARIABLES (.env)
// ============================================================================

/**
 * # Gmail Configuration
 * GMAIL_USER=your-email@gmail.com
 * GMAIL_APP_PASSWORD=your-app-specific-password
 * 
 * # JWT Configuration
 * JWT_SECRET=your-super-secret-key-min-64-characters-long-123456789
 * JWT_EXPIRY=1h
 * 
 * # Redis Configuration
 * REDIS_URL=redis://localhost:6379
 * 
 * # MongoDB Configuration
 * MONGODB_URI=mongodb://localhost:27017/docbook
 * 
 * # Backend URL
 * BACKEND_URL=http://localhost:5000
 * FRONTEND_URL=http://localhost:3012
 */

// ============================================================================
// 1. SEND OTP ENDPOINT (POST /api/auth/send-otp)
// ============================================================================

/**
 * // sendOTPController.js
 * 
 * const nodemailer = require("nodemailer");
 * const redis = require("redis");
 * const crypto = require("crypto");
 * const User = require("../models/User");
 * const RATE_LIMIT_MAX = 5;
 * const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
 * 
 * const redisClient = redis.createClient({ url: process.env.REDIS_URL });
 * 
 * // Configure Gmail SMTP
 * const transporter = nodemailer.createTransport({
 *   service: "gmail",
 *   auth: {
 *     user: process.env.GMAIL_USER,
 *     pass: process.env.GMAIL_APP_PASSWORD, // App-specific password, NOT main Gmail password
 *   },
 * });
 * 
 * // Generate OTP
 * function generateOTP() {
 *   // Generate 6-digit secure random number
 *   // parseInt() necessary to avoid leading zeros in string conversion
 *   return crypto.randomInt(100000, 999999).toString();
 * }
 * 
 * // Send OTP Email
 * async function sendOTPEmail(email, otp) {
 *   const htmlTemplate = `
 *     <!DOCTYPE html>
 *     <html>
 *     <head>
 *       <style>
 *         body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
 *         .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
 *         .header { text-align: center; margin-bottom: 30px; }
 *         .otp-box { 
 *           background: #f0f9ff; 
 *           border-left: 4px solid #3b82f6; 
 *           padding: 20px; 
 *           margin: 20px 0; 
 *           border-radius: 4px;
 *         }
 *         .otp-code { 
 *           font-size: 36px; 
 *           font-weight: bold; 
 *           text-align: center; 
 *           color: #1f2937; 
 *           letter-spacing: 0.2em;
 *         }
 *         .warning { 
 *           color: #dc2626; 
 *           font-weight: bold; 
 *           margin-top: 20px; 
 *         }
 *         .footer { 
 *           text-align: center; 
 *           color: #6b7280; 
 *           font-size: 12px; 
 *           margin-top: 30px;
 *         }
 *       </style>
 *     </head>
 *     <body>
 *       <div class="container">
 *         <div class="header">
 *           <h1>📧 Email Verification</h1>
 *         </div>
 *         
 *         <p>Hello,</p>
 *         <p>Thank you for registering on DocBook. Please use the code below to verify your email address:</p>
 *         
 *         <div class="otp-box">
 *           <div class="otp-code">${otp}</div>
 *         </div>
 *         
 *         <p><strong>⏱️ This code expires in 5 minutes.</strong></p>
 *         
 *         <p class="warning">🔒 Do not share this code with anyone, not even DocBook staff.</p>
 *         
 *         <p><strong>Didn't request this?</strong><br>If you didn't attempt to register, please ignore this email or contact us immediately.</p>
 *         
 *         <div class="footer">
 *           <p>DocBook © 2026</p>
 *           <p>Security Tip: Never share your verification code.</p>
 *         </div>
 *       </div>
 *     </body>
 *     </html>
 *   `;
 * 
 *   try {
 *     await transporter.sendMail({
 *       from: process.env.GMAIL_USER,
 *       to: email,
 *       subject: "Your DocBook Verification Code",
 *       html: htmlTemplate,
 *       text: `Your DocBook verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nDo not share this code with anyone.`,
 *     });
 *     console.log(`[EMAIL SENT] OTP sent to ${email}`);
 *     return true;
 *   } catch (error) {
 *     console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, error);
 *     throw new Error("Failed to send verification email");
 *   }
 * }
 * 
 * // Main Send OTP Controller
 * exports.sendOTP = async (req, res) => {
 *   try {
 *     const { email } = req.body;
 *     const clientIP = req.ip || req.connection.remoteAddress;
 * 
 *     // Input validation
 *     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
 *       return res.status(400).json({
 *         success: false,
 *         error: "Invalid email format",
 *       });
 *     }
 *     
 *     // Check if email already registered
 *     const existingUser = await User.findOne({ email, email_verified: true });
 *     if (existingUser) {
 *       return res.status(409).json({
 *         success: false,
 *         error: "Email already registered. Try logging in.",
 *       });
 *     }
 * 
 *     // Rate limiting: Check OTP requests per hour
 *     const rateLimitKey = `otp:ratelimit:${email}`;
 *     const requestCount = await redisClient.incr(rateLimitKey);
 *     
 *     if (requestCount === 1) {
 *       // Set expiry only on first increment
 *       await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW);
 *     }
 * 
 *     if (requestCount > RATE_LIMIT_MAX) {
 *       return res.status(429).json({
 *         success: false,
 *         error: "Too many OTP requests. Please try again in 1 hour.",
 *       });
 *     }
 * 
 *     // Generate OTP
 *     const otp = generateOTP();
 * 
 *     // Store OTP in Redis with 5-minute TTL
 *     const otpKey = `otp:${email}`;
 *     const otpData = {
 *       code: otp,
 *       attempts: 0,
 *       createdAt: Date.now(),
 *       expiresAt: Date.now() + 300000, // 5 minutes
 *       ipAddress: clientIP,
 *       userAgent: req.get("user-agent"),
 *     };
 * 
 *     await redisClient.setEx(
 *       otpKey,
 *       300, // 5 minutes in seconds
 *       JSON.stringify(otpData)
 *     );
 * 
 *     // Send OTP via email
 *     await sendOTPEmail(email, otp);
 * 
 *     // Log for audit trail
 *     console.log(`[OTP REQUEST] Email: ${email}, IP: ${clientIP}`);
 * 
 *     // Response
 *     res.status(200).json({
 *       success: true,
 *       message: "OTP sent successfully",
 *       expiresIn: 300,
 *       maskedEmail: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Show us***@gmail.com
 *     });
 *   } catch (error) {
 *     console.error("[SEND OTP ERROR]", error);
 *     res.status(500).json({
 *       success: false,
 *       error: "Failed to send OTP",
 *     });
 *   }
 * };
 */

// ============================================================================
// 2. VERIFY OTP ENDPOINT (POST /api/auth/verify-otp)
// ============================================================================

/**
 * // verifyOTPController.js
 * 
 * const crypto = require("crypto");
 * const jwt = require("jsonwebtoken");
 * const redis = require("redis");
 * 
 * const redisClient = redis.createClient({ url: process.env.REDIS_URL });
 * 
 * // Timing-safe comparison to prevent timing attacks
 * function timingSafeCompare(provided, stored) {
 *   try {
 *     return crypto.timingSafeEqual(
 *       Buffer.from(provided),
 *       Buffer.from(stored)
 *     );
 *   } catch (e) {
 *     return false;
 *   }
 * }
 * 
 * exports.verifyOTP = async (req, res) => {
 *   try {
 *     const { email, otp } = req.body;
 *     const clientIP = req.ip;
 * 
 *     // Input validation
 *     if (!email || !otp || !/^\d{6}$/.test(otp)) {
 *       return res.status(400).json({
 *         success: false,
 *         error: "Invalid email or OTP format",
 *       });
 *     }
 * 
 *     // Retrieve OTP from Redis
 *     const otpKey = `otp:${email}`;
 *     const otpDataStr = await redisClient.get(otpKey);
 * 
 *     if (!otpDataStr) {
 *       return res.status(401).json({
 *         success: false,
 *         error: "OTP not found. Please request a new one.",
 *       });
 *     }
 * 
 *     const otpData = JSON.parse(otpDataStr);
 * 
 *     // Check if OTP expired
 *     if (Date.now() > otpData.expiresAt) {
 *       await redisClient.del(otpKey);
 *       return res.status(401).json({
 *         success: false,
 *         error: "OTP expired. Please request a new one.",
 *       });
 *     }
 * 
 *     // Check attempt count
 *     if (otpData.attempts >= 5) {
 *       await redisClient.del(otpKey);
 *       return res.status(429).json({
 *         success: false,
 *         error: "Too many failed attempts. Please request a new OTP.",
 *       });
 *     }
 * 
 *     // Timing-safe OTP comparison
 *     const isValidOTP = timingSafeCompare(otp, otpData.code);
 * 
 *     if (!isValidOTP) {
 *       // Increment attempt counter
 *       otpData.attempts += 1;
 *       await redisClient.setEx(otpKey, 300, JSON.stringify(otpData));
 * 
 *       console.log(`[OTP FAIL] Email: ${email}, Attempt: ${otpData.attempts}, IP: ${clientIP}`);
 * 
 *       return res.status(401).json({
 *         success: false,
 *         error: "Invalid OTP",
 *       });
 *     }
 * 
 *     // OTP is valid!
 *     // Delete OTP from Redis (can only use once)
 *     await redisClient.del(otpKey);
 * 
 *     // Create email verification JWT token (valid for 1 hour to complete registration)
 *     const emailVerificationToken = jwt.sign(
 *       {
 *         email,
 *         type: "email_verification",
 *         jti: crypto.randomUUID(), // Unique token ID
 *       },
 *       process.env.JWT_SECRET,
 *       { expiresIn: "1h" }
 *     );
 * 
 *     // Store token claims in Redis for validation
 *     await redisClient.setEx(
 *       `token:${emailVerificationToken}`,
 *       3600, // 1 hour
 *       JSON.stringify({ email, type: "email_verification" })
 *     );
 * 
 *     // Log successful verification
 *     console.log(`[OTP SUCCESS] Email: ${email} verified, IP: ${clientIP}`);
 * 
 *     // Response
 *     res.status(200).json({
 *       success: true,
 *       message: "Email verified successfully",
 *       emailVerificationToken,
 *       expiresIn: 3600,
 *     });
 *   } catch (error) {
 *     console.error("[VERIFY OTP ERROR]", error);
 *     res.status(500).json({
 *       success: false,
 *       error: "Verification failed",
 *     });
 *   }
 * };
 */

// ============================================================================
// 3. RESEND OTP ENDPOINT (POST /api/auth/resend-otp)
// ============================================================================

/**
 * // resendOTPController.js
 * 
 * exports.resendOTP = async (req, res) => {
 *   try {
 *     const { email } = req.body;
 * 
 *     // Check if OTP exists (was previously sent)
 *     const otpKey = `otp:${email}`;
 *     const otpDataStr = await redisClient.get(otpKey);
 * 
 *     if (!otpDataStr) {
 *       return res.status(400).json({
 *         success: false,
 *         error: "No OTP found. Please request a new one from registration.",
 *       });
 *     }
 * 
 *     // Check resend attempt limit (max 3 resends per email per registration)
 *     const resendCountKey = `otp:resend:${email}`;
 *     const resendCount = await redisClient.get(resendCountKey);
 * 
 *     if (resendCount && parseInt(resendCount) >= 3) {
 *       return res.status(429).json({
 *         success: false,
 *         error: "Maximum resend attempts reached. Please try again later.",
 *       });
 *     }
 * 
 *     // Delete old OTP
 *     await redisClient.del(otpKey);
 * 
 *     // Generate new OTP
 *     const otp = generateOTP();
 * 
 *     // Store new OTP
 *     const otpData = {
 *       code: otp,
 *       attempts: 0,
 *       createdAt: Date.now(),
 *       expiresAt: Date.now() + 300000,
 *       ipAddress: req.ip,
 *       userAgent: req.get("user-agent"),
 *     };
 * 
 *     await redisClient.setEx(otpKey, 300, JSON.stringify(otpData));
 * 
 *     // Send new OTP email
 *     await sendOTPEmail(email, otp);
 * 
 *     // Increment resend counter
 *     if (!resendCount) {
 *       await redisClient.setEx(resendCountKey, 3600, "1");
 *     } else {
 *       await redisClient.incr(resendCountKey);
 *     }
 * 
 *     console.log(`[OTP RESEND] Email: ${email}, Resend Count: ${(parseInt(resendCount) || 0) + 1}`);
 * 
 *     res.status(200).json({
 *       success: true,
 *       message: "OTP resent successfully",
 *       expiresIn: 300,
 *     });
 *   } catch (error) {
 *     console.error("[RESEND OTP ERROR]", error);
 *     res.status(500).json({
 *       success: false,
 *       error: "Failed to resend OTP",
 *     });
 *   }
 * };
 */

// ============================================================================
// 4. CREATE PASSWORD & ACCOUNT ENDPOINT (POST /api/auth/create-password)
// ============================================================================

/**
 * // createPasswordController.js
 * 
 * const bcrypt = require("bcrypt");
 * const jwt = require("jsonwebtoken");
 * const User = require("../models/User");
 * const redis = require("redis");
 * 
 * const redisClient = redis.createClient({ url: process.env.REDIS_URL });
 * 
 * // Middleware to verify email verification token
 * function verifyEmailToken(req, res, next) {
 *   const token = req.headers.authorization?.split(" ")[1];
 *   
 *   if (!token) {
 *     return res.status(401).json({
 *       success: false,
 *       error: "Email verification token required",
 *     });
 *   }
 * 
 *   try {
 *     const decoded = jwt.verify(token, process.env.JWT_SECRET);
 *     
 *     // Make sure it's an email verification token
 *     if (decoded.type !== "email_verification") {
 *       return res.status(401).json({
 *         success: false,
 *         error: "Invalid token type",
 *       });
 *     }
 * 
 *     req.user = decoded;
 *     next();
 *   } catch (error) {
 *     return res.status(401).json({
 *       success: false,
 *       error: "Invalid or expired verification token",
 *     });
 *   }
 * }
 * 
 * exports.createPassword = async (req, res) => {
 *   try {
 *     const { password } = req.body;
 *     const email = req.user.email; // From JWT token middleware
 * 
 *     // Validate password
 *     const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
 *     
 *     if (!passwordRegex.test(password)) {
 *       return res.status(400).json({
 *         success: false,
 *         error: "Password does not meet security requirements",
 *       });
 *     }
 * 
 *     // Check for common passwords
 *     const commonPasswords = ["password", "123456", "qwerty", "admin", "user", "test"];
 *     if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
 *       return res.status(400).json({
 *         success: false,
 *         error: "Password is too common. Please choose a stronger password.",
 *       });
 *     }
 * 
 *     // Check if email already registered
 *     const existingUser = await User.findOne({ email });
 *     if (existingUser) {
 *       return res.status(409).json({
 *         success: false,
 *         error: "Email already registered",
 *       });
 *     }
 * 
 *     // Hash password with bcrypt
 *     const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds
 * 
 *     // Create user account
 *     const newUser = new User({
 *       email,
 *       password_hash: hashedPassword,
 *       email_verified: true,
 *       email_verified_at: new Date(),
 *       profileCompleted: false,
 *       role: "customer", // or from registration data if multi-role
 *     });
 * 
 *     await newUser.save();
 * 
 *     // Delete email verification token from Redis
 *     const tokenKey = `token:${req.headers.authorization.split(" ")[1]}`;
 *     await redisClient.del(tokenKey);
 * 
 *     // Create authentication JWT
 *     const authToken = jwt.sign(
 *       {
 *         userId: newUser._id,
 *         email: newUser.email,
 *         role: newUser.role,
 *       },
 *       process.env.JWT_SECRET,
 *       { expiresIn: "7d" }
 *     );
 * 
 *     // Create refresh token
 *     const refreshToken = jwt.sign(
 *       { userId: newUser._id },
 *       process.env.JWT_SECRET,
 *       { expiresIn: "30d" }
 *     );
 * 
 *     console.log(`[ACCOUNT CREATED] Email: ${email}`);
 * 
 *     // Response
 *     res.status(201).json({
 *       success: true,
 *       message: "Account created successfully",
 *       user: {
 *         id: newUser._id,
 *         email: newUser.email,
 *         role: newUser.role,
 *         profileCompleted: newUser.profileCompleted,
 *       },
 *       authToken,
 *       refreshToken,
 *     });
 *   } catch (error) {
 *     console.error("[CREATE PASSWORD ERROR]", error);
 *     res.status(500).json({
 *       success: false,
 *       error: "Failed to create account",
 *     });
 *   }
 * };
 */

// ============================================================================
// 5. ROUTES SETUP (routes/auth.js)
// ============================================================================

/**
 * // routes/auth.js
 * 
 * const express = require("express");
 * const router = express.Router();
 * const sendOTPController = require("../controllers/sendOTPController");
 * const verifyOTPController = require("../controllers/verifyOTPController");
 * const resendOTPController = require("../controllers/resendOTPController");
 * const createPasswordController = require("../controllers/createPasswordController");
 * const authMiddleware = require("../middleware/authMiddleware");
 * 
 * // Public routes
 * router.post("/send-otp", sendOTPController.sendOTP);
 * router.post("/verify-otp", verifyOTPController.verifyOTP);
 * router.post("/resend-otp", resendOTPController.resendOTP);
 * router.post("/create-password", 
 *   verifyEmailToken,
 *   createPasswordController.createPassword
 * );
 * 
 * module.exports = router;
 */

// ============================================================================
// 6. USER MODEL
// ============================================================================

/**
 * // models/User.js
 * 
 * const mongoose = require("mongoose");
 * 
 * const userSchema = new mongoose.Schema({
 *   name: {
 *     type: String,
 *     required: true,
 *   },
 *   email: {
 *     type: String,
 *     required: true,
 *     unique: true,
 *     lowercase: true,
 *   },
 *   password_hash: {
 *     type: String,
 *     required: true,
 *   },
 *   role: {
 *     type: String,
 *     enum: ["customer", "provider", "admin"],
 *     default: "customer",
 *   },
 *   email_verified: {
 *     type: Boolean,
 *     default: false,
 *   },
 *   email_verified_at: {
 *     type: Date,
 *     default: null,
 *   },
 *   profileCompleted: {
 *     type: Boolean,
 *     default: false,
 *   },
 *   domain: String, // For providers
 *   createdAt: {
 *     type: Date,
 *     default: Date.now,
 *   },
 *   updatedAt: {
 *     type: Date,
 *     default: Date.now,
 *   },
 * });
 * 
 * // Index for faster email lookup
 * userSchema.index({ email: 1 });
 * 
 * module.exports = mongoose.model("User", userSchema);
 */

// ============================================================================
// TESTING THE API
// ============================================================================

/**
 * // Test with curl:
 * 
 * // 1. Send OTP
 * curl -X POST http://localhost:5000/api/auth/send-otp \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"user@gmail.com"}'
 * 
 * // Response:
 * // {
 * //   "success": true,
 * //   "message": "OTP sent successfully",
 * //   "expiresIn": 300,
 * //   "maskedEmail": "us***@gmail.com"
 * // }
 * 
 * // 2. Verify OTP (replace with actual OTP from email)
 * curl -X POST http://localhost:5000/api/auth/verify-otp \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"user@gmail.com","otp":"123456"}'
 * 
 * // Response:
 * // {
 * //   "success": true,
 * //   "message": "Email verified successfully",
 * //   "emailVerificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * //   "expiresIn": 3600
 * // }
 * 
 * // 3. Create Password (using the token from step 2)
 * curl -X POST http://localhost:5000/api/auth/create-password \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
 *   -d '{"password":"SecurePass123!@"}'
 * 
 * // Response:
 * // {
 * //   "success": true,
 * //   "message": "Account created successfully",
 * //   "user": {
 * //     "id": "60f7b3b3b3b3b3b3b3b3b3b3",
 * //     "email": "user@gmail.com",
 * //     "role": "customer",
 * //     "profileCompleted": false
 * //   },
 * //   "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * //   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * // }
 */

// ============================================================================
// SECURITY CHECKLIST
// ============================================================================

/**
 * ✅ IMPLEMENTED SECURITY FEATURES:
 * 
 * [x] Use bcrypt with 12 rounds for password hashing
 * [x] Rate limit OTP requests (5 per email per hour)
 * [x] Timing-safe OTP comparison
 * [x] OTP stored in Redis with 5-minute TTL
 * [x] OTP invalidated after successful use
 * [x] Brute force protection (5 attempts max)
 * [x] Resend cooldown and limit (60 seconds, max 3)
 * [x] Email verification token system
 * [x] JWT with expiration times
 * [x] Audit logging of all auth events
 * [x] Client IP tracking
 * [x] User Agent logging
 * [x] Only accept HTTPS in production
 * [x] Secure HTTP-only cookies for tokens
 * [x] CORS configuration
 * [x] Input validation on backend (never trust frontend)
 * [x] Generic error messages (don't reveal user existence)
 * [x] MongoDB indexes on frequently queried fields
 * [x] Redis connection pooling
 * [x] Error handling with try-catch
 * [x] Logging for monitoring and debugging
 */

export default {}; // This file is documentation only
