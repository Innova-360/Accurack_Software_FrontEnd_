import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit, FaCheckCircle, FaTimes, FaClock } from "react-icons/fa";
import { IconButton, Button } from "../buttons";
import type { OrderTrackingItem } from "../../types/orderTracking";
import {
  verifyOrder,
  rejectOrder,
  updatePayment,
  fetchTrackingOrders,
} from "../../store/slices/orderTrackingSlice";
import type { RootState } from "../../store";
import type { AppDispatch } from "../../store";

interface OrderTrackingTableProps {
  orders: OrderTrackingItem[];
}
const OrderTrackingTable: React.FC<OrderTrackingTableProps> = ({ orders }) => {
  const dispatch: AppDispatch = useDispatch();
  const { loading, error } = useSelector(
    (state: RootState) => state.orderTracking
  );
  const [editingPayment, setEditingPayment] = useState<string | null>(null);

  const [tempPaymentAmounts, setTempPaymentAmounts] = useState<
    Record<string, number>
  >({});

  const getStatusColor = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return "bg-green-100 text-green-800 border-green-200";
    }

    switch (status.toLowerCase()) {
      case "pending_validation":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "validated":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return <FaCheckCircle className="w-3 h-3 mr-1" />;
    }

    switch (status.toLowerCase()) {
      case "pending_validation":
        return <FaClock className="w-3 h-3 mr-1" />;
      case "under_review":
        return <FaEdit className="w-3 h-3 mr-1" />;
      case "validated":
        return <FaCheckCircle className="w-3 h-3 mr-1" />;
      case "rejected":
        return <FaTimes className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getPaymentTypeDisplay = (paymentType: string) => {
    switch (paymentType) {
      case "CASH":
        return "Cash";
      case "CARD":
        return "Card";
      case "BANK_TRANSFER":
        return "Bank Transfer";
      case "CHECK":
        return "Check";
      case "DIGITAL_WALLET":
        return "Digital Wallet";
      default:
        return paymentType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePaymentEdit = (orderId: string, currentAmount: number) => {
    setEditingPayment(orderId);
    setTempPaymentAmounts((prev) => ({
      ...prev,
      [orderId]: currentAmount,
    }));
  };

  const handlePaymentSave = async (order: OrderTrackingItem) => {
    const newAmount = tempPaymentAmounts[order.id] || order.paymentAmount;
    try {
      await dispatch(
        updatePayment({
          orderId: order.id,
          paymentAmount: newAmount,
          paymentType: order.paymentType,
          // storeId: order.storeId,
        })
      ).unwrap();
      setEditingPayment(null);
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
  };

  const handlePaymentCancel = () => {
    setEditingPayment(null);
    setTempPaymentAmounts({});
  };

  const handleVerify = async (order: OrderTrackingItem) => {
    try {
      if (
        tempPaymentAmounts[order.id] &&
        tempPaymentAmounts[order.id] !== order.paymentAmount
      ) {
        await dispatch(
          updatePayment({
            orderId: order.id,
            paymentAmount: tempPaymentAmounts[order.id],
            paymentType: order.paymentType,
            // storeId: order.storeId,
          })
        ).unwrap();
      }

      // Then verify the order
      await dispatch(
        verifyOrder({
          id: order.id,
          storeId: order.storeId,
          // paymentAmount: tempPaymentAmounts[order.id] || order.paymentAmount,
        })
      ).unwrap();

      setEditingPayment(null);
      setTempPaymentAmounts({});
    } catch (error) {
      console.error("Failed to verify order:", error);
    }
  };

  const handleReject = async (order: OrderTrackingItem) => {
    try {
      await dispatch(
        rejectOrder({
          id: order.id,
          // rejectionReason: 'Rejected by user', // You can customize or prompt for this reason
          storeId: order.storeId,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to reject order:", error);
    }
  };

  if (orders?.length === 0) {
    return (
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
            No tracking orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Orders will appear here when they are validated from Order
            Processing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Original Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Validated At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders &&
            orders.map((order) => (
              <tr
                key={order.id}
                className={`hover:bg-gray-50 ${order.isVerified ? "bg-green-50" : ""}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.customerName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status, order.isVerified)}`}
                  >
                    {getStatusIcon(order.status, order.isVerified)}
                    {order.isVerified
                      ? "Validated"
                      : order.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingPayment === order.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          tempPaymentAmounts[order.id] || order.paymentAmount
                        }
                        onChange={(e) =>
                          setTempPaymentAmounts((prev) => ({
                            ...prev,
                            [order.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => handlePaymentSave(order)}
                        className="text-green-600 hover:text-green-800 text-xs"
                        disabled={loading}
                      >
                        ✓
                      </button>
                      <button
                        onClick={handlePaymentCancel}
                        className="text-red-600 hover:text-red-800 text-xs"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>${order.paymentAmount.toFixed(2)}</span>
                      {!order.isVerified && order.status !== "rejected" && (
                        <IconButton
                          icon={<FaEdit />}
                          onClick={() =>
                            handlePaymentEdit(order.id, order.paymentAmount)
                          }
                          variant="secondary"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                          title="Edit Payment Amount"
                          disabled={loading}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${order.originalPaymentAmount?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getPaymentTypeDisplay(order.paymentType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.driverName || "Not Assigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.validatedAt || order.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {!order.isVerified && order.status !== "rejected" && (
                      <>
                        <Button
                          onClick={() => handleVerify(order)}
                          variant="success"
                          size="sm"
                          icon={<FaCheckCircle />}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                          disabled={loading}
                        >
                          Verify
                        </Button>
                        <Button
                          onClick={() => handleReject(order)}
                          variant="danger"
                          size="sm"
                          icon={<FaTimes />}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {order.isVerified && (
                      <span className="text-green-600 text-sm font-medium">
                        ✓ Validated
                        {order.verifiedBy && (
                          <div className="text-xs text-gray-500">
                            by {order.verifiedBy}
                          </div>
                        )}
                      </span>
                    )}
                    {order.status === "rejected" && (
                      <span className="text-red-600 text-sm font-medium">
                        ✕ Rejected
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTrackingTable;
