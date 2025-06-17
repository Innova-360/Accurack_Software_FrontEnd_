import { Routes, Route } from 'react-router-dom';
import Signup from '../pages/Signup/Signup';
import Login from '../pages/Login/Login';
import OtpPage from '../pages/OtpPage/OtpPage';
import Inventory from '../pages/Inventory/Inventory';
import Home from '../pages/Home';
import Terms from '../pages/Terms'
import StoreForm from '../components/StoreForm'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />

    </Routes>
  );
};

export default AppRoutes;
