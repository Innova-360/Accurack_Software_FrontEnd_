import React from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import type { Transaction } from "../../services/salesService";

interface ViewTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

const ViewTransactionModal: React.FC<ViewTransactionModalProps> = ({
  isOpen,
  transaction,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-blue-500">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <FaEye className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-blue-600">
              Transaction Details
            </h3>
            <button
              onClick={onClose}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Transaction ID
                </label>
                <p className="text-sm font-semibold text-blue-600">
                  {transaction.transactionId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Date & Time
                </label>
                <p className="text-sm text-gray-900">{transaction.dateTime}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Customer
              </label>
              <p className="text-sm text-gray-900 font-medium">
                {transaction.customer}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Items
                </label>
                <p className="text-sm text-gray-900">{transaction.items}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Cashier
                </label>
                <p className="text-sm text-gray-900">{transaction.cashier}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Subtotal
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(transaction.total - transaction.tax)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Tax
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(transaction.tax)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-500">
                  Total
                </label>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(transaction.total)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Payment Method
                </label>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${
                    transaction.payment === "Cash"
                      ? "bg-green-50 text-green-700"
                      : transaction.payment === "Card"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                  }`}
                >
                  {transaction.payment}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1 ${
                    transaction.status === "Completed"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : transaction.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTransactionModal;
