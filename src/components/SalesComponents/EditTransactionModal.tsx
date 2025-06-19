import React, { useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import type { Transaction } from "../../services/salesService";
import { SpecialButton } from "../buttons";

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    customer: transaction?.customer || "",
    items: transaction?.items || 0,
    total: transaction?.total || 0,
    tax: transaction?.tax || 0,
    payment: transaction?.payment || "Cash",
    status: transaction?.status || "Completed",
    cashier: transaction?.cashier || "",
  });

  React.useEffect(() => {
    if (transaction) {
      setFormData({
        customer: transaction.customer,
        items: transaction.items,
        total: transaction.total,
        tax: transaction.tax,
        payment: transaction.payment,
        status: transaction.status,
        cashier: transaction.cashier,
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction) {
      const updatedTransaction: Transaction = {
        ...transaction,
        ...formData,
      };
      onSave(updatedTransaction);
      onClose();
    }
  };

  if (!isOpen || !transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-[#03414C]">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#03414C] rounded-full flex items-center justify-center mr-3">
              <FaEdit className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-[#03414C]">
              Edit Transaction
            </h3>
            <button
              onClick={onClose}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items
                </label>
                <input
                  type="number"
                  value={formData.items}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      items: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total ($)
                </label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ($)
              </label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tax: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment: e.target.value as Transaction["payment"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Digital">Digital</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>{" "}
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Transaction["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cashier
              </label>
              <input
                type="text"
                value={formData.cashier}
                onChange={(e) =>
                  setFormData({ ...formData, cashier: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <SpecialButton variant="modal-cancel" onClick={onClose}>
                Cancel
              </SpecialButton>
              <SpecialButton variant="modal-confirm" type="submit">
                Save Changes
              </SpecialButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
