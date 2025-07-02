# Google OAuth Setup Guide

## Problem Description

The CORS error occurs because:

1. Frontend uses `withCredentials: true` in Axios
2. Backend returns `Access-Control-Allow-Origin: *`
3. When credentials are included, browsers require specific origin, not wildcard

## Frontend Solution ✅ (Already Fixed)

### 1. Modified Google Auth Flow

- `googleAuth` now redirects directly to backend OAuth URL
- `googleAuthCallback` uses axios without credentials
- Components simplified to handle direct redirect

### 2. Updated Files

- ✅ `src/store/slices/authSlice.ts` - Modified Google auth functions
- ✅ `src/pages/Login/Login.tsx` - Simplified Google auth handler
- ✅ `src/pages/signup/Signup.tsx` - Simplified Google auth handler
- ✅ `src/components/GoogleAuthCallback.tsx` - Ready for callback handling
- ✅ `src/routes/index.tsx` - Route already configured

## Backend Requirements 🔧 (Need to Configure)

Your backend needs these CORS settings for Google OAuth:

### Option 1: Express.js with cors middleware

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Special handling for Google OAuth endpoint
app.get('/api/v1/auth/google', (req, res) => {
  // Don't set credentials for this endpoint - just redirect
  const googleAuthUrl = \`https://accounts.google.com/oauth/authorize?...
  res.redirect(googleAuthUrl);
});
```

### Option 2: Manual CORS Headers

```javascript
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
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

## Google OAuth Setup 📱

### 1. Google Console Configuration

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create/select project
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URIs:
  - `http://localhost:4000/api/v1/auth/google/callback`
  - `https://yourdomain.com/api/v1/auth/google/callback` (production)

### 2. Environment Variables

Add to your backend `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Backend Route Implementation

```javascript
// GET /api/v1/auth/google - Initiate OAuth
app.get('/api/v1/auth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = \`https://accounts.google.com/oauth/authorize?\${new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'email profile',
    state: state,
    access_type: 'offline'
  })}\`;

  res.redirect(authUrl);
});

// POST /api/v1/auth/google/callback - Handle callback
app.post('/api/v1/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    });

    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: \`Bearer \${tokenResponse.data.access_token}\` }
    });

    // Create/find user in database
    const user = await createOrFindUser(userResponse.data);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
});
```

## Testing Steps 🧪

1. **Start Backend**: Make sure your backend is running on `http://localhost:4000`
2. **Update CORS**: Apply the CORS configuration above
3. **Test Google Button**: Click Google icon - should redirect to Google
4. **Check Callback**: After Google auth, should redirect to `/auth/google/callback`
5. **Verify Login**: Should end up logged in on home page

## Troubleshooting 🔍

### Common Issues:

1. **Still getting CORS errors**: Backend CORS not configured correctly
2. **Redirect loop**: Check Google Console redirect URIs
3. **Callback fails**: Verify callback route implementation
4. **Token not saved**: Check localStorage in browser dev tools

### Debug Tips:

- Check Network tab in browser dev tools
- Verify backend logs for CORS headers
- Test API endpoints directly with Postman
- Check Google Console for OAuth configuration

## Production Deployment 🚀

### Frontend:

- Update `VITE_API_URL` to production API URL
- Build and deploy frontend

### Backend:

- Update CORS origins to production domain
- Configure Google OAuth with production callback URL
- Set production environment variables
