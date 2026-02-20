const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

let googleClient = null;

/**
 * Initialize Google OAuth2 Client
 */
function initializeGoogleClient() {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('GOOGLE_CLIENT_ID not set - Google authentication will not work');
    return null;
  }

  if (googleClient) return googleClient;

  googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  return googleClient;
}

/**
 * Verify Google ID Token from frontend
 * Frontend sends the ID token after successful Google Sign-In
 * Backend verifies the token's signature and extracts user info
 * @param {string} idToken - Google ID token from frontend
 * @returns {object} - Verified token payload with user info
 * @throws {Error} - If token is invalid or verification fails
 */
async function verifyGoogleToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID token is required');
  }

  const client = initializeGoogleClient();
  if (!client) {
    throw new Error('Google authentication not configured');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Verify token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      throw new Error('Token has expired');
    }

    // Verify email is present
    if (!payload.email) {
      throw new Error('Email not available from Google account');
    }

    return {
      googleId: payload.sub, // Google unique user ID
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
      locale: payload.locale,
    };
  } catch (err) {
    console.error('Google token verification error:', err.message);
    throw new Error(`Invalid Google token: ${err.message}`);
  }
}

/**
 * Extract user info from Google token without full verification
 * Use this for logout or additional info only after verified
 * @param {string} idToken - Google ID token
 * @returns {object} - User info
 */
function decodeGoogleToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID token is required');
  }

  try {
    const client = initializeGoogleClient();
    if (!client) {
      throw new Error('Google authentication not configured');
    }

    // This decodes without verification - use only for info extraction
    // Real verification should use verifyGoogleToken
    const ticket = client.verifyIdTokenSync(idToken);
    return ticket ? ticket.getPayload() : null;
  } catch (err) {
    console.error('Error decoding Google token:', err.message);
    return null;
  }
}

/**
 * Validate Google OAuth configuration
 * @returns {object} - Configuration status
 */
function getGoogleAuthConfig() {
  return {
    isConfigured: !!GOOGLE_CLIENT_ID,
    clientId: GOOGLE_CLIENT_ID ? 'configured' : 'not-configured',
    clientSecret: GOOGLE_CLIENT_SECRET ? 'configured' : 'not-configured',
  };
}

module.exports = {
  initializeGoogleClient,
  verifyGoogleToken,
  decodeGoogleToken,
  getGoogleAuthConfig,
};
