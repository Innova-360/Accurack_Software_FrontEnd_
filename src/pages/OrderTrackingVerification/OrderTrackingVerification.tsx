import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTrackingOrders, selectFilteredOrdersForTracking, verifyOrder, rejectOrder } from "../../store/slices/orderTrackingSlice";
import OrderTrackingHeader from "../../components/OrderTrackingComponents/OrderTrackingHeader";
import OrderTrackingStatsGrid from "../../components/OrderTrackingComponents/OrderTrackingStatsGrid";
import OrderTrackingFilterBar from "../../components/OrderTrackingComponents/OrderTrackingFilterBar";
import OrderTrackingTable from "../../components/OrderTrackingComponents/OrderTrackingTable";
import Loading from "../../components/Loading";
import type { OrderTrackingItem, OrderTrackingStats } from "../../types/orderTracking";
import { useParams } from "react-router-dom";

const OrderTrackingVerification: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id: storeId } = useParams<{ id: string }>();
  const { trackingOrders, loading, error } = useAppSelector((state) => state.orderTracking);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [verificationFilter, setVerificationFilter] = useState<string>("All");

  // Mock stats for now
  const mockStats: OrderTrackingStats = {
    totalTrackingOrders: trackingOrders?.length,
    pendingVerification: trackingOrders?.filter(o => !o.isVerified && o.status !== 'rejected').length,
    verifiedOrders: trackingOrders?.filter(o => o.isVerified).length,
    rejectedOrders: trackingOrders?.filter(o => o.status === 'rejected').length,
    totalVerifiedAmount: trackingOrders?.filter(o => o.isVerified).reduce((sum, o) => sum + o.paymentAmount, 0),
    averageVerificationTime: 2.5,
  };

  useEffect(() => {
    if (storeId) {
      dispatch(fetchTrackingOrders({ storeId }));
    }
  }, [dispatch, storeId]);

  const handleVerify = (order: OrderTrackingItem) => {
    dispatch(verifyOrder({
      id: order.id,
      storeId: order.storeId,
    }));
  };

  const handleReject = (order: OrderTrackingItem) => {
    dispatch(rejectOrder({
      id: order.id,
      rejectionReason: 'Payment verification failed',
      storeId: order.storeId,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setVerificationFilter("All");
  };

  // Filter orders based on current filters
  const filteredOrders = trackingOrders?.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || order.paymentType === paymentFilter;
    const matchesVerification = verificationFilter === "All" || 
      (verificationFilter === "verified" && order.isVerified) ||
      (verificationFilter === "unverified" && !order.isVerified);

    return matchesSearch && matchesStatus && matchesPayment && matchesVerification;
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <OrderTrackingHeader />
        
        <div className="mt-6">
          <OrderTrackingStatsGrid stats={mockStats} loading={loading} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6">
            <OrderTrackingFilterBar
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              paymentFilter={paymentFilter}
              verificationFilter={verificationFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onPaymentChange={setPaymentFilter}
              onVerificationChange={setVerificationFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="px-6 pb-6">
            <OrderTrackingTable
              orders={filteredOrders}
              // onVerify={handleVerify}
              // onReject={handleReject}
              // loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingVerification;
