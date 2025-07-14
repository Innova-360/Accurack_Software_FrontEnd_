import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import OrderProcessingDashboardHeader from "../../components/OrderProcessingComponents/OrderProcessingDashboardHeader";
import OrderStatsGrid from "../../components/OrderProcessingComponents/OrderStatsGrid";
import OrderFilterBar from "../../components/OrderProcessingComponents/OrderFilterBar";
import OrderTable from "../../components/OrderProcessingComponents/OrderTable";
import AddEditOrderModal from "../../components/OrderProcessingComponents/AddEditOrderModal";
import DeleteOrderModal from "../../components/OrderProcessingComponents/DeleteOrderModal";
import { useCustomers } from "../../hooks/useCustomers";
import useRequireStore from "../../hooks/useRequireStore";
import {
  fetchOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  validateOrder,
  clearError,
} from "../../store/slices/orderProcessingSlice";
// import { addOrderToTracking } from "../../store/slices/orderTrackingSlice";
import type { AppDispatch, RootState } from "../../store";
import type { OrderItem, OrderStats, UpdateOrderRequest, CreateOrderRequest } from "../../types/orderProcessing";

const OrderProcessingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string }>();
  const currentStore = useRequireStore();

  // Redux state
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  // Get customers for the dropdown
  const { customers, loading: customersLoading } = useCustomers(currentStore?.id, {
    limit: 1000, // Get all customers for dropdown
  });

  // Local state for UI (simplified for dashboard)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("");

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Calculate stats from orders data
  const stats: OrderStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order: OrderItem) => order.status === 'pending').length,
    completedOrders: orders.filter((order: OrderItem) => order.status === 'completed').length,
    shippedOrders: orders.filter((order: OrderItem) => order.status === 'shipped').length,
    totalRevenue: orders.reduce((sum: number, order: OrderItem) => sum + order.paymentAmount, 0),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum: number, order: OrderItem) => sum + order.paymentAmount, 0) / orders.length 
      : 0,
  };

  // Fetch orders data function
  const fetchOrdersData = useCallback(() => {
    if (currentStore?.id) {
      const params: any = {
        storeId: currentStore.id,
        page: 1,
        limit: 50, // Get recent orders for dashboard
      };

      // Add filters if they're not "All"
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      if (paymentFilter !== "All") {
        params.paymentType = paymentFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      console.log("Fetching orders with params:", params);
      dispatch(fetchOrders(params));
    }
  }, [
    currentStore?.id,
    statusFilter,
    paymentFilter,
    searchTerm,
    dispatch,
  ]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Filter orders for display (client-side filtering for driver)
  const getDisplayOrders = () => {
    let filteredOrders = [...orders]; // Create a copy to avoid mutating Redux state
    
    if (driverFilter) {
      filteredOrders = orders.filter((order: OrderItem) =>
        order.driverName.toLowerCase().includes(driverFilter.toLowerCase())
      );
    }

    // Sort by creation date (newest first) and limit to 10 for dashboard view
    return filteredOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  const displayOrders = getDisplayOrders();

  // Action handlers
  const handleCreateOrder = () => {
    navigate(storeId ? `/store/${storeId}/order-processing/create` : "/order-processing/create");
  };

  const handleEditOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleValidateOrder = async (order: OrderItem) => {
    if (currentStore?.id) {
      try {
        // First validate the order in the order processing system
        await dispatch(validateOrder({ id: order.id, storeId: currentStore.id })).unwrap();
        
        // // Then move the order to tracking verification
        // await dispatch(addOrderToTracking({
        //   id: order.id,
        //   customerId: order.customerId,
        //   customerName: order.customerName,
        //   paymentAmount: order.paymentAmount,
        //   paymentType: order.paymentType,
        //   driverName: order.driverName,
        //   createdAt: order.createdAt,
        //   storeId: currentStore.id,
        // })).unwrap();
        
        toast.success("Order validated and moved to tracking verification");
      } catch (error: any) {
        toast.error(error || "Failed to validate order");
      }
    }
  };

  const handleSaveOrder = async (orderData: any) => {
    if (!currentStore?.id) return;

    try {
      if (selectedOrder) {
        // Update existing order and reset validation status
        const updateData: UpdateOrderRequest = {
          id: selectedOrder.id,
          ...orderData,
          isValidated: false, // Reset validation when order is edited
          validatedAt: undefined, // Clear validation timestamp
        };
        await dispatch(updateOrder({ 
          id: selectedOrder.id, 
          orderData: updateData, 
          storeId: currentStore.id 
        })).unwrap();
        toast.success("Order updated successfully");
      } else {
        // Create new order
        const createData: CreateOrderRequest = {
          ...orderData,
          storeId: currentStore.id,
          isValidated: false, // New orders start as not validated
        };
        await dispatch(createOrder(createData)).unwrap();
        toast.success("Order created successfully");
      }
      setIsAddEditModalOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error || "Failed to save order");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedOrder && currentStore?.id) {
      try {
        await dispatch(deleteOrder({ 
          id: selectedOrder.id, 
          storeId: currentStore.id 
        })).unwrap();
        toast.success("Order deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedOrder(null);
      } catch (error: any) {
        toast.error(error || "Failed to delete order");
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setDriverFilter("");
  };

  const handleExportOrders = () => {
    toast("Export functionality will be implemented");
  };

  const handleViewAllOrders = () => {
    navigate(storeId ? `/store/${storeId}/order-processing/view-orders` : "/order-processing/view-orders");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Header Section */}
          <OrderProcessingDashboardHeader
            onCreateOrder={handleCreateOrder}
            onExportOrders={handleExportOrders}
          />

          {/* Stats Grid */}
          <OrderStatsGrid stats={stats} loading={loading} />

          {/* Filters Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <OrderFilterBar
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              paymentFilter={paymentFilter}
              driverFilter={driverFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onPaymentChange={setPaymentFilter}
              onDriverChange={setDriverFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button
                onClick={handleViewAllOrders}
                className="px-4 py-2 text-teal-600 hover:text-teal-800 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                View All Orders
              </button>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : displayOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No orders found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first order.
                  </p>
                </div>
              </div>
            ) : (
              <OrderTable
                orders={displayOrders}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onValidate={handleValidateOrder}
              />
            )}

            {/* Show message if there are more orders */}
            {displayOrders.length === 10 && orders.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 most recent orders. 
                  <button
                    onClick={handleViewAllOrders}
                    className="ml-1 text-teal-600 hover:text-teal-800 underline"
                  >
                    View all {orders.length} orders
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEditOrderModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveOrder}
        order={selectedOrder}
        customers={customers}
        customersLoading={customersLoading}
      />

      <DeleteOrderModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeleteConfirm}
        order={selectedOrder}
        loading={loading}
      />
    </>
  );
};

export default OrderProcessingPage;
