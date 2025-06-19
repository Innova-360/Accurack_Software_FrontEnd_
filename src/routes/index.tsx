import { Routes, Route } from 'react-router-dom';
import Signup from '../pages/Signup/Signup';
import Login from '../pages/Login/Login';
import OtpPage from '../pages/OtpPage/OtpPage';
import Inventory from '../pages/Inventory/Inventory';
import Home from '../pages/Home';
import Supplier from "../pages/Supplier/Supplier"
import Terms from '../pages/Terms';
import StoreForm from "./../components/StoreForm";
import StoresPage from '../pages/Stores/Stores';
import ExpensePage from '../pages/expensePage/Expense';
import SalesPage from '../pages/salesPage/Sales';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/store/create" element={<StoreForm />} />
      <Route path="/store/edit/:id" element={<StoreForm />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />
      <Route path="/expenses" element={<ExpensePage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/supplier" element={<Supplier />} />
    </Routes>
  );
};

export default AppRoutes;
