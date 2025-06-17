
import { Provider } from 'react-redux';
import { store } from './store';
import ReduxExample from './components/ReduxExample';
import AuthExample from './components/AuthExample';

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <h1>Accurack Software Frontend</h1>
        <AuthExample />
        <ReduxExample />
      </div>
    </Provider>
  );
};

export default App;
