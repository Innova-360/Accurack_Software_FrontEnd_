import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import AuthProvider from "./components/AuthProvider";
import { useAppSelector } from "./store/hooks";
import Loading from "./components/Loading";

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
