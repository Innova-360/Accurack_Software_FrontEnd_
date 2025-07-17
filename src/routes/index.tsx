import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Signup from "../pages/Signup/Signup"; // Signup Route
import Login from "../pages/Login/Login"; // Login Route
import OtpPage from "../pages/OtpPage/OtpPage"; // otp Route
import ResetPassword from "../pages/ResetPassword/ResetPassword"; // Reset Password Route
import Inventory from "../pages/Inventory/Inventory";
import Home from "../pages/Home";
import Terms from "../pages/Terms";
import StoreForm from "../components/StoreForm";
import ExpensePage from "../pages/expensePage/Expense";
import SalesPage from "../pages/salesPage/Sales";
import CreateInventory from "../pages/Inventory/CreateInventory";
import UpdateInventory from "../pages/Inventory/UpdateInventory";
import ProductDetails from "../pages/Inventory/ProductDetails";
import UploadInventory from "../pages/Inventory/UploadInventory";
import UpdateProduct from "../pages/Inventory/UpdateProduct";
import AddNewSale from "../pages/salesPage/AddNewSale";
import UpdateSale from "../pages/salesPage/UpdateSalesPage";
import EditSalePage from "../pages/salesPage/EditSale";
import UploadSalesPage from "../pages/salesPage/UploadSalesPage";
import GoogleAuthCallback from "../components/GoogleAuthCallback";
import Supplier from "../pages/Supplier/Supplier";
import AddSupplierPage from "../pages/Supplier/AddSupplierPage";
import UpdateSupplierPage from "../pages/Supplier/UpdateSupplier";
import StoresPage from "../pages/Stores/Stores";
import EmployeePage from "../pages/Employee/EmployeeManagementPage";
import CreateInvoice from "../pages/Invoice/CreateInvoice";
import SalesId from "../pages/salesPage/SalesId";
import Employee from "../pages/Employee/EmployeePage";
import OrderProcessingPage from "../pages/OrderProcessing/OrderProcessing";
import CreateOrderPage from "../pages/OrderProcessing/CreateOrder";
import ViewOrdersPage from "../pages/OrderProcessing/ViewOrders";
import UpdateOrderPage from "../pages/OrderProcessing/UpdateOrder";
import DriverManagementPage from "../pages/OrderProcessing/DriverManagement";
import OrderTrackingVerification from "../pages/OrderTrackingVerification/OrderTrackingVerification";
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
import CreateReturn from "../pages/Return/CreateReturn";
import Tax from "../pages/Tax/index";
import AddTax from "../pages/Tax/AddTax";
import StoreDetails from "../pages/Stores/StoreDetails";
import ProfileSettings from "../pages/ProfileSettings/ProfileSettings";
import BusinessSettings from "../pages/BusinessSettings/BusinessSettings";
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import NotFound from "../pages/NotFound/NotFound";
import Invoice from "../pages/Invoice/invoices";
import InvoiceId from "../pages/Invoice/InvoiceID";
import InventoryDashboard from "../pages/Inventory/InventoryDashboard";
import ScanInventory from "../pages/Inventory/ScanInventory";
import DeleteInventory from "../pages/Inventory/DeleteInventory";
import SalesDashboard from "../pages/salesPage/SalesDashboard";
import { useAppSelector } from "../store/hooks";
import InvoicePreview from "../pages/Invoice/Invoice-preview";

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { user, loading, authChecked } = useAppSelector((state) => state.user);

  // Block rendering until auth state is known
  if (loading || !authChecked) {
    return null; // Or use <Loading label="Checking authentication..." />
  }
  if (isAuthenticated && user) return <Navigate to="/stores" replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/signup" element={
        <PublicOnlyRoute>
          <Signup />
        </PublicOnlyRoute>
      } />
      <Route path="/login" element={
        <PublicOnlyRoute>
          <Login />
        </PublicOnlyRoute>
      } />
      <Route path="/otp" element={
        <PublicOnlyRoute>
          <OtpPage />
        </PublicOnlyRoute>
      } />
      <Route path="/reset-password" element={
          <ResetPassword />
      } />
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
        path="/profile-settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-settings"
        element={
          <ProtectedRoute>
            <BusinessSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-processing"
        element={
          <ProtectedRoute>
            <OrderProcessingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-processing/create"
        element={
          <ProtectedRoute>
            <CreateOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-processing/view-orders"
        element={
          <ProtectedRoute>
            <ViewOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-processing/update"
        element={
          <ProtectedRoute>
            <UpdateOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-processing/update/:orderId"
        element={
          <ProtectedRoute>
            <UpdateOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-processing/driver-management"
        element={
          <ProtectedRoute>
            <DriverManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-tracking-verification"
        element={
          <ProtectedRoute>
            <OrderTrackingVerification />
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

      <Route
        path="/store/details/:id"
        element={
          <ProtectedRoute>
            <StoreDetails />
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
        path="/store/:id/inventory/dashboard"
        element={
          <ProtectedRoute>
            <InventoryDashboard />
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
        path="/store/:id/inventory/product/:productId/update"
        element={
          <ProtectedRoute>
            <UpdateInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory/upload"
        element={
          <ProtectedRoute>
            <UploadInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory/update"
        element={
          <ProtectedRoute>
            <UpdateProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory/scan"
        element={
          <ProtectedRoute>
            <ScanInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/inventory/delete"
        element={
          <ProtectedRoute>
            <DeleteInventory />
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
        path="/store/:id/sales/dashboard"
        element={
          <ProtectedRoute>
            <SalesDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales/create"
        element={
          <ProtectedRoute>
            <AddNewSale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales/upload"
        element={
          <ProtectedRoute>
            <UploadSalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales/update"
        element={
          <ProtectedRoute>
            <UpdateSale />
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
        path="/store/:id/sales/:saleid/invoice"
        element={
          <ProtectedRoute>
            <InvoicePreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/sales/:saleid/edit"
        element={
          <ProtectedRoute>
            <EditSalePage />
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
        path="/store/:id/create-invoice"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/invoices"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/invoice/:invoiceId"
        element={
          <ProtectedRoute>
            <InvoiceId />
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
        path="/store/:id/supplier/add"
        element={
          <ProtectedRoute>
            <AddSupplierPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/supplier/update"
        element={
          <ProtectedRoute>
            <UpdateSupplierPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/supplier/:supplierId/assign-products"
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
        path="/store/:id/return/create"
        element={
          <ProtectedRoute>
            <CreateReturn />
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
        path="/store/:id/order-processing"
        element={
          <ProtectedRoute>
            <OrderProcessingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/order-processing/create"
        element={
          <ProtectedRoute>
            <CreateOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/order-processing/view-orders"
        element={
          <ProtectedRoute>
            <ViewOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/order-processing/update"
        element={
          <ProtectedRoute>
            <UpdateOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/order-processing/update/:orderId"
        element={
          <ProtectedRoute>
            <UpdateOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/order-processing/driver-management"
        element={
          <ProtectedRoute>
            <DriverManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/:id/order-tracking-verification"
        element={
          <ProtectedRoute>
            <OrderTrackingVerification />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route for 404 errors */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
