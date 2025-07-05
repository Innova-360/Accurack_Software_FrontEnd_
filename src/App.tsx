import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import AuthProvider from "./components/AuthProvider";
import { PermissionProvider } from "./contexts/PermissionContext";
import PermissionService from "./services/permissionService";
import ApiClient from "./services/api";
import { useEffect } from "react";
import { initializeFromLocalStorage } from "./store/slices/authSlice";

// Initialize permission services
const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
);
const permissionService = new PermissionService(apiClient);

const App = () => {
  useEffect(() => {
    // Initialize auth state from localStorage when app starts
    store.dispatch(initializeFromLocalStorage());
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <PermissionProvider permissionService={permissionService}>
            <AppRoutes />
            <Toaster position="top-center" />
          </PermissionProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
