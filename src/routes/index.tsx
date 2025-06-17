import { Routes, Route } from 'react-router-dom';
import Signup from '../pages/Signup/Signup';
import Login from '../pages/Login/Login';
import OtpPage from '../pages/OtpPage/OtpPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />

    </Routes>
  );
};

export default AppRoutes;
