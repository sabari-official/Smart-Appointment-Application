const validator = require('validator');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email.trim().toLowerCase());
}

/**
 * Check if email domain is disposable/temporary
 * Common disposable email domains to block
 * @param {string} email - Email to check
 * @returns {boolean} - True if email is from a disposable domain
 */
function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    'temp-mail.org',
    'mailinator.com',
    '10minutemail.com',
    'guerrillamail.com',
    'maildrop.cc',
    'spam4.me',
    'temp-mail.io',
    'yopmail.com',
    '10minutemail.com',
    'trashmail.com',
    'fakeinbox.com',
  ];

  const domain = email.toLowerCase().split('@')[1];
  return disposableDomains.includes(domain);
}

/**
 * Comprehensive email validation
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!isValidEmailFormat(trimmedEmail)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  if (isDisposableEmail(trimmedEmail)) {
    return { isValid: false, message: 'Disposable email addresses are not allowed' };
  }

  return { isValid: true, message: 'Email is valid' };
}

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string} - Domain name
 */
function getEmailDomain(email) {
  if (!email || typeof email !== 'string') return null;
  return email.toLowerCase().split('@')[1] || null;
}

module.exports = {
  isValidEmailFormat,
  isDisposableEmail,
  validateEmail,
  getEmailDomain,
};
