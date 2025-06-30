# 🚨 CORS Fix Guide for Signup System

## Current Issue

Your frontend is running on `http://localhost:5175` but your backend CORS is configured for `http://localhost:5173`. This causes the signup API calls to be blocked.

## Backend Fix Required (URGENT) 🔧

### Option 1: Quick Fix - Update Backend CORS Configuration

In your backend server file (usually `server.js`, `app.js`, or similar), update the CORS configuration:

```javascript
// If using Express.js with cors middleware
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5175", // Add this line
      "http://localhost:3000", // Add any other ports you use
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
```

### Option 2: Manual CORS Headers

```javascript
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5175", // Add this line
    "http://localhost:3000",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### Option 3: Change Frontend Port

If you can't modify the backend, change your frontend to run on port 5173:

```json
// In package.json, update the dev script:
"scripts": {
  "dev": "vite --port 5173"
}
```

## Development Environment Fix 🛠️

### 1. Check Backend Server Status

```bash
# Check if backend is running on port 4000
netstat -an | findstr :4000

# Or check with PowerShell
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
```

### 2. Test API Endpoints Manually

```bash
# Test if the endpoint exists
curl -X POST http://localhost:4000/api/v1/auth/create-client-with-admin \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\"}"
```

### 3. Verify Environment Variables

Check that your `.env` file is being loaded:

- Make sure the file is in the project root
- Restart your development server after creating/modifying `.env`
- Check browser console for the actual API URL being used

## Frontend Debugging Steps 🔍

### 1. Check Network Tab

- Open browser DevTools > Network tab
- Look for the failed request to see the exact URL being called
- Check if the request is being sent to the correct port

### 2. Verify API Client Configuration

The current API client should be using:

- Base URL: `http://localhost:4000/api/v1`
- Headers: `Content-Type: application/json`
- Credentials: `withCredentials: true`

### 3. Test with Different Browsers

Sometimes browser caching can cause issues. Try:

- Chrome Incognito mode
- Firefox private browsing
- Clear browser cache and cookies

## Quick Test Commands 🧪

Run these in your terminal to verify the setup:

```bash
# 1. Check if frontend port is correct
echo "Frontend should be running on http://localhost:5175"

# 2. Check if backend is accessible
curl -I http://localhost:4000/api/v1/auth/create-client-with-admin

# 3. Verify environment variables are loaded
# (This will show in browser console when you try signup)
```

## Immediate Actions Required ⚡

1. **Backend Team**: Update CORS configuration to include `http://localhost:5175`
2. **Frontend Team**: Test with the updated error messages to get clearer debugging info
3. **DevOps Team**: Document the port configuration for consistent development

## Expected Error Messages After Fix 📝

After fixing CORS, you might see different errors that will help identify other issues:

- ✅ "Unable to connect to server" → Backend not running
- ✅ "API endpoint not found" → Wrong route or method
- ✅ "Server error" → Backend logic issue
- ✅ Specific validation errors → Form data issues

## Testing the Fix 🎯

1. Update backend CORS configuration
2. Restart backend server
3. Clear browser cache
4. Try signup again
5. Check browser DevTools Network tab for successful preflight OPTIONS request
6. Verify POST request goes through without CORS error

---

**Status**: 🔴 CORS issue blocking all API calls
**Priority**: HIGH - Blocks all authentication functionality
**ETA**: Should be fixed within 1 hour with backend update
