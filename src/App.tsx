import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import AuthProvider from "./components/AuthProvider";

const App = () => {
  return (
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
  );
};

export default App;
