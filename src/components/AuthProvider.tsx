import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchUser } from "../store/slices/userSlice";
import { logout } from "../store/slices/authSlice";
import { updateLastUpdated } from "../utils/lastUpdatedUtils";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {  loading, authChecked } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Only fetch user if authChecked is false (first load)
    if (!authChecked && !loading) {
      dispatch(fetchUser())
        .unwrap()
        .then(() => {
          dispatch({ type: 'auth/setAuthenticated', payload: true });
        })
        .catch(() => {
          dispatch({ type: 'auth/setAuthenticated', payload: false });
          dispatch(logout());
          updateLastUpdated();
          // Do not redirect to login if on reset-password or other public routes
          const publicPaths = ["/reset-password", "/signup", "/login", "/otp", "/auth/google/callback", "/term"];
          if (!publicPaths.includes(location.pathname)) {
            navigate("/login", { replace: true });
          }
        });
    }
  }, [dispatch, authChecked, loading, navigate, location.pathname]);

  if (loading || !authChecked) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <span style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}>Authenticating...</span>
        {/* You can use your Loading component here if you want a spinner */}
      </div>
    </div>;
  }

  return <>{children}</>;
};

export default AuthProvider;
