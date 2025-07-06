import { Routes, Route } from "react-router-dom";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import OtpPage from "../pages/OtpPage/OtpPage";
import Inventory from "../pages/Inventory/Inventory";
import CreateInventory from "../pages/Inventory/CreateInventory";
import Home from "../pages/Home";
import Terms from "../pages/Terms";
import StoreForm from "../components/StoreForm";
import ExpensePage from "../pages/expensePage/Expense";
import SalesPage from "../pages/salesPage/Sales";
import GoogleAuthCallback from "../components/GoogleAuthCallback";
import Supplier from "../pages/Supplier/Supplier";
import StoresPage from "../pages/Stores/Stores";

// Tax Management Pages
import TaxManagementPage from "../pages/TaxManagement/TaxManagementPage";
import CreateTaxPage from "../pages/TaxManagement/CreateTaxPage";
import EditTaxPage from "../pages/TaxManagement/EditTaxPage";
import EnhancedTaxManagementPage from "../pages/TaxManagement/EnhancedTaxManagementPage";
import EnhancedCreateTaxPage from "../pages/TaxManagement/EnhancedCreateTaxPage";
import EnhancedEditTaxPage from "../pages/TaxManagement/EnhancedEditTaxPage";
import TaxDemoPage from "../pages/TaxManagement/TaxDemoPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/store/create" element={<StoreForm />} />
      <Route path="/store/edit/:id" element={<StoreForm />} />      <Route path="/store/:id" element={<Home />} />
      <Route path="/store/:id/inventory" element={<Inventory />} />
      <Route path="/store/:id/inventory/create" element={<CreateInventory />} />
      <Route path="/store/:id/sales" element={<SalesPage />} />
      <Route path="/store/:id/expenses" element={<ExpensePage />} />      <Route path="/store/:id/supplier" element={<Supplier />} />
      
      {/* Tax Management Routes */}
      <Route path="/store/:id/taxes" element={<EnhancedTaxManagementPage />} />
      <Route path="/store/:id/taxes/create" element={<EnhancedCreateTaxPage />} />
      <Route path="/store/:id/taxes/edit/:taxId" element={<EnhancedEditTaxPage />} />
      <Route path="/store/:id/taxes/demo" element={<TaxDemoPage />} />
      
      {/* Global Tax Management Routes */}
      <Route path="/taxes" element={<EnhancedTaxManagementPage />} />
      <Route path="/taxes/create" element={<EnhancedCreateTaxPage />} />
      <Route path="/taxes/edit/:taxId" element={<EnhancedEditTaxPage />} />
      <Route path="/taxes/demo" element={<TaxDemoPage />} />
      
      {/* Basic Tax Management Routes (alternative) */}
      <Route path="/taxes/basic" element={<TaxManagementPage />} />
      <Route path="/taxes/basic/create" element={<CreateTaxPage />} />
      <Route path="/taxes/basic/edit/:taxId" element={<EditTaxPage />} />
      
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/create" element={<CreateInventory />} />
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />
      <Route path="/expenses" element={<ExpensePage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      <Route path="/supplier" element={<Supplier />} />
    </Routes>
  );
};

export default AppRoutes;
