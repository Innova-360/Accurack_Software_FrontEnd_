import React from "react";
import { FaTrash } from "react-icons/fa";
import type { Transaction } from "../../services/salesService";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <FaTrash className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-red-600">
              Delete Transaction
            </h3>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete transaction{" "}
            <strong>{transaction.transactionId}</strong>? This action cannot be
            undone.
          </p>

          <div className="bg-gray-50 p-3 rounded-md mb-6">
            <div className="text-sm">
              <p>
                <strong>Customer:</strong> {transaction.customer}
              </p>
              <p>
                <strong>Total:</strong> ${transaction.total.toFixed(2)}
              </p>
              <p>
                <strong>Date:</strong> {transaction.dateTime}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
