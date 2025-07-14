import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.user);
  const location = useLocation();

  // Show loading spinner while authentication is being determined
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  // Check if user is in the middle of OTP verification flow
  const userEmail = localStorage.getItem("userEmail"); // Keep for OTP only
  const isInOtpFlow = userEmail && !isAuthenticated;

  if (isInOtpFlow && location.pathname !== "/otp") {
    return <Navigate to="/otp" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
