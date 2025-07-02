import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  const authToken = localStorage.getItem("authToken");
  const isUserAuthenticated =
    isAuthenticated ||
    (authToken && authToken !== "undefined" && authToken !== "null");

  // Check if user is in the middle of OTP verification flow
  const userEmail = localStorage.getItem("userEmail");
  const isInOtpFlow = userEmail && !isUserAuthenticated;

  // If user is in OTP verification flow, redirect to OTP page
  if (isInOtpFlow && location.pathname !== "/otp") {
    return <Navigate to="/otp" state={{ from: location }} replace />;
  }

  // If user is not authenticated, redirect to login page
  if (!isUserAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
