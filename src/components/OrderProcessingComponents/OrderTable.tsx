import React from "react";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { IconButton, Button } from "../buttons";
import type { OrderItem } from "../../types/orderProcessing";

interface OrderTableProps {
  orders: OrderItem[];
  onEdit: (order: OrderItem) => void;
  onDelete: (order: OrderItem) => void;
  onValidate: (order: OrderItem) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onValidate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeDisplay = (paymentType: string) => {
    switch (paymentType) {
      case 'CASH':
        return 'Cash';
      case 'CARD':
        return 'Card';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'CHECK':
        return 'Check';
      case 'DIGITAL_WALLET':
        return 'Digital Wallet';
      default:
        return paymentType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (orders.length === 0) {
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
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
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
              Payment Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id.slice(-8).toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.customerName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${order.paymentAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getPaymentTypeDisplay(order.paymentType)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.driverName || 'Not Assigned'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <IconButton
                    icon={<FaEdit />}
                    onClick={() => onEdit(order)}
                    variant="secondary"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    title="Edit Order"
                  />
                  <IconButton
                    icon={<FaTrash />}
                    onClick={() => onDelete(order)}
                    variant="danger"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    title="Delete Order"
                  />
                  <Button
                    onClick={() => onValidate(order)}
                    variant={order.isValidated ? "secondary" : "success"}
                    size="sm"
                    icon={<FaCheckCircle />}
                    disabled={order.isValidated}
                    className={
                      order.isValidated 
                        ? "bg-gray-400 text-gray-700 px-3 py-1 text-xs cursor-not-allowed opacity-60"
                        : "bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                    }
                  >
                    {order.isValidated ? "Validated" : "Validate"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
