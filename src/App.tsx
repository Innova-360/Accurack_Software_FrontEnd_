import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import Header from "../src/components/Header"

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Header />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
