import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchUser } from "../store/slices/userSlice";
import { logout } from "../store/slices/authSlice";
import { updateLastUpdated } from "../utils/lastUpdatedUtils";
import { loadCurrentStoreFromStorage } from "../store/slices/storeSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { loading, authChecked } = useAppSelector((state) => state.user);
  const { currentStore } = useAppSelector((state) => state.stores);

  useEffect(() => {
    // Load store from localStorage on app startup
    if (!currentStore) {
      dispatch(loadCurrentStoreFromStorage());
    }
  }, [dispatch, currentStore]);

  useEffect(() => {
    if (!authChecked && !loading) {
      dispatch(fetchUser())
        .unwrap()
        .then((userData) => {
          dispatch({ type: 'auth/setAuthenticated', payload: true });
        })
        .catch((error) => {
          dispatch({ type: 'auth/setAuthenticated', payload: false });
          dispatch(logout());
          updateLastUpdated();
          localStorage.removeItem("userEmail");
        });
    }
  }, [dispatch, authChecked, loading]);

  if (loading || !authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing Application</p>
          </div>
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

  return <>{children}</>;
};

export default AuthProvider;
