import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import AuthProvider from "./components/AuthProvider";
import { useEffect } from "react";
import { initializeFromLocalStorage } from "./store/slices/authSlice";

const App = () => {
  useEffect(() => {
    // Initialize auth state from localStorage when app starts
    store.dispatch(initializeFromLocalStorage());
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
