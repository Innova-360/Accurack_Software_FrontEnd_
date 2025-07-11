import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import AddEditOrderModal from "../../components/OrderProcessingComponents/AddEditOrderModal";
import { useCustomers } from "../../hooks/useCustomers";
import useRequireStore from "../../hooks/useRequireStore";
import { fetchOrders, updateOrder } from "../../store/slices/orderProcessingSlice";
import type { AppDispatch, RootState } from "../../store";
import type { OrderItem, UpdateOrderRequest } from "../../types/orderProcessing";

const UpdateOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: storeId, orderId } = useParams<{ id: string; orderId: string }>();
  const currentStore = useRequireStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState(orderId || "");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redux state
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  // Get customers for the dropdown
  const { customers, loading: customersLoading } = useCustomers(currentStore?.id, {
    limit: 1000, // Get all customers for dropdown
  });

  // Fetch orders when component mounts
  useEffect(() => {
    if (currentStore?.id) {
      dispatch(fetchOrders({
        storeId: currentStore.id,
        page: 1,
        limit: 1000, // Get all orders to search by ID
      }));
    }
  }, [currentStore?.id, dispatch]);

  // Auto-find and load order if orderId is provided in URL
  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        setIsModalOpen(true);
      } else {
        toast.error("Order not found");
      }
    }
  }, [orderId, orders]);

  const handleFindOrder = async () => {
    if (!orderIdInput.trim()) {
      toast.error("Please enter an order ID");
      return;
    }

    setIsLoading(true);
    try {
      // First try to find in current orders
      const order = orders.find(o => o.id === orderIdInput.trim());
      if (order) {
        setSelectedOrder(order);
        setIsModalOpen(true);
      } else {
        // If not found in current orders, try to fetch more orders
        if (currentStore?.id) {
          await dispatch(fetchOrders({
            storeId: currentStore.id,
            page: 1,
            limit: 1000,
            search: orderIdInput.trim(),
          })).unwrap();
          
          // Check again after fetching
          const foundOrder = orders.find(o => o.id === orderIdInput.trim());
          if (foundOrder) {
            setSelectedOrder(foundOrder);
            setIsModalOpen(true);
          } else {
            toast.error("Order not found");
          }
        }
      }
    } catch (error) {
      toast.error("Error searching for order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOrder = async (orderData: any) => {
    if (!currentStore?.id || !selectedOrder) return;

    try {
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
      setIsModalOpen(false);
      setSelectedOrder(null);
      setOrderIdInput("");
    } catch (error: any) {
      toast.error(error || "Failed to update order");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    if (orderId) {
      // If we came from a direct URL, go back to order processing
      navigate(storeId ? `/store/${storeId}/order-processing` : "/order-processing");
    }
  };

  const handleBackToOrderProcessing = () => {
    navigate(storeId ? `/store/${storeId}/order-processing` : "/order-processing");
  };

  useEffect(() => {
    // If the store is not available, redirect to stores page
    if (!currentStore?.id) {
      navigate("/stores");
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Update Order</h1>
              <button
                onClick={handleBackToOrderProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Order Processing
              </button>
            </div>

            {/* Order ID Input Section */}
            <div className="mb-8">
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Order ID to Update
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder="Enter order ID..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFindOrder();
                      }
                    }}
                  />
                  <button
                    onClick={handleFindOrder}
                    disabled={isLoading || loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading || loading ? "Searching..." : "Find Order"}
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Update Order Details
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the order ID above to find and update the order details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Order Modal */}
      <AddEditOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveOrder}
        order={selectedOrder}
        customers={customers}
        customersLoading={customersLoading}
      />
    </>
  );
};

export default UpdateOrderPage;
