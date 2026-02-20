/**
 * EMAIL VERIFICATION & OTP SYSTEM - FRONTEND DOCUMENTATION
 * 
 * This document explains how the email verification and OTP system works
 * on the frontend side of the DocBook application.
 */

// ============================================================================
// 1. SYSTEM OVERVIEW
// ============================================================================

/**
 * FLOW DIAGRAM:
 * 
 * User visits Register → Account Type Selection → Personal Info Form
 *        ↓
 *   Redirects to /verify-email with email & registration data
 *        ↓
 *   EMAIL VERIFICATION STEP:
 *   - User enters email address
 *   - Frontend validates email format & domain
 *   - Backend sends 6-digit OTP to email
 *   - Frontend shows "OTP Sent" message
 *        ↓
 *   OTP VERIFICATION STEP:
 *   - User inputs 6-digit code (auto-advances to next field)
 *   - Frontend validates OTP format (6 digits)
 *   - Backend verifies OTP matches and isn't expired
 *   - Backend returns verification token
 *        ↓
 *   SUCCESS STEP + AUTO REDIRECT:
 *   - Shows "Email Verified Successfully"
 *   - Auto-redirects to /complete-profile or dashboard
 *   - Registration data & verification token stored in session
 */

// ============================================================================
// 2. COMPONENTS
// ============================================================================

/**
 * EmailVerification.jsx
 * Location: src/components/auth/EmailVerification.jsx
 * 
 * Purpose: Email input and submission component
 * 
 * Props:
 * - email (string): Pre-filled email if coming from registration
 * - onEmailSubmit (function): Callback when user submits email
 * - isLoading (boolean): Show loading state
 * 
 * Features:
 * - Real-time email validation with regex
 * - Common email domain validation (Gmail, Yahoo, Outlook, etc.)
 * - Typo detection ("gmial.com" → suggests "gmail.com")
 * - Disabled email providers list
 * - Green "Email looks good!" feedback
 * - Security info badge about encryption
 * 
 * State:
 * - inputEmail: User's email input
 * - errors: Validation error messages
 * - isValidating: Loading state during submission
 * 
 * Usage:
 * <EmailVerification
 *   email={emailFromRegistration}
 *   onEmailSubmit={handleEmailSubmit}
 *   isLoading={isLoading}
 * />
 */

/**
 * OTPVerification.jsx
 * Location: src/components/auth/OTPVerification.jsx
 * 
 * Purpose: 6-digit OTP input and verification component
 * 
 * Props:
 * - email (string): Email address for display
 * - onOTPSubmit (function): Callback when user submits OTP
 * - onResendOTP (function): Callback for resend button
 * - isLoading (boolean): Show loading state
 * - resendCooldown (number): Seconds to wait before resend (default: 60)
 * 
 * Features:
 * - 6 input boxes (one digit each)
 * - Auto-focus to next box on digit entry
 * - Backspace navigation between boxes
 * - Attempt counter (max 5 attempts)
 * - Resend OTP with cooldown timer
 * - Prevents brute force (5 attempts limit)
 * - Change email link
 * 
 * State:
 * - otp: Array of 6 digit values
 * - errors: Validation error messages
 * - isVerifying: Loading state during verification
 * - resendTimer: Cooldown timer countdown
 * - attemptCount: Failed verification attempts
 * 
 * Usage:
 * <OTPVerification
 *   email={email}
 *   onOTPSubmit={handleOTPSubmit}
 *   onResendOTP={handleResendOTP}
 *   isLoading={isLoading}
 *   resendCooldown={60}
 * />
 */

/**
 * PasswordStrengthIndicator.jsx
 * Location: src/components/auth/PasswordStrengthIndicator.jsx
 * 
 * Purpose: Real-time password strength validation
 * 
 * Props:
 * - password (string): Current password value
 * - onChange (function): Callback when password changes
 * - disabled (boolean): Disable input during submission
 * 
 * Features:
 * - Real-time strength calculation (Weak/Fair/Good/Strong)
 * - Visual strength bar (1-4 filled)
 * - Requirements checklist:
 *   * Minimum 8 characters
 *   * Uppercase letter (A-Z)
 *   * Lowercase letter (a-z)
 *   * Number (0-9)
 *   * Special character (!@#$%^&*)
 *   * No common patterns (password, 123456, qwerty, etc.)
 * - Show/hide password toggle
 * - Green checkmarks for met requirements
 * - Tips for stronger password
 * 
 * Strength Levels:
 * - Weak (score ≤ 2): Red color, 1/4 bar
 * - Fair (score ≤ 4): Orange color, 2/4 bar
 * - Good (score < 6): Yellow color, 3/4 bar
 * - Strong (score = 6): Green color, 4/4 bar (full)
 * 
 * Usage:
 * <PasswordStrengthIndicator
 *   password={password}
 *   onChange={setPassword}
 *   disabled={isLoading}
 * />
 */

// ============================================================================
// 3. PAGE COMPONENTS
// ============================================================================

/**
 * VerifyEmail.jsx
 * Location: src/pages/auth/VerifyEmail.jsx
 * 
 * Purpose: Main email verification page combining components
 * 
 * Steps:
 * 1. Email Verification:
 *    - User enters email
 *    - Calls onEmailSubmit() → backend sends OTP
 *    - Moves to step: "otp"
 * 
 * 2. OTP Verification:
 *    - User enters 6-digit code
 *    - Calls onOTPSubmit() → backend verifies OTP
 *    - On success: Moves to step: "success"
 * 
 * 3. Success:
 *    - Shows "Email Verified Successfully" message
 *    - Auto-redirects to next registration step
 * 
 * Backend Calls:
 * - POST /api/auth/send-otp { email }
 * - POST /api/auth/verify-otp { email, otp }
 * - POST /api/auth/resend-otp { email }
 * 
 * State Flow:
 * verifiedEmail: Stores email through verification steps
 * isLoading: Global loading state
 * step: "email" → "otp" → "success"
 */

/**
 * RegisterV2.jsx
 * Location: src/pages/public/RegisterV2.jsx
 * (New improved registration with built-in email verification)
 * 
 * Purpose: Multi-step registration process
 * 
 * Steps:
 * 1. Account Type Selection:
 *    - Customer or Provider
 *    - Sets formData.role
 * 
 * 2. Personal Information:
 *    - Full name
 *    - Email
 *    - Password (with strength indicator)
 *    - Provider domain (if provider)
 *    - Terms acceptance
 * 
 * 3. Redirects to /verify-email with:
 *    - email
 *    - name
 *    - role
 *    - domain
 *    - Full registration data
 * 
 * Validation:
 * - Real-time error clearing
 * - Visual feedback (green checkmarks)
 * - Inline error messages
 * - Password strength requirements
 */

// ============================================================================
// 4. FEATURES & SECURITY
// ============================================================================

/**
 * EMAIL VALIDATION:
 * 
 * 1. Format Validation:
 *    - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *    - Checks: local@domain.extension
 * 
 * 2. Domain Validation:
 *    - Whitelist of popular providers:
 *      * Gmail.com, Yahoo.com, Outlook.com, Hotmail.com
 *      * ProtonMail.com, iCloud.com, AOL.com, Mail.com
 *      * Zoho.com, Yandex.com
 *    - Prevents typos on unsupported domains
 * 
 * 3. Typo Detection:
 *    - Maps common typos to correct domains
 *    - Examples:
 *      * gmial.com → gmail.com
 *      * yahooo.com → yahoo.com
 *      * outloo.com → outlook.com
 * 
 * 4. Real-time Feedback:
 *    - Green checkmark: "Email looks good!"
 *    - Red error: "Invalid email format"
 *    - Suggestions: "Did you mean gmail.com?"
 */

/**
 * OTP SECURITY:
 * 
 * Frontend Protection:
 * 1. Input Validation:
 *    - Only accepts digits (0-9)
 *    - Prevents non-numeric input
 *    - Validates 6 digits required
 * 
 * 2. Attempt Limiting:
 *    - Max 5 failed attempts per OTP
 *    - Shows: "4 attempts remaining"
 *    - Blocks after threshold
 * 
 * 3. Timing Protection:
 *    - Resend cooldown: 60 seconds
 *    - User can't spam resend requests
 *    - Visual countdown: "Resend in 45s"
 * 
 * 4. Session Management:
 *    - OTP stored in component state (RAM only)
 *    - Not persisted to localStorage
 *    - Cleared on navigation
 * 
 * Backend Protection (not in frontend):
 * - Constant-time OTP comparison
 * - 5-minute expiration
 * - IP tracking for suspicious patterns
 * - Rate limiting per email per hour
 * - Brute force detection
 */

/**
 * PASSWORD SECURITY:
 * 
 * Requirements Enforced:
 * 1. Minimum 8 characters
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one number (0-9)
 * 5. At least one special character (!@#$%^&*)
 * 6. No common passwords (password, 123456, admin, etc.)
 * 
 * Strength Calculation:
 * - Each requirement met = 1 point (max 6)
 * - Weak: 0-2 points (red)
 * - Fair: 3-4 points (orange)
 * - Good: 5 points (yellow)
 * - Strong: 6 points (green)
 * 
 * UI Feedback:
 * - Visual strength bar fills as requirements met
 * - Real-time checklist updates
 * - Color coded: Red/Orange/Yellow/Green
 * - Helpful tips for stronger password
 */

// ============================================================================
// 5. USER FLOW EXAMPLES
// ============================================================================

/**
 * SCENARIO 1: New Customer Registration
 * 
 * 1. User clicks "Sign Up"
 * 2. Redirects to /register
 * 3. RegisterV2 component shows "Account Type"
 * 4. User selects "Customer"
 * 5. Shows personal info form:
 *    - Full Name: "John Doe"
 *    - Email: "john@gmail.com"
 *    - Password: "SecurePass123!@"
 *    - (Password strength shows "Strong")
 *    - Check: "I agree to Terms"
 * 6. Clicks "Continue to Email Verification"
 * 7. Redirects to /verify-email with data:
 *    - state.email = "john@gmail.com"
 *    - state.name = "John Doe"
 *    - state.role = "customer"
 * 8. VerifyEmail shows EmailVerification component:
 *    - Email field pre-filled: "john@gmail.com"
 *    - User clicks "Send OTP"
 *    - Backend sends email with "123456"
 * 9. Moves to OTP step
 * 10. Shows OTPVerification component:
 *    - 6 input boxes
 *    - User enters: 1-2-3-4-5-6
 *    - Clicking "Verify Email"
 * 11. Backend verifies OTP
 * 12. Shows success screen
 * 13. Auto-redirects to /complete-profile or /customer-dashboard
 */

/**
 * SCENARIO 2: Provider Registration with Domain
 * 
 * 1. User signs up as Provider
 * 2. Personal info form also shows:
 *    - Professional Domain dropdown:
 *      * 👨‍⚕️ Doctor
 *      * 🧠 Psychiatrist
 *      * 💼 Businessman
 *      * 🚗 Automobiles Works
 * 3. User selects "Doctor"
 * 4. Continues to email verification
 * 5. Rest of flow same as customer
 * 6. After verification:
 *    - Logged in as provider
 *    - Domain stored: doctor
 *    - Redirected to provider dashboard or profile completion
 */

/**
 * SCENARIO 3: Invalid OTP Attempt
 * 
 * 1. User enters wrong OTP: "000000"
 * 2. Red error: "Invalid OTP. Please try again."
 * 3. Shows "4 attempts remaining"
 * 4. Input boxes cleared
 * 5. Focus returns to first box
 * 6. User tries again (up to 5 times)
 * 7. After 5 failed attempts:
 *    - Error: "Too many failed attempts. Please request a new OTP."
 *    - Resend button disabled
 *    - Must wait or request new OTP
 */

/**
 * SCENARIO 4: Resend OTP
 * 
 * 1. User doesn't receive OTP email
 * 2. Clicks "Resend OTP" button
 * 3. Button shows spinner: "Resending..."
 * 4. Button disabled with cooldown: "Resend in 59s"
 * 5. New OTP generated and sent to email
 * 6. Toast: "OTP resent successfully"
 * 7. Attempt counter reset to 0
 * 8. User can enter new OTP
 * 9. After 60 seconds:
 *    - Cooldown removed
 *    - "Resend OTP" clickable again
 *    - Can request up to 3 times per registration
 */

// ============================================================================
// 6. ERROR MESSAGES
// ============================================================================

/**
 * EMAIL VALIDATION ERRORS:
 * 
 * "Invalid email format"
 * - User entered: "johngmail.com" (missing @)
 * - Fix: User must enter valid format
 * 
 * "Please use a valid email provider"
 * - User entered: "john@fakemail.xyz"
 * - Fix: Use Gmail, Yahoo, Outlook, etc.
 * 
 * "Did you mean gmail.com?"
 * - User entered: "john@gmial.com" (common typo)
 * - Fix: Quick suggestion to correct domain
 * 
 * "Email is required"
 * - User left field empty
 * - Fix: Enter email address
 * 
 * "Email already registered"
 * - User email exists in database
 * - Fix: Try logging in or use different email
 */

/**
 * OTP ERRORS:
 * 
 * "Please enter all 6 digits"
 * - User submitted with empty boxes
 * - Fix: Fill all 6 digit positions
 * 
 * "Invalid OTP. Please try again."
 * - Code doesn't match backend
 * - Shows: "4 attempts remaining"
 * - Fix: Check email and retry
 * 
 * "OTP expired"
 * - User took > 5 minutes to enter code
 * - Fix: Click "Resend OTP" to get new code
 * 
 * "Too many failed attempts"
 * - 5 incorrect attempts made
 * - Fix: Wait or request new OTP
 */

/**
 * PASSWORD ERRORS:
 * 
 * "Password must meet all requirements"
 * - Shows requirements checklist
 * - User can see what's missing:
 *   ✓ At least 8 characters
 *   ✗ One uppercase letter
 *   ✓ One lowercase letter
 *   ✓ One number
 *   ✗ One special character
 * - Fix: Add uppercase and special char
 * 
 * "Passwords do not match"
 * - Confirm Password field differs
 * - Fix: Re-enter same password in confirm field
 */

// ============================================================================
// 7. ROUTING
// ============================================================================

/**
 * New Email Verification Routes:
 * 
 * /verify-email
 * - Main email verification page
 * - Accessible from registration flow
 * - Requires state.email from prior step
 * - GET params optional: ?email=user@example.com
 * 
 * /register
 * - Old registration page (still available)
 * 
 * (NEW) RegisterV2 Integration:
 * - Replace /register with RegisterV2
 * - Includes account type selection
 * - Built-in password strength indicator
 * - Flows into /verify-email
 */

// ============================================================================
// 8. INTEGRATION CHECKLIST FOR BACKEND
// ============================================================================

/**
 * ✅ REQUIRED BACKEND ENDPOINTS:
 * 
 * [ ] POST /api/auth/send-otp
 *     Request: { email: string }
 *     Response: { success: bool, message: string, expiresIn: number }
 * 
 * [ ] POST /api/auth/verify-otp
 *     Request: { email: string, otp: string }
 *     Response: { success: bool, message: string, emailVerificationToken?: string }
 * 
 * [ ] POST /api/auth/resend-otp
 *     Request: { email: string }
 *     Response: { success: bool, message: string, expiresIn: number }
 * 
 * ✅ SECURITY IMPLEMENTATION:
 * 
 * [ ] Use bcrypt for password hashing (12+ rounds)
 * [ ] Implement rate limiting (5 requests/email/hour)
 * [ ] Use constant-time comparison for OTP
 * [ ] Store OTP in Redis with 5-min TTL
 * [ ] Set up email sending (Gmail SMTP, SendGrid, etc.)
 * [ ] Log all auth attempts for audit trail
 * [ ] Implement brute force protection
 * [ ] Add CORS configuration
 * [ ] Use HTTPS for all endpoints
 * [ ] Set secure HTTP-only cookies
 * [ ] Validate input on backend (never trust frontend)
 * [ ] Handle email domain verification
 * 
 * ✅ DATABASE SCHEMA:
 * 
 * [ ] users table needs:
 *     - email_verified: boolean (default: false)
 *     - email_verified_at: timestamp
 *     - password_hash: string
 *     - role: enum (customer, provider, admin)
 * 
 * [ ] temp_otp table (Redis or DB):
 *     - email: string (key)
 *     - code: string (hashed or encrypted)
 *     - attempts: number
 *     - created_at: timestamp
 *     - expires_at: timestamp
 * 
 * [ ] Email verification tokens table:
 *     - token: string (key)
 *     - email: string
 *     - created_at: timestamp
 *     - expires_at: timestamp
 */

export const FRONTEND_CONFIG = {
  VERSION: "2.0.0",
  FEATURES: {
    EMAIL_VERIFICATION: true,
    OTP_VERIFICATION: true,
    PASSWORD_STRENGTH: true,
    MULTI_STEP_REGISTRATION: true,
  },
  SECURITY: {
    MIN_PASSWORD_LENGTH: 8,
    OTP_LENGTH: 6,
    OTP_EXPIRY_SECONDS: 300,
    RESEND_COOLDOWN_SECONDS: 60,
    MAX_OTP_ATTEMPTS: 5,
    MAX_RESEND_ATTEMPTS: 3,
  },
  ENDPOINTS: {
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
    LOGIN: "/login",
    COMPLETE_PROFILE: "/complete-profile",
    CUSTOMER_DASHBOARD: "/customer-dashboard",
    PROVIDER_DASHBOARD: "/provider-dashboard",
  },
};
