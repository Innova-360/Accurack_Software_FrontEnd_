
import { Provider } from 'react-redux';
import { store } from './store';

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <h1>Accurack Software Frontend</h1>
        <p>Redux Toolkit and Axios are configured and ready to use!</p>
      </div>
    </Provider>
  );
};

export default App;
