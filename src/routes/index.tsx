import { Routes, Route } from 'react-router-dom';
import Signup from '../pages/Signup/Signup';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />

    </Routes>
  );
};

export default AppRoutes;
