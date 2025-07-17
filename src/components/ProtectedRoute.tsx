import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading, authChecked, user } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (loading || !authChecked) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '16px auto 0'
          }}></div>
          <span>Checking authentication...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const userEmail = localStorage.getItem("userEmail");
  const isInOtpFlow = userEmail && !isAuthenticated;

  if (isInOtpFlow && location.pathname !== "/otp") {
    return <Navigate to="/otp" state={{ from: location }} replace />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location, 
          message: "Please log in to access this page"
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
