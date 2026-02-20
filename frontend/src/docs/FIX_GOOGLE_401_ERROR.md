# Fix Google Sign-In Error 401: invalid_client

## 🔴 Problem
You're seeing: `Error 401: invalid_client` when clicking Google Sign-In button

## ✅ Root Causes & Solutions

### Cause 1: Client ID Not Set (Most Common)
**Current state in App.jsx:**
```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
```

**Fix:** Replace with your actual Client ID

### Cause 2: Wrong Client ID Format
Google Client IDs look like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

### Cause 3: Authorized Origins Not Configured
Your localhost origin not added to Google Cloud Console

## 🛠️ Step-by-Step Fix

### Step 1: Create Google OAuth 2.0 Credentials

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a Project" at the top
   - Click "NEW PROJECT"
   - Enter project name: `DocBook` (or any name)
   - Click "CREATE"
   - Wait for creation to complete

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on "Google+ API"
   - Click "ENABLE"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "CREATE CREDENTIALS"
   - Select "OAuth client ID"
   - If prompted: "Configure OAuth consent screen first"
     - Choose "External"
     - Fill in required fields (app name, user support email, etc.)
     - Click "SAVE AND CONTINUE"
     - Click "SAVE AND CONTINUE" again (no scopes needed for demo)
     - Click "SAVE AND CONTINUE" (test users - optional)
     - Click "SAVE AND CONTINUE"
     - Click "BACK TO DASHBOARD"

5. **Create the OAuth 2.0 Credential Again**
   - Go to "Credentials" again
   - Click "CREATE CREDENTIALS" > "OAuth client ID"
   - Choose: **"Web application"**
   - Under "Authorized JavaScript origins", ADD:
     ```
     http://localhost:3000
     http://localhost:3013
     http://localhost:3014
     http://localhost:5173
     http://127.0.0.1:3014
     ```
   - Under "Authorized redirect URIs", ADD:
     ```
     http://localhost:3000/
     http://localhost:3013/
     http://localhost:3014/
     http://localhost:5173/
     ```
   - Click "CREATE"

6. **Copy Your Client ID**
   - A dialog appears showing your credentials
   - Copy the "Client ID" (looks like: `123456789-abc...apps.googleusercontent.com`)
   - Save it somewhere safe

### Step 2: Update App.jsx with Your Client ID

**File:** `c:\Users\vasuj\project\frontend\src\App.jsx`

**Find this line (around line 70):**
```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
```

**Replace with your actual Client ID:**
```javascript
const GOOGLE_CLIENT_ID = "YOUR_ACTUAL_CLIENT_ID_123456789.apps.googleusercontent.com";
```

### Step 3: Restart Dev Server

Close the current server (Ctrl+C) and restart:
```bash
cd c:\Users\vasuj\project\frontend
npm run dev
```

### Step 4: Clear Browser Cache

1. Press **F12** to open DevTools
2. Press **Ctrl+Shift+Delete** to clear cache
3. Or use Incognito/Private mode

### Step 5: Test It

1. Go to http://localhost:3014/login
2. Click "Sign in with Google"
3. Select your Google account
4. Should work now! ✅

## 🚨 Common Issues & Fixes

### Issue: Still Getting 401 Error
- ✅ Double-check Client ID has no extra spaces
- ✅ Verify http://localhost:3014 is in authorized origins
- ✅ Wait 5 minutes for Google Console settings to propagate
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Try Incognito mode

### Issue: Pop-up Blocked
- ✅ Check browser's pop-up blocker
- ✅ Allow pop-ups for localhost:3014
- ✅ Try different browser

### Issue: Redirect URI Mismatch
- ✅ Add `http://localhost:3014/` to authorized redirect URIs
- ✅ Ensure trailing slash is there
- ✅ Add both `localhost:3014` and `127.0.0.1:3014`

### Issue: JavaScript Origin Mismatch
- ✅ Add `http://localhost:3014` (without trailing slash) to JavaScript origins
- ✅ Also add `http://127.0.0.1:3014`

## 📋 Quick Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Web Application credentials
- [ ] Added http://localhost:3014 to authorized origins
- [ ] Added http://localhost:3014/ to authorized redirect URIs
- [ ] Copied Client ID
- [ ] Updated App.jsx with Client ID
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Tested Google Sign-In button

## 🎯 Expected Result

When you click "Sign in with Google":
1. Google popup appears
2. Select your account
3. Auto-redirect back to your app
4. Logged in successfully! ✅

## 💡 Alternative: Test Without Google Sign-In

While setting up, you can still:
- Use demo credentials (john_doe / Customer@123)
- Test other features (appointments, filtering, etc.)
- Come back to Google setup once credentials are ready

## 🔗 Resources

- Google Cloud Console: https://console.cloud.google.com/
- OAuth Setup Guide: https://developers.google.com/identity/protocols/oauth2/web-server-flow
- @react-oauth/google Docs: https://www.npmjs.com/package/@react-oauth/google

## 📞 Need Help?

If you're still stuck:
1. Share your exact error message
2. Verify Client ID format: `XXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`
3. Check authorized origins list in Google Console
4. Ensure port matches (3014 in your case)

---

**Next Step:** Get your Google Client ID and update App.jsx! 🚀

