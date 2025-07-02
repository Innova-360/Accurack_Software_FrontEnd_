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
import EmployeePage from "../pages/Employee/EmployeePage";
import CreateInvoice from "../pages/salesPage/CreateInvoice";
import SalesId from "../pages/salesPage/SalesId";
import Employee from "../pages/Employee/EmployeePage";

import RolePage from "../pages/RolePage/RolePage";
import Srole from "../pages/RolePage/RolePermissionsPage";
import EditRolePage from "../pages/RolePage/EditRolePage";
import AssignProductsPage from "../pages/Supplier/AssignProductsPage";
import BusinessForm from "../components/InvoiceComponents/businessform";
import CustomerPage from "../pages/Customer/Customer";
import CreateCustomer from "../pages/Customer/CreateCustomer";
import CustomerBalanceSheet from "../pages/Customer/CustomerBalanceSheet";
import ProtectedRoute from "../components/ProtectedRoute";
import ReturnPage from "../pages/Return/Return";
import Tax from "../pages/Tax/index";
import AddTax from "../pages/Tax/AddTax";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      <Route path="/term" element={<Terms />} />

      {/* Protected Routes - Authentication required */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stores"
        element={
          <ProtectedRoute>
            <StoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/create"
        element={
          <ProtectedRoute>
            <StoreForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/edit/:id"
        element={
          <ProtectedRoute>
            <StoreForm />
          </ProtectedRoute>
        }
      />

      {/* Store-specific Protected Routes */}
      <Route
        path="/store/:id"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory/create"
        element={
          <ProtectedRoute>
            <CreateInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory/product/:productId"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales"
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales/:saleid"
        element={
          <ProtectedRoute>
            <SalesId />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales/new"
        element={
          <ProtectedRoute>
            <AddNewSale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/expenses"
        element={
          <ProtectedRoute>
            <ExpensePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/supplier"
        element={
          <ProtectedRoute>
            <Supplier />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/supplier/assign-products"
        element={
          <ProtectedRoute>
            <AssignProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/employee"
        element={
          <ProtectedRoute>
            <EmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/employee/create"
        element={
          <ProtectedRoute>
            <Employee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/role"
        element={
          <ProtectedRoute>
            <Srole />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/role/create"
        element={
          <ProtectedRoute>
            <RolePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/role/edit"
        element={
          <ProtectedRoute>
            <EditRolePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/tax"
        element={
          <ProtectedRoute>
            <Tax />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/add-tax"
        element={
          <ProtectedRoute>
            <AddTax />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/customer"
        element={
          <ProtectedRoute>
            <CustomerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/customer/create"
        element={
          <ProtectedRoute>
            <CreateCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/customer/edit/:customerId"
        element={
          <ProtectedRoute>
            <CreateCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/customer/balance/:customerId"
        element={
          <ProtectedRoute>
            <CustomerBalanceSheet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/return"
        element={
          <ProtectedRoute>
            <ReturnPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/invoice/create"
        element={
          <ProtectedRoute>
            <BusinessForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/invoice"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
