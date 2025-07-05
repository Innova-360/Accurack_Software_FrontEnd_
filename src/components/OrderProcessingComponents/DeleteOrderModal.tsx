import React from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "../buttons";
import type { OrderItem } from "../../types/orderProcessing";

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: OrderItem | null;
  loading?: boolean;
}

const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  loading = false,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Delete Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this order? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Order Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Order ID:</span> #{order.id.slice(-8).toUpperCase()}</p>
              <p><span className="font-medium">Customer:</span> {order.customerName}</p>
              <p><span className="font-medium">Status:</span> {order.status}</p>
              <p><span className="font-medium">Amount:</span> ${order.paymentAmount.toFixed(2)}</p>
              <p><span className="font-medium">Driver:</span> {order.driverName}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              variant="danger"
              disabled={loading}
              loading={loading}
            >
              Delete Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
