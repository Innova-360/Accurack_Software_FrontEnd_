# Axios Configuration Guide

This project uses Axios for HTTP requests with credentials enabled and proper error handling.

## 📁 File Structure

```
src/
├── services/
│   ├── api.ts              # Main Axios configuration
│   ├── authAPI.ts          # Authentication API calls
│   ├── genericAPI.ts       # Generic CRUD operations
│   └── index.ts            # Service exports
├── store/
│   └── slices/
│       └── authSlice.ts    # Updated to use Axios
```

## 🔧 Configuration

### Axios Instance (`src/services/api.ts`)

- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Credentials**: Enabled with `withCredentials: true`
- **Timeout**: 10 seconds default
- **Headers**: JSON content type and accept headers
- **Interceptors**: Request/response interceptors for token handling and error management

### Key Features

1. **Automatic Token Handling**: Adds Bearer token from localStorage to requests
2. **Error Handling**: Centralized error handling with specific status code responses
3. **Request/Response Logging**: Console logging for debugging (remove in production)
4. **Credential Support**: Cookies and authentication headers included in requests

## 🚀 Usage Examples

### Basic API Calls

```typescript
import { api } from '../services/api';

// GET request
const response = await api.get('/users');

// POST request
const response = await api.post('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const response = await api.put('/users/1', { name: 'Jane' });

// DELETE request
const response = await api.delete('/users/1');
```

### Authentication API

```typescript
import { authAPI } from '../services/authAPI';

// Login
const loginResponse = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const registerResponse = await authAPI.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Logout
await authAPI.logout();
```

### Generic API Service

```typescript
import { APIService } from '../services/genericAPI';

// Create a service for your entity
const productService = new APIService('/products');

// Use CRUD operations
const products = await productService.getAll();
const product = await productService.getById(1);
const newProduct = await productService.create({ name: 'New Product' });
const updatedProduct = await productService.update(1, { name: 'Updated Product' });
await productService.delete(1);
```

### Redux Integration

The auth slice has been updated to use Axios:

```typescript
import { useAppDispatch } from '../store/hooks';
import { loginUser, registerUser, logoutUser } from '../store/slices/authSlice';

const dispatch = useAppDispatch();

// Login user
dispatch(loginUser({ email: 'user@example.com', password: 'password' }));

// Register user
dispatch(registerUser({ 
  name: 'John Doe',
  email: 'john@example.com', 
  password: 'password' 
}));

// Logout user
dispatch(logoutUser());
```

## 🔐 Authentication Flow

1. **Login/Register**: Credentials sent to server
2. **Token Storage**: JWT token stored in localStorage
3. **Request Interceptor**: Token automatically added to subsequent requests
4. **Error Handling**: 401 responses trigger automatic logout and redirect
5. **Token Refresh**: Ready for implementation with refresh token logic

## 🌐 Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
VITE_AUTH_TOKEN_KEY=authToken
VITE_APP_TITLE=Accurack Software Frontend
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

## 🛡️ Error Handling

The Axios instance includes comprehensive error handling:

- **401 Unauthorized**: Clears token and redirects to login
- **403 Forbidden**: Logs access denied error
- **404 Not Found**: Logs resource not found error
- **500 Server Error**: Logs server error
- **Network Errors**: Handles connection issues

## 📱 Components

### AuthExample Component

A complete authentication example with login/register forms that demonstrates:

- Form validation
- Loading states
- Error display
- Successful authentication flow
- User information display
- Logout functionality

## 🔧 Customization

### Adding New API Services

1. Create a new service file in `src/services/`
2. Use the `APIService` class or create custom methods
3. Export from `src/services/index.ts`

### Custom Interceptors

Add custom logic to the request/response interceptors in `src/services/api.ts`:

```typescript
// Custom request interceptor
apiClient.interceptors.request.use((config) => {
  // Add custom headers or logic
  config.headers['X-Custom-Header'] = 'custom-value';
  return config;
});

// Custom response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);
```

## 🧪 Testing

To test the API integration:

1. Start your backend server
2. Update the `VITE_API_URL` in your `.env` file
3. Use the AuthExample component to test authentication
4. Check browser network tab for request/response details
5. Monitor console for debug logs

## 🚀 Production Setup

For production deployment:

1. Remove logs statements from interceptors
2. Set proper production API URL
3. Configure CORS on your backend
4. Set up proper error monitoring
5. Implement token refresh logic if needed

## 📚 Additional Resources

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Redux Toolkit Async Thunks](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
