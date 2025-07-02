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
import ProductDetails from "../pages/Inventory/ProductDetails";
import AddNewSale from "../pages/salesPage/AddNewSale";
import GoogleAuthCallback from "../components/GoogleAuthCallback";
import Supplier from "../pages/Supplier/Supplier";
import StoresPage from "../pages/Stores/Stores";
import EmployeePage from "../pages/Employee/EmployeeManagementPage";
import Employee from '../pages/Employee/EmployeePage'
import { EmployeePersonalDashboard } from "../components/EmployeeComponents";
import RolePage from "../pages/RolePage/RolePage";
import Srole from "../pages/RolePage/RolePermissionsPage";
import EditRolePage from "../pages/RolePage/EditRolePage";
import AssignProductsPage from "../pages/Supplier/AssignProductsPage";
import BusinessForm from "../components/InvoiceComponents/businessform";
import CustomerPage from "../pages/Customer/Customer";
import CreateCustomer from "../pages/Customer/CreateCustomer";
import CustomerBalanceSheet from "../pages/Customer/CustomerBalanceSheet";
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
      
      {/* Store-specific Routes */}
      <Route path="/store/:id" element={<Home />} />
      <Route path="/store/:id/inventory" element={<Inventory />} />
      <Route path="/store/:id/inventory/create" element={<CreateInventory />} />
      <Route path="/store/:id/inventory/product/:productId" element={<ProductDetails />} />
      <Route path="/store/:id/sales" element={<SalesPage />} />
      <Route path="/store/:id/sales/new" element={<AddNewSale />} />
      <Route path="/store/:id/expenses" element={<ExpensePage />} />
      
      {/* Supplier Routes */}
      <Route path="/store/:id/supplier" element={<Supplier />} />
      <Route path="/store/:id/supplier/:supplierId/assign-products" element={<AssignProductsPage />} />
      
      {/* Employee Management Routes */}
      <Route path="/store/:id/employee" element={<EmployeePage />} />
      <Route path="/store/:id/employee/create" element={<Employee />} />
      <Route path="/store/:storeId/employee/:employeeId" element={<EmployeePersonalDashboard />} />
      
      {/* Role Management Routes */}
      <Route path="/store/:id/role" element={<Srole />} />
      <Route path="/store/:id/role/create" element={<RolePage />} />
      <Route path="/store/:id/role/edit" element={<EditRolePage />} />
      
      {/* Customer Routes */}
      <Route path="/store/:id/customer" element={<CustomerPage />} />
      <Route path="/store/:id/customer/create" element={<CreateCustomer />} />
      <Route path="/store/:id/customer/balance" element={<CustomerBalanceSheet />} />
      
      {/* Invoice Routes */}
      <Route path="/store/:id/invoice/create" element={<BusinessForm />} />
      
      {/* Utility Routes */}
      <Route path="/store/:id/term" element={<Terms />} />
      
      {/* Legacy/Global Routes (for backward compatibility) */}
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/create" element={<CreateInventory />} />
      <Route path="/inventory/product/:productId" element={<ProductDetails />} />
      <Route path="/expenses" element={<ExpensePage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/supplier" element={<Supplier />} />
      <Route path="/employee" element={<EmployeePage />} />
      
      {/* Root Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/term" element={<Terms />} />
      <Route path="/Form" element={<StoreForm />} />
    </Routes>
  );
};

export default AppRoutes;
