# Redux Toolkit Setup Documentation

This document explains the Redux Toolkit configuration and usage in your Accurack Software Frontend project.

## 📁 File Structure

```
src/
├── store/
│   ├── index.ts              # Main store configuration
│   ├── hooks.ts              # Typed hooks
│   ├── selectors.ts          # Reusable selectors
│   └── slices/
│       ├── counterSlice.ts   # Counter state management
│       ├── authSlice.ts      # Authentication state
│       └── uiSlice.ts        # UI state (theme, modals, etc.)
└── components/
    └── ReduxExample.tsx      # Example component
```

## 🔧 Configuration

### Store Configuration (`src/store/index.ts`)
- Configures the Redux store with multiple slices
- Exports typed `RootState` and `AppDispatch` types
- Includes middleware configuration

### Typed Hooks (`src/store/hooks.ts`)
- `useAppDispatch()` - Typed dispatch hook
- `useAppSelector()` - Typed selector hook
- Use these instead of the default `useDispatch` and `useSelector`

## 📦 Available Slices

### 1. Counter Slice (`counterSlice.ts`)
**State:**
- `value: number` - Current counter value
- `loading: boolean` - Loading state

**Actions:**
- `increment()` - Increment by 1
- `decrement()` - Decrement by 1
- `incrementByAmount(amount: number)` - Increment by specific amount
- `reset()` - Reset to 0
- `setLoading(loading: boolean)` - Set loading state

### 2. Auth Slice (`authSlice.ts`)
**State:**
- `user: User | null` - Current user data
- `token: string | null` - Authentication token
- `isAuthenticated: boolean` - Authentication status
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Actions:**
- `loginUser({ email, password })` - Async login thunk
- `logoutUser()` - Async logout thunk
- `clearError()` - Clear error message
- `setUser(user: User)` - Set user data
- `setToken(token: string)` - Set auth token
- `logout()` - Clear auth state

### 3. UI Slice (`uiSlice.ts`)
**State:**
- `theme: 'light' | 'dark'` - Current theme
- `sidebarOpen: boolean` - Sidebar state
- `loading: boolean` - Global loading state
- `notifications: Notification[]` - Notification list
- `modal: { isOpen, type, data }` - Modal state

**Actions:**
- `toggleTheme()` - Switch between light/dark theme
- `setTheme(theme)` - Set specific theme
- `toggleSidebar()` - Toggle sidebar
- `setSidebarOpen(open: boolean)` - Set sidebar state
- `setLoading(loading: boolean)` - Set loading state
- `addNotification(notification)` - Add notification
- `removeNotification(id: string)` - Remove notification
- `clearNotifications()` - Clear all notifications
- `openModal({ type, data })` - Open modal
- `closeModal()` - Close modal

## 🎯 Usage Examples

### Basic Component Usage

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { increment, decrement } from '../store/slices/counterSlice';
import { selectCounterValue } from '../store/selectors';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCounterValue);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
};
```

### Async Actions (Auth Example)

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser } from '../store/slices/authSlice';
import { selectAuthLoading, selectAuthError } from '../store/selectors';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ email: 'user@example.com', password: 'password' })).unwrap();
      // Login successful
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};
```

### Using Selectors

```tsx
import { useAppSelector } from '../store/hooks';
import { selectTheme, selectNotifications, selectUserDisplayName } from '../store/selectors';

const Header = () => {
  const theme = useAppSelector(selectTheme);
  const notifications = useAppSelector(selectNotifications);
  const userName = useAppSelector(selectUserDisplayName);

  return (
    <header className={`header ${theme}`}>
      <h1>Welcome, {userName}</h1>
      <div>Notifications: {notifications.length}</div>
    </header>
  );
};
```

## 🛠️ Customization

### Adding New Slices

1. Create a new slice file in `src/store/slices/`
2. Import and add it to the store configuration
3. Add selectors in `src/store/selectors.ts`
4. Export actions and use in components

### Adding Middleware

```tsx
// In src/store/index.ts
export const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(yourCustomMiddleware),
});
```

## 🔒 TypeScript Integration

- All slices are fully typed
- Use `RootState` and `AppDispatch` types
- Use typed hooks (`useAppDispatch`, `useAppSelector`)
- Selectors provide proper type inference

## 🚀 Best Practices

1. **Use Selectors**: Always use selectors instead of accessing state directly
2. **Typed Hooks**: Use `useAppDispatch` and `useAppSelector` instead of default hooks
3. **Async Actions**: Use `createAsyncThunk` for API calls
4. **Error Handling**: Always handle loading and error states
5. **Normalize State**: Keep state flat and normalized for complex data

## 📚 Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
- [Redux Best Practices](https://redux.js.org/style-guide/style-guide)
