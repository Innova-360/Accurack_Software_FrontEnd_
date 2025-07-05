import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  console.log("ProtectedRoute: location", location.pathname);

  // Check if user is authenticated
  const authToken = localStorage.getItem("authToken");
  const accessToken = Cookies.get("accessToken");
  console.log("ProtectedRoute: isAuthenticated from Redux:", isAuthenticated);
  console.log("ProtectedRoute: authToken from localStorage:", authToken);
  console.log("ProtectedRoute: accessToken from Cookies:", accessToken);

  const isUserAuthenticated =
    isAuthenticated ||
    (authToken && authToken !== "undefined" && authToken !== "null") ||
    (accessToken && accessToken !== "undefined" && accessToken !== "null");
  console.log("ProtectedRoute: isUserAuthenticated", isUserAuthenticated);

  // Check if user is in the middle of OTP verification flow
  const userEmail = localStorage.getItem("userEmail");
  console.log("ProtectedRoute: userEmail from localStorage:", userEmail);
  const isInOtpFlow = userEmail && !isUserAuthenticated;
  console.log("ProtectedRoute: isInOtpFlow", isInOtpFlow);

  // If user is in OTP verification flow, redirect to OTP page
  if (isInOtpFlow && location.pathname !== "/otp") {
    console.log("ProtectedRoute: Redirecting to /otp");
    return <Navigate to="/otp" state={{ from: location }} replace />;
  }

  // If user is not authenticated, redirect to login page
  if (isUserAuthenticated) {
    console.log("ProtectedRoute: Redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute: Rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
