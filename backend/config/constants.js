module.exports = {
  ROLES: {
    CUSTOMER: 'customer',
    PROVIDER: 'provider',
    ADMIN: 'admin',
  },
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    BOOKED: 'booked',
  },
  SLOT_MAX_PER_DAY: 15,
  OTP_EXPIRE_MINUTES: 10,
  PASSWORD_RULES: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  RATE_LIMITS: {
    GENERAL: { windowMs: 15 * 60 * 1000, max: 200 },
    AUTH: { windowMs: 15 * 60 * 1000, max: 20 },
    AI: { windowMs: 1 * 60 * 1000, max: 30 },
  },
};
