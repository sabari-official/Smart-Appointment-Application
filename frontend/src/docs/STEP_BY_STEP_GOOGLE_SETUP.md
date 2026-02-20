# 🚨 ERROR: "The OAuth client was not found"

## What This Means
Your app is trying to use Google Sign-In but no Google credentials exist yet. You need to create them in Google Cloud Console.

---

## ✅ COMPLETE STEP-BY-STEP FIX (10 Minutes)

### **PART 1: CREATE GOOGLE CLOUD PROJECT**

#### Step 1A: Open Google Cloud Console
- Go to: https://console.cloud.google.com/
- Sign in with your Google account (vasujagan382@gmail.com)
- Click "Create" or "New Project" if you see it

#### Step 1B: Create New Project
1. At the top left, click the **Project Dropdown** (shows "Select a project")
2. A popup shows "New Project"
3. Click "NEW PROJECT"
4. Enter Name: `DocBook`
5. Click "CREATE"
6. Wait 30 seconds for it to finish
7. The new project should automatically select

**Verify:** Top left now shows "DocBook" ✅

---

### **PART 2: ENABLE GOOGLE+ API**

#### Step 2A: Go to API Library
1. In left sidebar, find "APIs & Services"
2. Click "Library"

#### Step 2B: Find and Enable Google+ API
1. In search box, type: `Google+ API`
2. Click "Google+ API" from results
3. Click **ENABLE** button (blue)
4. Wait for it to enable (shows checkmark)

**Verify:** Page shows "Google+ API is enabled" ✅

---

### **PART 3: CREATE OAUTH CREDENTIALS**

#### Step 3A: Go to Credentials
1. In left sidebar, click "APIs & Services"
2. Click "Credentials"

#### Step 3B: Configure OAuth Consent Screen
You might see a message: "To use OAuth 2.0, you need to create credentials"
1. Click "CREATE CREDENTIALS"
2. Select **"OAuth client ID"**
3. A message appears: "You need to configure the OAuth consent screen first"
4. Click "CONFIGURE CONSENT SCREEN"
5. Choose **"External"** (for testing)
6. Click **CREATE**

Fill the form:
- **App name:** DocBook
- **User support email:** vasujagan382@gmail.com  
- **Developer contact:** vasujagan382@gmail.com
- Click **SAVE AND CONTINUE**

**Scopes:** Just click **SAVE AND CONTINUE** (skip scopes)

**Test users:** Just click **SAVE AND CONTINUE** (optional)

**Summary:** Click **BACK TO DASHBOARD**

**Verify:** Now you're back on Credentials page ✅

---

#### Step 3C: Create OAuth Client ID
1. Click **CREATE CREDENTIALS**
2. Select **"OAuth client ID"**
3. For **Application type**, select **"Web application"**
4. For **Name**, enter: `DocBook Frontend`

**IMPORTANT - Add URL Restrictions:**

Look for "**Authorized JavaScript origins**" section:
1. Click **ADD URI**
2. Enter: `http://localhost:3014`
3. Click **ADD URI** again
4. Enter: `http://localhost:3013`
5. Click **ADD URI** again  
6. Enter: `http://localhost:3000`
7. Click **ADD URI** again
8. Enter: `http://127.0.0.1:3014`

Look for "**Authorized redirect URIs**" section:
1. Click **ADD URI**
2. Enter: `http://localhost:3014/`
3. Click **ADD URI** again
4. Enter: `http://localhost:3013/`
5. Click **ADD URI** again
6. Enter: `http://localhost:3000/`
7. Click **ADD URI** again
8. Enter: `http://127.0.0.1:3014/`

**Important:** Note the trailing `/` on redirect URIs!

Click **CREATE**

---

### **PART 4: COPY YOUR CLIENT ID**

A popup appears showing your OAuth 2.0 credentials:

**You will see:**
```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client secret: GOCSPX-XXXXXXXXXXXXXXXX
```

**COPY THE CLIENT ID** (entire long string)
- Right-click → Copy
- Or click the copy icon next to it
- Paste it somewhere safe (notepad)

**Click outside popup** or Find "Credentials" → Click OAuth credential to view anytime

✅ **NOW YOU HAVE YOUR CLIENT ID!**

---

## ✅ PART 5: ADD CLIENT ID TO YOUR APP

### Option A: Update .env File (RECOMMENDED)

**File:** `c:\Users\vasuj\project\frontend\.env`

**Open the file in VS Code**
- Press Ctrl+K, Ctrl+O
- Find `.env` in frontend folder
- The file should look like:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENVIRONMENT=development
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Find this line:**
```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Replace with your actual Client ID:**
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

(Paste your actual Client ID from Part 4)

**Press Ctrl+S** to save

✅ **DONE!**

---

### Option B: Update App.jsx (If .env doesn't work)

**File:** `c:\Users\vasuj\project\frontend\src\App.jsx`

**Find (around line 70):**
```javascript
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
```

**Replace with:**
```javascript
const GOOGLE_CLIENT_ID = "123456789-abcdefghijklmnop.apps.googleusercontent.com";
```

(Paste your actual Client ID from Part 4)

**Press Ctrl+S** to save

✅ **DONE!**

---

## ✅ PART 6: TEST IT!

### Step 1: Kill Previous Dev Server
- Find the terminal running `npm run dev`
- Press **Ctrl+C** to stop it

### Step 2: Clear Browser Cache
- Press **F12** to open DevTools
- Press **Ctrl+Shift+Delete** to clear cache
- Or use **Incognito Mode** (Ctrl+Shift+N on Chrome)

### Step 3: Start Dev Server Again
```bash
cd c:\Users\vasuj\project\frontend
npm run dev
```

Wait for:
```
VITE v5.4.21  ready in 441 ms
➜  Local:   http://localhost:3014/
```

### Step 4: Test Google Sign-In
1. Go to: **http://localhost:3014/login**
2. Scroll down, find **"Sign in with Google"** button
3. Click it
4. Select your Google account (vasujagan382@gmail.com)
5. **SHOULD WORK!** ✅ You'll see welcome message

---

## 🎯 Checklist (Before Testing)

- [ ] Created Google Cloud Project (named "DocBook")
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Web Application credential
- [ ] Added `http://localhost:3014` to JavaScript origins
- [ ] Added `http://localhost:3014/` to Redirect URIs
- [ ] Also added ports 3013, 3000, 127.0.0.1:3014
- [ ] Copied full Client ID
- [ ] Updated .env or App.jsx with Client ID
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Used http:// (not https://) for localhost

---

## ✅ Expected Results

When you click "Sign in with Google":
```
✅ NO ERROR
✅ Google popup appears
✅ You select your account
✅ Automatic redirect
✅ "Welcome [Your Name]!" message
✅ Redirected to complete profile
✅ Success! 🎉
```

---

## 🐛 If Still Getting 401/402 Error

### 1. Check Spelling
- Open .env or App.jsx
- Copy your Client ID and verify it's correct
- No extra spaces, special characters

### 2. Verify Origins
In Google Cloud Console:
- Go to Credentials
- Click your OAuth credential
- Check "Authorized JavaScript origins" includes:
  - `http://localhost:3014` (no trailing slash)
  - `http://127.0.0.1:3014` (for localhost IP)

### 3. Verify Redirect URIs
In Google Cloud Console > same credential:
- Check "Authorized Redirect URIs" includes:
  - `http://localhost:3014/` (with trailing slash)
  - `http://127.0.0.1:3014/` (with trailing slash)

### 4. Wait 5 Minutes
Google takes time to propagate changes. Wait and try again.

### 5. Try Incognito Mode
Press **Ctrl+Shift+N** (Chrome) or **Ctrl+Shift+P** (Firefox)
- No cache issues
- More reliable for testing

---

## 💡 During Setup (Use Demo Credentials)

While setting up Google Sign-In, you can test everything with:

**Customer Login:**
- Username: `john_doe`
- Password: `Customer@123`

**Provider Login:**
- Username: `dr_smith`
- Password: `Provider@123`

**Admin Login:**
- Username: `mrvoid_24`
- Password: `Noadmin_24`

---

## 📞 Still Stuck?

If something doesn't work:
1. **Error message:** Tell me exactly what it says
2. **Step failed:** Tell me which step
3. **Client ID:** Verify format is `XXXXXXXX-XXXXXXXX.apps.googleusercontent.com`
4. **Port:** Confirm using localhost:3014 (not 3000 or 3013)

---

## ✨ You're Almost There!

You have everything set up. Just need your Google Client ID (takes 10 minutes). After that, Google Sign-In will work perfectly! 🚀

**Next Step:** Start with **PART 1: CREATE GOOGLE CLOUD PROJECT** above! 👆

