import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUser } from '../store/slices/userSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { user, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Fetch user data if:
    // - User is authenticated (has token)
    // - User data is not already loaded
    // - Not currently loading user data
    // - There's a token in localStorage (for page refresh scenarios)
    const authToken = localStorage.getItem('authToken');
    
    if ((isAuthenticated || authToken) && !user && !loading) {
      console.log('AuthProvider: Fetching user data via /auth/me');
      dispatch(fetchUser());
    }
  }, [dispatch, isAuthenticated, token, user, loading]);

  return <>{children}</>;
};

export default AuthProvider;
