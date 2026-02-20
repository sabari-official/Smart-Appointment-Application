/**
 * EMAIL VERIFICATION & OTP SYSTEM - BACKEND INTEGRATION GUIDE
 * 
 * This document outlines the backend APIs needed to support the frontend
 * email verification and OTP system implemented in the DocBook application.
 * 
 * SECURITY REQUIREMENTS:
 * - All endpoints must use HTTPS
 * - Rate limiting: Maximum 5 OTP requests per email per hour
 * - OTP brute force protection: Block after 5 failed attempts per OTP
 * - Session management: Use secure HTTP-only cookies for session tokens
 * - Input validation: Sanitize all email inputs
 * - CORS: Restrict to frontend domain only
 */

// ============================================================================
// 1. SEND OTP ENDPOINT
// ============================================================================

/**
 * POST /api/auth/send-otp
 * 
 * Purpose: Generate and send a 6-digit OTP to the specified email address
 *
 * Request:
 * {
 *   "email": "user@gmail.com"
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "OTP sent successfully",
 *   "expiresIn": 300,  // seconds (5 minutes)
 *   "maskedEmail": "us***@gmail.com"  // for display purposes
 * }
 *
 * Response (Error - 400):
 * {
 *   "success": false,
 *   "error": "Invalid email format" | "Email already registered" | "Too many requests"
 * }
 *
 * Backend Implementation Details:
 * 
 * 1. Validation:
 *    - Check if email format is valid
 *    - Check if email domain is real (SMTP verification optional)
 *    - Check if email is already registered in DB
 *    - Implement rate limiting: max 5 requests per email per hour (Redis/DB counter)
 *
 * 2. OTP Generation:
 *    - Generate 6-digit random number (000000 - 999999)
 *    - Use crypto.randomInt() or equivalent secure random
 *    - NEVER use Math.random()
 *    
 *    Example: crypto.randomInt(100000, 999999).toString().padStart(6, '0')
 *
 * 3. OTP Storage:
 *    - Store in Redis with 5-minute TTL (300 seconds)
 *    - Key format: "otp:{email}" = { code, attempts: 0, createdAt }
 *    - Include metadata: IP address, user agent for fraud detection
 *    - Example Redis data:
 *      {
 *        code: "456789",
 *        attempts: 0,
 *        createdAt: 1708345678901,
 *        expiresAt: 1708345978901,
 *        ipAddress: "192.168.1.1",
 *        userAgent: "Mozilla/5.0...",
 *        emailHash: "sha256(email)"
 *      }
 *
 * 4. Email Sending:
 *    - Use Gmail SMTP (nodemail, SendGrid, AWS SES, etc.)
 *    - Email template should include:
 *      * 6-digit OTP code (large, easy to read)
 *      * Expiration time (5 minutes)
 *      * "Do not share this code" warning
 *      * Link to change email if wrong recipient
 *      * Company contact info for support
 *    
 *    - Email Subject: "Your DocBook Verification Code"
 *    - Plain text + HTML template
 *    - Add unsubscribe link (legal requirement)
 *    - Log email send attempt in audit trail
 *
 * 5. Error handling:
 *    - If email send fails, rollback OTP creation
 *    - Log error to monitoring service (Sentry, etc.)
 *    - Return generic error message to frontend (not implementation details)
 *
 * Security Considerations:
 * - Don't return the OTP itself in response
 * - Don't reveal if email exists in system
 * - Log all OTP requests for audit trail
 * - Monitor for suspicious patterns (same IP, different emails)
 */

// ============================================================================
// 2. VERIFY OTP ENDPOINT
// ============================================================================

/**
 * POST /api/auth/verify-otp
 * 
 * Purpose: Verify the 6-digit OTP and create a temporary email verification session
 *
 * Request:
 * {
 *   "email": "user@gmail.com",
 *   "otp": "456789"
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Email verified successfully",
 *   "emailVerificationToken": "jwt_token_here",
 *   "expiresIn": 3600  // seconds (1 hour to complete registration)
 * }
 *
 * Response (Error - 400):
 * {
 *   "success": false,
 *   "error": "Invalid OTP" | "OTP expired" | "Too many failed attempts" | "OTP not found"
 * }
 *
 * Backend Implementation Details:
 *
 * 1. Validation:
 *    - Check if OTP record exists for email
 *    - Check if OTP has expired (current time > expiresAt)
 *    - Validate OTP format (must be 6 digits)
 *
 * 2. Comparison (CRITICAL - Timing Attack Prevention):
 *    - Use constant-time string comparison (not ==)
 *    - In Node.js: crypto.timingSafeEqual() or use bcrypt compare
 *    - NEVER use: if (storedOtp === providedOtp) { ... }
 *    
 *    Example:
 *    ```
 *    try {
 *      crypto.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(providedOtp));
 *    } catch (e) {
 *      // Timing safe comparison failed - OTPs don't match
 *    }
 *    ```
 *
 * 3. Attempt Tracking:
 *    - Increment attempts counter on failed verification
 *    - Block after 5 failed attempts
 *    - Clear attempts on successful verification
 *    - Clear attempts when new OTP is requested
 *    - Optional: Implement exponential backoff (1s, 2s, 4s, 8s, 16s)
 *
 * 4. On Successful Verification:
 *    - Create JWT token with email claim (payload: { email, type: 'email_verification' })
 *    - Token expiry: 1 hour (enough for user to complete password creation)
 *    - Store token claims in Redis for quick validation
 *    - Mark email as "temporarily verified" in registration flow
 *    - Log successful verification
 *    - Delete OTP record from database/Redis
 *
 *    JWT Example Payload:
 *    {
 *      email: "user@gmail.com",
 *      type: "email_verification",
 *      iat: 1708345678,
 *      exp: 1708349278,
 *      jti: "unique_token_id"
 *    }
 *
 * 5. Error Handling:
 *    - Invalid OTP: Return generic "Invalid OTP" message
 *    - Expired OTP: Suggest requesting new OTP
 *    - Too many attempts: Block requests for 15 minutes
 *    - Don't reveal which part failed (email/OTP)
 *
 * Security Considerations:
 * - Never return remaining attempts to frontend
 * - Log all verification attempts with timestamp, IP, user agent
 * - Monitor for brute force patterns across different emails
 * - Implement CAPTCHA after 3 failed attempts (optional)
 * - Send email notification if suspicious activity detected
 */

// ============================================================================
// 3. RESEND OTP ENDPOINT
// ============================================================================

/**
 * POST /api/auth/resend-otp
 * 
 * Purpose: Invalidate previous OTP and send a new one
 *
 * Request:
 * {
 *   "email": "user@gmail.com"
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "OTP resent successfully",
 *   "expiresIn": 300
 * }
 *
 * Response (Error - 400):
 * {
 *   "success": false,
 *   "error": "No OTP found for this email" | "Too many resend requests"
 * }
 *
 * Backend Implementation Details:
 *
 * 1. Validation:
 *    - Check if OTP exists for email
 *    - Check resend attempt count (max 3 per email per registration)
 *    - Minimum gap between resends: 30 seconds
 *
 * 2. OTP Invalidation:
 *    - Delete previous OTP record
 *    - Reset attempt counter
 *    - Clear any blocking flags
 *
 * 3. New OTP Generation:
 *    - Generate a NEW 6-digit OTP (not the same as before)
 *    - Ensure it's different from previous OTP
 *    - Store with 5-minute TTL
 *    - Increment resend counter
 *
 * 4. Tracking:
 *    - Log resend event with timestamp
 *    - Store resend count: "otp:resend:{email}" counter
 *    - Alert if too many resends from same IP/email
 */

// ============================================================================
// 4. PASSWORD CREATION ENDPOINT
// ============================================================================

/**
 * POST /api/auth/create-password
 * 
 * Purpose: Create user account after email verification
 *
 * Request:
 * Headers: { Authorization: "Bearer emailVerificationToken" }
 * {
 *   "password": "SecurePass123!@"
 * }
 *
 * Response (Success - 201):
 * {
 *   "success": true,
 *   "message": "Account created successfully",
 *   "user": {
 *     "id": "user_123",
 *     "email": "user@gmail.com",
 *     "createdAt": 1708345678901
 *   },
 *   "authToken": "jwt_auth_token",
 *   "refreshToken": "refresh_token"
 * }
 *
 * Response (Error):
 * {
 *   "success": false,
 *   "error": "Invalid verification token" | "Email already registered" | "Weak password"
 * }
 *
 * Backend Implementation Details:
 *
 * 1. Token Validation:
 *    - Verify JWT token is valid and not expired
 *    - Check token type is 'email_verification'
 *    - Extract email from token
 *
 * 2. Email Validation:
 *    - Check if email already registered in main users table
 *    - If yes, return error (prevent data inconsistency)
 *
 * 3. Password Validation:
 *    - Check minimum length (8 characters)
 *    - Verify contains uppercase, lowercase, numbers, special chars
 *    - Check against common password blacklist
 *    - Check password != email
 *    - Validate against NIST guidelines
 *
 * 4. Password Storage:
 *    - Hash using bcrypt with salt rounds: 12 (minimum)
 *    - NEVER store plaintext passwords
 *    - NEVER use MD5, SHA1, or weak hashing
 *    
 *    Example:
 *    ```
 *    const hashedPassword = await bcrypt.hash(password, 12);
 *    ```
 *
 * 5. Account Creation:
 *    - Create user record in database
 *    - Set initial role (customer/provider based on registration flow)
 *    - Set profileCompleted: false (user must complete profile)
 *    - Store email verification timestamp
 *    - Generate authentication JWT and refresh token
 *
 * 6. Cleanup:
 *    - Delete email verification token from Redis
 *    - Delete OTP record if exists
 *    - Log account creation
 */

// ============================================================================
// 5. EMAIL-PASSWORD LOGIN ENDPOINT (Updated)
// ============================================================================

/**
 * POST /api/auth/login
 * 
 * Purpose: Authenticate user with email/username and password
 *
 * Request:
 * {
 *   "credential": "user@gmail.com or username",
 *   "password": "SecurePass123!@"
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "user": {
 *     "id": "user_123",
 *     "email": "user@gmail.com",
 *     "name": "John Doe",
 *     "role": "customer",
 *     "profileCompleted": true
 *   },
 *   "authToken": "jwt_token",
 *   "refreshToken": "refresh_token"
 * }
 *
 * Response (Error - 401):
 * {
 *   "success": false,
 *   "error": "Invalid credentials" | "Email not verified"
 * }
 *
 * Backend Implementation Details:
 *
 * 1. User Lookup:
 *    - Try matching against email field
 *    - If not found, try username field (for providers/admin)
 *    - Return generic error if not found (don't reveal which users exist)
 *
 * 2. Email Verification Check:
 *    - Verify email_verified flag is true
 *    - If not verified, suggest resending OTP
 *
 * 3. Password Verification:
 *    - Use bcrypt.compare() for timing-safe comparison
 *    - NEVER compare plain password with hash
 *
 * 4. Rate Limiting:
 *    - Track failed login attempts per IP/email
 *    - Block after 5 failed attempts for 15 minutes
 *    - Use exponential backoff
 *
 * 5. Session Management:
 *    - Create secure JWT with user claims
 *    - Store session in Redis (for invalidation capability)
 *    - Set secure HTTP-only cookies
 */

// ============================================================================
// 6. SECURITY BEST PRACTICES
// ============================================================================

/**
 * ENCRYPTION & HASHING:
 * - Password: bcrypt (12+ rounds)
 * - OTP: Store in memory/Redis (no database persistence)
 * - Email: Can be stored plaintext but use TLS in transit
 * - JWT: Sign with strong secret (64+ characters)
 *
 * RATE LIMITING:
 * - OTP sending: 5 per email per hour
 * - OTP verification: 5 attempts per OTP code
 * - Resend OTP: 3 per registration flow
 * - Password attempts: 5 per user per 15 minutes
 *
 * LOGGING & MONITORING:
 * - Log all OTP operations with timestamp, IP, user agent
 * - Log failed verification attempts
 * - Alert on suspicious patterns:
 *   * Multiple OTP requests from different countries same IP
 *   * Brute force attempts
 *   * Same email from multiple IPs
 *   * High volume of failed logins
 *
 * ENVIRONMENT VARIABLES:
 * - GMAIL_USER: Gmail account for sending OTPs
 * - GMAIL_PASS: Gmail app password (NOT main password)
 * - JWT_SECRET: Strong random string (64+ chars)
 * - MONGODB_URI: Database connection string
 * - REDIS_URL: Redis connection for OTP storage
 * - FRONTEND_URL: For CORS configuration
 *
 * EMAIL TEMPLATE:
 * Subject: Your DocBook Verification Code
 *
 * Body (HTML):
 * <h1>Email Verification</h1>
 * <p>Your verification code is:</p>
 * <h2 style="letter-spacing: 0.2em; font-size: 2em;">456789</h2>
 * <p>This code expires in 5 minutes.</p>
 * <p><strong>Do not share this code with anyone.</strong></p>
 * <p><a href="https://docbook.com/change-email">Used wrong email?</a></p>
 *
 * COMPLIANCE:
 * - GDPR: Get consent before storing email
 * - CCPA: Provide email deletion option
 * - CAN-SPAM: Include unsubscribe option
 * - PCI-DSS: If storing payment info (out of scope for this doc)
 */

// ============================================================================
// 7. ERROR HANDLING STRATEGY
// ============================================================================

/**
 * FRONTEND ERRORS:
 * - Invalid email format: Show immediately with validation
 * - Email already registered: "This email is already registered. Try logging in."
 * - OTP expired: "Verification code expired. Request a new one."
 * - Invalid OTP: "Invalid code. Please check and try again."
 * - Too many attempts: "Too many failed attempts. Please try again later."
 *
 * ERROR CODES:
 * {
 *   INVALID_EMAIL: 400,
 *   EMAIL_EXISTS: 409,
 *   RATE_LIMIT_EXCEEDED: 429,
 *   OTP_EXPIRED: 401,
 *   INVALID_OTP: 401,
 *   TOO_MANY_ATTEMPTS: 429,
 *   WEAK_PASSWORD: 400,
 *   SERVER_ERROR: 500
 * }
 */

export const BACKEND_API_CONFIG = {
  baseURL: "/api",
  authEndpoints: {
    sendOTP: "/auth/send-otp",
    verifyOTP: "/auth/verify-otp",
    resendOTP: "/auth/resend-otp",
    createPassword: "/auth/create-password",
    login: "/auth/login",
  },
  timeouts: {
    otpExpiry: 5 * 60 * 1000, // 5 minutes
    verificationTokenExpiry: 60 * 60 * 1000, // 1 hour
    sessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
  },
  rateLimits: {
    otpPerHour: 5,
    otpAttempts: 5,
    resendMax: 3,
    loginAttempts: 5,
  },
};
