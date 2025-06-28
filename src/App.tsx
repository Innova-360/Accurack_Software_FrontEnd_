import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import AuthProvider from "./components/AuthProvider";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
          />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
