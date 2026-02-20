# Google OAuth Setup - Complete Fix Guide

## Problem
Getting "Error 401: invalid_client" when trying to sign in with Google. This means the Google OAuth client is not properly configured.

## Root Cause
The Google Cloud Console OAuth 2.0 credentials don't have the correct redirect URIs configured for your frontend application.

## Solution - Step by Step

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure you're logged into the Google account that owns this project
3. Select your project from the dropdown (or create one if you don't have it)

### Step 2: Configure OAuth Consent Screen
1. In the left menu, go to **APIs & Services** > **OAuth consent screen**
2. If not done, click **CREATE CONSENT SCREEN**
3. Select **External** user type
4. Fill in the required fields:
   - App name: "Smart Appointment"
   - User support email: Your email
   - Developer contact: Your email
5. Click **SAVE AND CONTINUE** through all screens

### Step 3: Configure OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   http://localhost:5000
   http://127.0.0.1:3000
   http://127.0.0.1:5000
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/
   http://localhost:5000/api/auth/google
   http://127.0.0.1:3000/
   http://127.0.0.1:5000/api/auth/google
   ```
6. Click **CREATE**
7. Copy your **Client ID** and **Client Secret**

### Step 4: Update Environment Variables

**Backend (.env):**
```
GOOGLE_CLIENT_ID=<your-client-id-from-step-3>
GOOGLE_CLIENT_SECRET=<your-client-secret-from-step-3>
```

**Frontend (.env):**
```
VITE_GOOGLE_CLIENT_ID=<your-client-id-from-step-3>
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Verify Backend Settings
1. Restart your backend server: `npm start`
2. Check the console for: "Google client initialized successfully" or similar message

### Step 6: Test the Authentication
1. Visit http://localhost:3000/register
2. Select your role (Customer or Provider)
3. Click "Sign in with Google"
4. You should see the Google OAuth popup

## For Production Setup
When deploying to production, update:

**Google Cloud Console Credentials:**
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs:
  - `https://yourdomain.com/`
  - `https://yourdomain.com/api/auth/google`

**Environment Variables:**
- `GOOGLE_CLIENT_ID=<production-client-id>`
- `GOOGLE_CLIENT_SECRET=<production-client-secret>`
- `VITE_GOOGLE_CLIENT_ID=<production-client-id>` (frontend)

## Common Issues and Fixes

### Issue 1: "Error 401: invalid_client"
**Cause:** Client ID not properly configured or redirect URIs missing
**Fix:** Follow steps 3-4 above

### Issue 2: "popup_closed_by_user"
**Cause:** User cancelled the Google sign-in
**Fix:** This is normal - user needs to try again

### Issue 3: Empty error in popup
**Cause:** Browser security issue or CORS problem
**Fix:** 
- Clear browser cache and cookies
- Make sure localhost:3000 is accessible
- Check browser console for specific errors

### Issue 4: Token verification fails in backend
**Cause:** Client ID mismatch between frontend and backend
**Fix:** Ensure both have the exact same GOOGLE_CLIENT_ID

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Google Client ID matches in both .env files
- [ ] Authorized origins and redirect URIs configured in Google Cloud Console
- [ ] Can see Google sign-in button on register page
- [ ] Can click button and see Google OAuth popup
- [ ] Can successfully sign in with Google account
- [ ] User is created in MongoDB with correct data
- [ ] JWT token is generated and stored in localStorage

## Debugging Steps

If still having issues:

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for any JavaScript errors
   - Check Network tab for API calls

2. **Check Backend Logs:**
   - Look for MongoDB connection message
   - Look for "Google client initialized" message
   - Check for any error messages when /api/auth/google is called

3. **Test Backend Endpoint Directly:**
   ```bash
   # Get a real idToken from Google first, then:
   curl -X POST http://localhost:5000/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{
       "idToken": "your-id-token-here",
       "role": "customer",
       "termsAccepted": true
     }'
   ```

## Need More Help?
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Documentation](https://github.com/react-oauth/react-oauth.github.io)
- Backend OAuth Service: `backend/services/googleOAuthService.js`
- Frontend Component: `frontend/src/components/auth/GoogleSignInButton.jsx`
