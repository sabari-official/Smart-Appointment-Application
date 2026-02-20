# Google Sign-In Integration Guide

## Overview
This implementation provides seamless Google Sign-In authentication for both customers and providers. Users can sign in or register with their Google account instead of using email/password.

## Features
- ✅ One-click Google Sign-In for customers
- ✅ One-click Google Sign-In for providers  
- ✅ Automatic profile detection from Google account
- ✅ Role-based sign-in (Customer vs Provider)
- ✅ Frontend-only implementation with localStorage persistence
- ✅ Responsive UI on Login and Register pages

## Set Up Instructions

### Step 1: Get Google OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing one)
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Choose **Web application** as the application type
6. Add authorized JavaScript origins:
   ```
   http://localhost:3013
   http://localhost:3000
   https://yourdomain.com
   ```
7. Add authorized redirect URIs:
   ```
   http://localhost:3013/
   http://localhost:3000/
   https://yourdomain.com/
   ```
8. Copy your **Client ID** from the credentials page

### Step 2: Update App.jsx

In `src/App.jsx`, find this line:
```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
```

Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID:
```javascript
const GOOGLE_CLIENT_ID = "123456789-abcdefghijklmnop.apps.googleusercontent.com";
```

## Files Modified

### 1. **App.jsx**
- Added `GoogleOAuthProvider` wrapper around the entire app
- Requires your Google Client ID

### 2. **GoogleSignInButton.jsx** (New Component)
- Reusable Google Sign-In button component
- Props: `userRole` ("customer" or "provider"), `onSuccess` (optional callback)
- Handles Google authentication flow
- Stores user data in localStorage
- Automatically redirects to complete profile page

### 3. **Login.jsx**
- Added Google Sign-In button below the traditional login button
- Shows "OR" divider between methods
- Supports customer role by default

### 4. **Register.jsx**
- Added Google Sign-In button below the registration form
- Dynamically uses selected role (Customer or Provider)
- Divider between form submission and Google sign-in
- Works with both customer and provider registration flows

## Component: GoogleSignInButton

### Usage
```jsx
<GoogleSignInButton 
  userRole="customer"  // "customer" or "provider"
  onSuccess={(userData) => {
    // Optional: handle successful sign-in
    console.log("Signed in as:", userData.name);
  }}
/>
```

### User Data Structure
When a user signs in with Google, the following data is stored in localStorage:
```javascript
{
  _id: "google_123456789",
  name: "User Name",
  email: "user@gmail.com",
  profilePicture: "https://...",
  authMethod: "google",
  role: "customer", // or "provider"
  profileCompleted: false,
  domain: "", // For providers only
  googleId: "123456789"
}
```

## User Flow

### Login with Google
1. User clicks "Sign in with Google" button on Login page
2. Google OAuth dialog appears
3. User selects their Google account
4. System extracts user email and name
5. User is logged in as Customer
6. Redirected to complete profile page if needed

### Register with Google
1. User selects "Customer" or "Provider" role
2. For providers, selects professional domain
3. Clicks "Sign in with Google" as alternative to form
4. Google OAuth authenticates
5. User account is created with Google data
6. Redirected to complete profile page
7. For providers, they can confirm/update their domain

## Frontend-Only Demo Mode
Currently, this is frontend-only with localStorage. In production:

### To Connect to Backend
1. Modify `GoogleSignInButton.jsx` to send token to backend:
```javascript
const response = await axios.post("/api/auth/google-signin", {
  googleToken: codeResponse.access_token,
  role: userRole
});
```

2. Backend should:
   - Verify Google token with Google API
   - Check if user exists in database
   - Create new user if needed
   - Return authentication token
   - Return complete user object

3. Update `AuthContext.jsx` to handle backend tokens

## Security Notes

### Current State (Frontend Demo)
- Tokens stored in localStorage (demo only)
- No backend verification
- Google ID tokens not validated
- Suitable for development/testing only

### For Production
- Implement backend token verification
- Use httpOnly cookies instead of localStorage
- Validate ID tokens with Google's servers
- Implement CSRF protection
- Use HTTPS only
- Implement rate limiting on auth endpoints

## Testing the Implementation

### Test Credentials
You can use any Google account for testing:
1. Go to http://localhost:3013/login
2. Click "Sign in with Google"
3. Select any Google account
4. Should log in and redirect to complete profile

### Test as Provider
1. Go to http://localhost:3013/register
2. Select "🏥 Provider (Offer services)"
3. Choose a professional domain
4. Click "Sign in with Google"
5. Should register as provider

## Customization

### Styling
The Google Sign-In button uses Tailwind CSS. To customize:

In `GoogleSignInButton.jsx`, modify the button className:
```jsx
<button
  className="w-full flex items-center justify-center gap-3 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
>
```

### Button Text
To change button text, modify in `GoogleSignInButton.jsx`:
```jsx
Sign in with Google  // Change this text
```

### Add GitHub Sign-In
To add GitHub as an alternative:
1. Install `@react-oauth/github` (or similar)
2. Create `GitHubSignInButton.jsx` similar to `GoogleSignInButton.jsx`
3. Add to Login.jsx and Register.jsx

## Troubleshooting

### Issue: "Google is not defined" error
- Ensure `GoogleOAuthProvider` is properly imported and wrapping the app
- Check that `clientId` prop is set on `GoogleOAuthProvider`

### Issue: Sign-in button not appearing
- Verify `@react-oauth/google` is installed: `npm list @react-oauth/google`
- Check browser console for errors
- Ensure GoogleSignInButton is properly imported

### Issue: "Invalid Client ID" error
- Verify Client ID is correct in App.jsx
- Check that authorized origins include your localhost port
- Check that redirect URIs include your app URL

### Issue: User not redirected after sign-in
- Check browser console for errors
- Verify `useNavigate` hook is working
- Check localStorage for user data

## Next Steps

1. **Get Google Client ID** and update App.jsx
2. **Test Login/Register pages** with Google Sign-In
3. **Create GitHub Sign-In** (optional, similar implementation)
4. **Connect to Backend** for production
5. **Implement Profile Completion** flow for new users
6. **Add Social Media Links** to user profiles

## API Endpoints (When Backend Ready)

```
POST /api/auth/google-signin
- Request: { googleToken, role }
- Response: { user, token }

POST /api/auth/register/google
- Request: { googleToken, role, domain? }
- Response: { user, token }

GET /api/auth/verify-google-token
- Request: { token }
- Response: { isValid, userData }
```

## Support

For issues or questions about Google Sign-In integration, refer to:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [React Router Documentation](https://reactrouter.com/)

