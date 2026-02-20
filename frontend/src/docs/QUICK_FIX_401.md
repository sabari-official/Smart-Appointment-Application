# 🚀 QUICK FIX: Error 401 - invalid_client

## What's Wrong
Google doesn't recognize your app because Client ID is not set or is wrong.

## The Fix (Pick One)

### ✅ EASIEST: Edit .env File

**File:** `c:\Users\vasuj\project\frontend\.env`

**Find this line:**
```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Replace with your actual Client ID:**
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**Save & Restart Server**

---

### Alternative: Edit App.jsx

**File:** `c:\Users\vasuj\project\frontend\src\App.jsx` (Line ~70)

**Find:**
```javascript
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
```

**Change to:**
```javascript
const GOOGLE_CLIENT_ID = "123456789-abcdefghijklmnop.apps.googleusercontent.com";
```

---

## Get Your Client ID (5 Minutes)

1. Go to: **https://console.cloud.google.com/**
2. Create new project
3. Enable **Google+ API**
4. Create **OAuth 2.0 Web Application** credentials
5. Add origins:
   - `http://localhost:3014`
   - `http://localhost:3013`
   - `http://localhost:3000`
6. Add redirect URIs:
   - `http://localhost:3014/`
   - `http://localhost:3013/`
   - `http://localhost:3000/`
7. **COPY CLIENT ID** ← Use this value above

---

## Test It

1. **Restart server:**
   ```bash
   cd c:\Users\vasuj\project\frontend
   npm run dev
   ```

2. **Clear cache:** Press `Ctrl+Shift+Delete`

3. **Go to:** `http://localhost:3014/login`

4. **Click:** "Sign in with Google"

5. **Should work!** ✅

---

## Still Getting 401?

- [ ] No extra spaces in Client ID
- [ ] Client ID format: `XXX-XXX.apps.googleusercontent.com`
- [ ] Added `http://localhost:3014` to authorized origins
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Waited 5 minutes (Google takes time)
- [ ] Not using HTTPS for localhost (use HTTP)
- [ ] Using Web Application type (not Service Account)

✅ Do ALL these steps in order!

---

## 📚 Full Documentation

For complete setup and troubleshooting, see:
- `src/docs/FIX_GOOGLE_401_ERROR.md`
- `src/docs/GOOGLE_COMPLETE_TROUBLESHOOTING.md`
- `src/docs/GOOGLE_SIGNIN_SETUP.md`

---

## 💡 Demo Mode (While Setting Up)

You can still test everything with demo credentials:
- **Customer:** john_doe / Customer@123
- **Provider:** dr_smith / Provider@123  
- **Admin:** mrvoid_24 / Noadmin_24

Google Sign-In optional! 🎯
