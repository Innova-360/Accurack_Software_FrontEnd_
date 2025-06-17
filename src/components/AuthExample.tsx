import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, logoutUser } from '../store/slices/authSlice';
import { selectUser, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../store/selectors';

const AuthExample: React.FC = () => {  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
  });

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(loginForm)).unwrap();
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(registerForm)).unwrap();
      setRegisterForm({ email: '', password: '', name: '' });
      setShowRegister(false);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Welcome, {user.name}!</h3>
        <p>Email: {user.email}</p>
        <p>User ID: {user.id}</p>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowRegister(!showRegister)}
          style={{ 
            padding: '8px 16px', 
            marginRight: '10px',
            backgroundColor: showRegister ? '#6c757d' : '#007bff',
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showRegister ? 'Show Login' : 'Show Register'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {showRegister ? (
        <form onSubmit={handleRegister}>
          <h3>Register</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Name:</label>
            <input
              type="text"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <h3>Login</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthExample;
