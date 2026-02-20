# Complete Google Sign-In Setup & Troubleshooting Guide

## 🎯 Quick Fix for 401 Error

### The Error You're Seeing
```
Error 401: invalid_client
Request details: flowName=GeneralOAuthFlow
```

### Why This Happens
The Google OAuth system cannot identify your application because:
1. ❌ Client ID not set (still showing placeholder)
2. ❌ Client ID is incorrect or malformed
3. ❌ Authorized origins not configured in Google Console
4. ❌ Redirect URI mismatch
5. ❌ Client ID for wrong application type

---

## ✅ 3-Minute Fix

### Option 1: Using .env File (Recommended) ⭐

**Step 1:** Look for `.env` in your project root:
```
c:\Users\vasuj\project\frontend\.env
```

**Step 2:** Edit the file and find this line:
```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Step 3:** Replace with your actual Client ID (from Google Console):
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
```

**Step 4:** Save the file

**Step 5:** Restart dev server:
```bash
cd c:\Users\vasuj\project\frontend
npm run dev
```

**Done!** 🎉

---

### Option 2: Direct Code Edit

**File:** `c:\Users\vasuj\project\frontend\src\App.jsx`

**Find (around line 70):**
```javascript
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
```

**Replace with:**
```javascript
const GOOGLE_CLIENT_ID = "123456789-abcdefghijk.apps.googleusercontent.com"; // Your actual ID
```

**Restart server and test**

---

## 🚀 Get Your Google Client ID (5 Steps)

### Step 1: Go to Google Cloud Console
- URL: https://console.cloud.google.com/
- Sign in with Google account

### Step 2: Create Project
- Click "Select a Project" (top left)
- Click "NEW PROJECT"
- Name: "DocBook" (or any name)
- Click "CREATE"
- Wait for completion

### Step 3: Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search: "Google+ API"
- Click "Google+ API"
- Click "ENABLE"
- Wait for completion

### Step 4: Create OAuth Credentials
- Go to "APIs & Services" → "Credentials"
- Click "CREATE CREDENTIALS" → "OAuth client ID"
- If asked to configure consent screen:
  - Choose "External" → Fill form → "SAVE AND CONTINUE"
  - Skip scopes → "SAVE AND CONTINUE"
  - Add test user (email) → "SAVE AND CONTINUE"
  - Return to credentials

### Step 5: Configure Web Application
- Click "CREATE CREDENTIALS" → "OAuth client ID"
- Type: Select **"Web application"**
- Name: "DocBook Frontend" (or any name)

### Add Authorized Origins:
Click "ADD URI" under "Authorized JavaScript origins" and add:
```
http://localhost:3000
http://localhost:3013
http://localhost:3014
http://localhost:5173
http://127.0.0.1:3014
```

### Add Authorized Redirect URIs:
Click "ADD URI" under "Authorized redirect URIs" and add:
```
http://localhost:3000/
http://localhost:3013/
http://localhost:3014/
http://localhost:5173/
```

### Get Your Client ID:
- Click "CREATE"
- A popup shows your credentials
- **COPY the Client ID** (format: `123456789-abc...apps.googleusercontent.com`)
- Click elsewhere to close or "Download" to save

---

## 🔍 Verify Your Setup

### Checklist Before Testing

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Web Application credentials created
- [ ] Client ID format correct (ends with `.apps.googleusercontent.com`)
- [ ] `http://localhost:3014` in authorized origins (no trailing slash)
- [ ] `http://localhost:3014/` in authorized redirect URIs (with trailing slash)
- [ ] Client ID added to `.env` or `App.jsx`
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Using http:// not https:// for localhost

### Expected Client ID Format
```
CORRECT: 123456789-abcdefghijklmnopqrstuvwxyz1234.apps.googleusercontent.com
WRONG:   YOUR_GOOGLE_CLIENT_ID_HERE
WRONG:   123456789 (too short)
WRONG:   https://... (no https for localhost)
```

---

## 🧪 Test the Setup

### Step 1: Start Development Server
```bash
cd c:\Users\vasuj\project\frontend
npm run dev
```

Output should show:
```
VITE v5.4.21  ready in 441 ms
➜  Local:   http://localhost:3014/
```

### Step 2: Clear Browser Cache
- Press **F12** (DevTools)
- Press **Ctrl+Shift+Delete** (Clear Cache)
- Or use **Incognito Mode** (Ctrl+Shift+N on Chrome)

### Step 3: Navigate to Login
- Go to: http://localhost:3014/login
- Scroll down to find "Sign in with Google" button

### Step 4: Test Sign-In
1. Click "Sign in with Google"
2. Google popup should appear
3. Select your Google account
4. You should be logged in! ✅

### Step 5: If You Get 401 Error
1. Check browser console (F12)
2. Look for error messages
3. Verify Client ID is set (not "YOUR_...")
4. Check that origins are properly configured
5. Wait 5 minutes and try again (Google takes time to propagate)

---

## 🐛 Common Issues & Fixes

### Issue 1: "YOUR_GOOGLE_CLIENT_ID_HERE" Still Showing
**Problem:** Client ID not set in .env or App.jsx

**Solution:**
1. Edit `.env` file (or App.jsx)
2. Add your actual Client ID
3. Restart dev server
4. Refresh browser

### Issue 2: Error 401: invalid_client
**Problem:** Client ID doesn't exist or is malformed

**Checklist:**
- ✅ No extra spaces in Client ID
- ✅ Full Client ID copied (including `.apps.googleusercontent.com` part)
- ✅ Using correct Client ID (from "Web application" type)
- ✅ Not using admin/service account credentials

**Fix:**
1. Go back to Google Console
2. Delete the OAuth credential
3. Create a new one (Web application type only)
4. Copy ID again (carefully)
5. Update App.jsx or .env
6. Restart server

### Issue 3: "Popup blocked" Error
**Problem:** Browser blocked the Google authentication popup

**Solution:**
1. Check browser popup blocker
2. Allow popups for localhost:3014
3. Disable adblocker temporarily
4. Try Incognito mode (usually no blockers)

### Issue 4: "Unauthorized request" Error
**Problem:** Authorized origins not configured

**Solution:**
1. Go to Google Console > Credentials
2. Click OAuth credential
3. Add `http://localhost:3014` (without trailing slash)
4. Click "SAVE"
5. Wait 5 minutes
6. Try again

### Issue 5: "Mismatched redirect URI" Error
**Problem:** Redirect URI format mismatch

**Solution:**
1. Go to Google Console > Credentials
2. Edit OAuth credential
3. Check "Authorized redirect URIs"
4. Should have BOTH:
   - `http://localhost:3014` (in origins)
   - `http://localhost:3014/` (in URIs - with slash)
5. Add if missing
6. Save and wait 5 minutes

### Issue 6: Still Works in Some Browsers but Not Others
**Problem:** Cache issue or browser extension blocking

**Solution:**
1. Clear cache (Ctrl+Shift+Delete)
2. Try Incognito mode
3. Try different browser
4. Disable extensions (if any are security-related)

---

## 📋 Configuration Verification

### Check If Setup Is Correct

**In .env file:**
```bash
# Should NOT be:
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

# Should BE:
VITE_GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
```

**In App.jsx:**
```javascript
// Should NOT be:
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";

// Should BE:
const GOOGLE_CLIENT_ID = "123456789-abc...apps.googleusercontent.com";
```

**In Google Cloud Console:**
```
Authorized origins:
✅ http://localhost:3014
✅ http://127.0.0.1:3014
✅ http://localhost:3000 (if using different port)

Authorized Redirect URIs:
✅ http://localhost:3014/
✅ http://127.0.0.1:3014/
```

---

## 🎯 Testing Scenarios

### Scenario 1: First-Time Sign-In
1. User not logged in
2. Click "Sign in with Google"
3. Select account
4. Redirect to complete profile
5. Fill profile information
6. Redirect to dashboard ✅

### Scenario 2: Already Logged in to Google
1. User already has Google popup showing login
2. Click "Sign in with Google"
3. Auto-select account (no manual selection)
4. Instant redirect ✅

### Scenario 3: Provider Sign-In
1. Go to `/register`
2. Select "Provider" role
3. Choose domain (e.g., Doctor)
4. Click "Sign in with Google"
5. Redirect to complete profile
6. Domain pre-selected ✅

---

## 💾 Configuration Files Reference

### .env File
```
Location: c:\Users\vasuj\project\frontend\.env

VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
```

### App.jsx (Fallback)
```
Location: src/App.jsx (around line 70)

const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID";
```

---

## 📞 Support Resources

- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **@react-oauth/google:** https://www.npmjs.com/package/@react-oauth/google
- **Google Cloud Console:** https://console.cloud.google.com/

---

## ✨ After Setup Works

### Next Steps:
1. Test all three roles (Admin, Customer, Provider)
2. Test appointment booking flow
3. Test provider filtering
4. Test appointment actions
5. When ready: Connect to backend API

### For Production:
1. Update Google Cloud to production environment
2. Add production domain to authorized origins
3. Use HTTPS only
4. Implement backend token verification
5. Use secure session cookies

---

## 🚀 You're Ready!

**You have everything you need:**
- ✅ Google Sign-In component ready
- ✅ Error handling in place
- ✅ Environment variable support
- ✅ Documentation complete

**Next: Get your Client ID and test!** 🎉

