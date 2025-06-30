import { Routes, Route } from "react-router-dom";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import OtpPage from "../pages/OtpPage/OtpPage";
import Inventory from "../pages/Inventory/Inventory";
import Home from "../pages/Home";
import Terms from "../pages/Terms";
import StoreForm from "../components/StoreForm";
import ExpensePage from "../pages/expensePage/Expense";
import SalesPage from "../pages/salesPage/Sales";
import CreateInventory from "../pages/Inventory/CreateInventory";
import AddNewSale from "../pages/salesPage/AddNewSale";
import GoogleAuthCallback from "../components/GoogleAuthCallback";
import Supplier from "../pages/Supplier/Supplier";
import StoresPage from "../pages/Stores/Stores";
import Tax from "../pages/Tax";
import AddTax from "../pages/Tax/AddTax"
import EmployeePage from "../pages/Employee/EmployeePage";
import PermissionsPage from "../pages/Employee/PermissionsPage";
import EditEmployeePage from "../pages/Employee/EditEmployeePage";
import RolePage from "../pages/RolePage/RolePage";
import Srole from "../pages/RolePage/RolePermissionsPage"
import EditRolePage from "../pages/RolePage/EditRolePage";
import AssignProductsPage from "../pages/Supplier/AssignProductsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

      {/* Store Management Routes */}
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/store/create" element={<StoreForm />} />
      <Route path="/store/edit/:id" element={<StoreForm />} />
      <Route path="/store/:id" element={<Home />} />

      {/* Store-specific Routes */}
      <Route path="/store/:id/inventory" element={<Inventory />} />
      <Route path="/store/:id/inventory/create" element={<CreateInventory />} />
      <Route path="/store/:id/sales" element={<SalesPage />} />
      <Route path="/store/:id/sales/new" element={<AddNewSale />} />
      <Route path="/store/:id/expenses" element={<ExpensePage />} />
      <Route path="/store/:id/supplier" element={<Supplier />} />

      {/* Employee Management Routes */}
      <Route path="/store/:id/employee/create" element={<EmployeePage />} />
      <Route path="/store/:id/employee" element={<PermissionsPage />} />
      <Route path="/store/:id/edit-employee" element={<EditEmployeePage />} />

      {/* Legacy/Global Routes */}
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/expenses" element={<ExpensePage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/permissions" element={<PermissionsPage />} />
      <Route path="/edit-employee" element={<EditEmployeePage />} />

      {/* Utility Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/store/create" element={<StoreForm />} />
      <Route path="/store/edit/:id" element={<StoreForm />} />
      <Route path="/store/:id" element={<Home />} />
      <Route path="/store/:id/inventory" element={<Inventory />} />
      <Route path="/store/:id/inventory/create" element={<CreateInventory />} />
      <Route path="/store/:id/sales" element={<SalesPage />} />
      <Route path="/store/:id/expenses" element={<ExpensePage />} />
      <Route path="/store/:id/supplier" element={<Supplier />} />
      <Route path="/store/:id/supplier/assign-products" element={<AssignProductsPage />} />
      <Route path="/store/:id/employee/create" element={<EmployeePage />} />
      <Route path="/store/:id/employee" element={<PermissionsPage />} />
      <Route path="/store/:id/edit-employee" element={<EditEmployeePage />} />
      <Route path="/store/:id/role" element={<Srole />} />
      <Route path="/store/:id/role/create" element={<RolePage />} />
      <Route path="/store/:id/role/edit" element={<EditRolePage />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/create" element={<CreateInventory />} />
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />
      <Route path="/expenses" element={<ExpensePage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      <Route path="/supplier" element={<Supplier />} />
      <Route path="/store/:id/tax" element={<Tax />} />
      <Route path="/store/:id/add-tax" element={<AddTax />} />
      <Route path="/supplier" element={<Supplier />} />
      <Route path="/employee" element={<EmployeePage />} />
      <Route path="/permissions" element={<PermissionsPage />} />
      <Route path="/edit-employee" element={<EditEmployeePage />} />
    </Routes>
  );
};

export default AppRoutes;
