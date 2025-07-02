import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchUser } from "../store/slices/userSlice";
import { logout } from "../store/slices/authSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { user, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Fetch user data if:
    // - User is authenticated (has token)
    // - User data is not already loaded
    // - Not currently loading user data
    // - There's a token in localStorage (for page refresh scenarios)
    const authToken = localStorage.getItem("authToken");

    if ((isAuthenticated || authToken) && !user && !loading) {
      dispatch(fetchUser()).catch((error) => {
        // If token is invalid, logout and redirect to login
        dispatch(logout());
        navigate("/login", { replace: true });
      });
    }
  }, [dispatch, isAuthenticated, token, user, loading, navigate]);

  return <>{children}</>;
};

export default AuthProvider;
