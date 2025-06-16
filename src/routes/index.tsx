import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Terms from '../pages/Terms'
import StoreForm from '../components/StoreForm'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />

    </Routes>
  );
};

export default AppRoutes;
