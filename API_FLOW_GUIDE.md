# 🚀 API Call Flow Guide

**Simple guide to making API calls in your React + Redux + Axios setup**

---

## 📋 Table of Contents
- [Quick Overview](#-quick-overview)
- [Complete Flow](#-complete-flow-step-by-step)
- [Code Examples](#-code-examples)
- [File Structure](#-file-structure)
- [Common Patterns](#-common-patterns)

---

## 🎯 Quick Overview

Your API calls follow this simple path:

```
React Component → Redux Slice → Axios Instance → Backend API
                ↑                                        ↓
             UI Updates ← Redux State ← API Response ←
```

**Key Principle:** Components never call APIs directly. Everything goes through Redux!

---

## 🔄 Complete Flow (Step by Step)

### Step 1: Component Dispatches Action
```typescript
// In your React component
const handleLogin = () => {
  dispatch(loginUser({ email: 'user@example.com', password: 'password' }));
  //       ↑ This triggers the Redux flow
};
```

### Step 2: Redux Slice Receives Action
```typescript
// In src/store/slices/authSlice.ts
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    // ↓ Calls Axios instance
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }
);
```

### Step 3: Axios Instance Processes Request
```typescript
// In src/services/api.ts
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',  // ← Adds base URL
  withCredentials: true,                  // ← Includes cookies
});

// Automatically adds token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Step 4: HTTP Request Goes to Backend
```
POST http://localhost:3000/api/auth/login
Headers: {
  Authorization: Bearer jwt-token-here,
  Content-Type: application/json
}
Body: { email: "user@example.com", password: "password" }
```

### Step 5: Backend Responds
```json
{
  "user": { "id": "123", "name": "John", "email": "user@example.com" },
  "token": "new-jwt-token"
}
```

### Step 6: Redux Updates State
```typescript
// Automatically handled by Redux
.addCase(loginUser.fulfilled, (state, action) => {
  state.user = action.payload.user;      // ← Save user data
  state.token = action.payload.token;    // ← Save token
  state.isAuthenticated = true;          // ← Update auth status
  state.loading = false;                 // ← Clear loading
});
```

### Step 7: Component Re-renders
```typescript
// Component automatically gets new state
const user = useAppSelector(selectUser);     // ← Gets user data
const loading = useAppSelector(selectAuthLoading); // ← Gets loading state

// UI updates automatically
return user ? <WelcomeMessage /> : <LoginForm />;
```

---

## 💻 Code Examples

### 🔐 Authentication Example

**Component:**
```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, selectUser, selectAuthLoading } from '../store/slices/authSlice';

const LoginComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({
        email: 'user@example.com',
        password: 'password123'
      })).unwrap();
      // Success! User is now logged in
    } catch (error) {
      // Handle error
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {user ? (
        <h1>Welcome, {user.name}!</h1>
      ) : (
        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      )}
    </div>
  );
};
```

### 📊 Data Fetching Example

**Redux Slice:**
```typescript
// Create async thunk for any API call
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Handle the response in reducers
.addCase(fetchUserProfile.fulfilled, (state, action) => {
  state.profile = action.payload;
  state.loading = false;
})
```

**Component Usage:**
```typescript
const ProfileComponent = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);
  
  useEffect(() => {
    dispatch(fetchUserProfile('123'));
  }, [dispatch]);

  return <div>{profile?.name}</div>;
};
```

---

## 📁 File Structure

```
src/
├── services/
│   └── api.ts              # Axios instance configuration
├── store/
│   ├── index.ts           # Store setup
│   ├── hooks.ts           # Typed hooks
│   ├── selectors.ts       # State selectors
│   └── slices/
│       ├── authSlice.ts   # Authentication + API calls
│       ├── userSlice.ts   # User data + API calls
│       └── uiSlice.ts     # UI state (no API calls)
└── components/
    └── LoginComponent.tsx  # Uses Redux hooks
```

---

## 🎨 Common Patterns

### Pattern 1: Simple GET Request
```typescript
// In slice
export const fetchData = createAsyncThunk('data/fetch', async () => {
  const response = await apiClient.get('/data');
  return response.data;
});

// In component
useEffect(() => {
  dispatch(fetchData());
}, []);
```

### Pattern 2: POST with Data
```typescript
// In slice
export const createItem = createAsyncThunk(
  'items/create',
  async (itemData: ItemData) => {
    const response = await apiClient.post('/items', itemData);
    return response.data;
  }
);

// In component
const handleSubmit = (data) => {
  dispatch(createItem(data));
};
```

### Pattern 3: DELETE Request
```typescript
// In slice
export const deleteItem = createAsyncThunk(
  'items/delete',
  async (itemId: string) => {
    await apiClient.delete(`/items/${itemId}`);
    return itemId; // Return ID for state update
  }
);

// In reducer
.addCase(deleteItem.fulfilled, (state, action) => {
  state.items = state.items.filter(item => item.id !== action.payload);
})
```

### Pattern 4: Error Handling
```typescript
// In component
const handleAction = async () => {
  try {
    await dispatch(someAction(data)).unwrap();
    // Success
    setMessage('Success!');
  } catch (error) {
    // Error
    setMessage(`Error: ${error}`);
  }
};
```

---

## 🛠️ Key Configuration Files

### Axios Configuration (`src/services/api.ts`)
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## ✅ Best Practices

1. **Never call APIs directly in components**
   ```typescript
   // ❌ Don't do this
   const data = await fetch('/api/data');
   
   // ✅ Do this
   dispatch(fetchData());
   ```

2. **Always use typed hooks**
   ```typescript
   // ❌ Don't do this
   import { useDispatch, useSelector } from 'react-redux';
   
   // ✅ Do this
   import { useAppDispatch, useAppSelector } from '../store/hooks';
   ```

3. **Handle loading and error states**
   ```typescript
   const loading = useAppSelector(selectLoading);
   const error = useAppSelector(selectError);
   
   if (loading) return <Loading />;
   if (error) return <Error message={error} />;
   ```

4. **Use selectors for complex state access**
   ```typescript
   // ✅ Create reusable selectors
   export const selectUserDisplayName = createSelector(
     [selectUser],
     (user) => user?.name || user?.email || 'Guest'
   );
   ```

---

## 🚀 Quick Start Checklist

- [ ] Create async thunk in slice file
- [ ] Add extraReducers to handle pending/fulfilled/rejected
- [ ] Import and use in component with `useAppDispatch`
- [ ] Select state with `useAppSelector`
- [ ] Handle loading/error states in UI

**That's it! Your API call is now fully integrated with Redux and Axios!** 🎉
