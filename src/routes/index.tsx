import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Terms from '../pages/Terms'
import StoreForm from '../components/StoreForm'
import ExpensePage from '../pages/expensePage/Expense'
import SalesPage from '../pages/salesPage/Sales'

const AppRoutes = () => {
  return (    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />
      <Route path="/expenses" element={<ExpensePage />} />
      <Route path="/sales" element={<SalesPage />} />
    </Routes>
  );
};

export default AppRoutes;
