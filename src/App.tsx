import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <div>
          <h1>Accurack Software Frontend</h1>
        </div>
      </BrowserRouter>
    </Provider>
  );
};


export default App;