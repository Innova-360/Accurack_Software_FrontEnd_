import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import OrderFilterBar from "../../components/OrderProcessingComponents/OrderFilterBar";
import OrderTable from "../../components/OrderProcessingComponents/OrderTable";
import OrderPagination from "../../components/OrderProcessingComponents/OrderPagination";
import AddEditOrderModal from "../../components/OrderProcessingComponents/AddEditOrderModal";
import DeleteOrderModal from "../../components/OrderProcessingComponents/DeleteOrderModal";
import { useCustomers } from "../../hooks/useCustomers";
import useRequireStore from "../../hooks/useRequireStore";
import {
  fetchOrders,
  updateOrder,
  deleteOrder,
  clearError,
  validateOrder,
} from "../../store/slices/orderProcessingSlice";
import type { AppDispatch, RootState } from "../../store";
import type {
  OrderItem,
  UpdateOrderRequest,
} from "../../types/orderProcessing";

const ViewOrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string }>();
  const currentStore = useRequireStore();

  // Check for URL search params for driver filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const driverParam = urlParams.get("driver");
    if (driverParam) {
      setDriverFilter(decodeURIComponent(driverParam));
    }
  }, []);

  // Redux state
  const { orders, loading, error, pagination } = useSelector(
    (state: RootState) => state.orders
  );

  const { customers, loading: customersLoading } = useCustomers(
    currentStore?.id,
    {
      limit: 1000, // Get all customers for dropdown
    }
  );

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [driverFilter, setDriverFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Fetch orders data function
  const fetchOrdersData = useCallback(() => {
    if (currentStore?.id) {
      const params: any = {
        storeId: currentStore.id,
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm.trim() || undefined, // Send undefined if search is empty
      };

      // Add filters if they're not "All"
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      if (paymentFilter !== "All") {
        params.paymentType = paymentFilter;
      }

      dispatch(fetchOrders(params));
    }
  }, [
    currentStore?.id,
    currentPage,
    rowsPerPage,
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
    if (!driverFilter) {
      return orders;
    }

    return orders.filter((order: OrderItem) =>
      order.driverName?.toLowerCase().includes(driverFilter.toLowerCase())
    );
  };

  const displayOrders = getDisplayOrders();

  // For pagination display
  const totalPages = Math.ceil(pagination.total / rowsPerPage);

  // Action handlers
  const handleCreateOrder = () => {
    navigate(
      storeId
        ? `/store/${storeId}/order-processing/create`
        : "/order-processing/create"
    );
  };

  const handleEditOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleValidateOrder = async (order: OrderItem) => {
    if (currentStore?.id) {
      try {
        await dispatch(
          validateOrder({ id: order.id, storeId: currentStore.id })
        ).unwrap();
        toast.success("Order validated successfully");
      } catch (error: any) {
        toast.error(error || "Failed to validate order");
      }
    }
  };

  const handleSaveOrder = async (orderData: any) => {
    if (!currentStore?.id || !selectedOrder) return;

    try {
      // Update existing order and reset validation status
      const updateData: UpdateOrderRequest = {
        id: selectedOrder.id,
        ...orderData,
        isValidated: false, // Reset validation when order is edited
        validatedAt: undefined, // Clear validation timestamp
      };
      await dispatch(
        updateOrder({
          id: selectedOrder.id,
          orderData: updateData,
          storeId: currentStore.id,
        })
      ).unwrap();
      toast.success("Order updated successfully");
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error || "Failed to update order");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedOrder && currentStore?.id) {
      try {
        await dispatch(
          deleteOrder({
            id: selectedOrder.id,
            storeId: currentStore.id,
          })
        ).unwrap();
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
    setCurrentPage(1);
  };

  const handleBackToOrderProcessing = () => {
    navigate(
      storeId ? `/store/${storeId}/order-processing` : "/order-processing"
    );
  };

  useEffect(() => {
    if (!currentStore?.id) {
      navigate("/");
    }
  }, [currentStore, navigate]);

  if (!currentStore?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">View Orders</h1>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateOrder}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Create Order
                </button>
                <button
                  onClick={handleBackToOrderProcessing}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back to Order Processing
                </button>
              </div>
            </div>
          </div>

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
                  <button
                    onClick={handleCreateOrder}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Create Order
                  </button>
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

            {/* Pagination */}
            {displayOrders.length > 0 && (
              <OrderPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                startIndex={(pagination.page - 1) * rowsPerPage + 1}
                endIndex={Math.min(
                  pagination.page * rowsPerPage,
                  pagination.total
                )}
                totalItems={pagination.total}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setRowsPerPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
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

export default ViewOrdersPage;
