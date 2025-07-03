import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import type { Transaction } from '../../services/salesService';
import { SpecialButton } from '../buttons';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newTransaction: Omit<Transaction, 'id'>) => void;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    customer: '',
    items: 1,
    total: 0,
    tax: 0,
    payment: 'Cash' as 'Cash' | 'Card' | 'Digital',
    status: 'Completed' as 'Completed' | 'Pending' | 'Refunded' | 'Shipped' | 'Delivered',
    cashier: 'Current User'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-calculate tax when total changes (assuming 8.5% tax rate)
    if (field === 'total') {
      const totalAmount = typeof value === 'number' ? value : parseFloat(value as string) || 0;
      const taxAmount = totalAmount * 0.085; // 8.5% tax rate
      setFormData(prev => ({
        ...prev,
        total: totalAmount,
        tax: taxAmount
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer name is required';
    }

    if (formData.items <= 0) {
      newErrors.items = 'Items must be greater than 0';
    }

    if (formData.total <= 0) {
      newErrors.total = 'Total amount must be greater than 0';
    }

    if (!formData.cashier.trim()) {
      newErrors.cashier = 'Cashier name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create new transaction object
    const newTransaction: Omit<Transaction, 'id'> = {
      transactionId,
      dateTime: new Date().toLocaleString(),
      customer: formData.customer.trim(),
      items: formData.items,
      total: formData.total,
      tax: formData.tax,
      payment: formData.payment,
      status: formData.status,
      cashier: formData.cashier.trim()
    };

    onCreate(newTransaction);
    
    // Reset form
    setFormData({
      customer: '',
      items: 1,
      total: 0,
      tax: 0,
      payment: 'Cash',
      status: 'Completed',
      cashier: 'Current User'
    });
    setErrors({});
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      customer: '',
      items: 1,
      total: 0,
      tax: 0,
      payment: 'Cash',
      status: 'Completed',
      cashier: 'Current User'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#03414C] rounded-lg">
              <FaPlus className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#03414C]">New Sale</h2>
              <p className="text-sm text-gray-600">Create a new sales transaction</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => handleInputChange('customer', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.customer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
            )}
          </div>

          {/* Number of Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items *
            </label>
            <input
              type="number"
              value={formData.items}
              onChange={(e) => handleInputChange('items', parseInt(e.target.value))}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.items ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter number of items"
            />
            {errors.items && (
              <p className="mt-1 text-sm text-red-600">{errors.items}</p>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount (Before Tax) *
            </label>
            <input
              type="number"
              value={formData.total}
              onChange={(e) => handleInputChange('total', parseFloat(e.target.value))}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.total ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter total amount"
            />
            {errors.total && (
              <p className="mt-1 text-sm text-red-600">{errors.total}</p>
            )}
          </div>

          {/* Tax Amount (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Amount (8.5%)
            </label>
            <input
              type="number"
              value={formData.tax.toFixed(2)}
              readOnly
              className="w-full px-3 py-2 border bg-gray-50 border-gray-300 rounded-lg text-gray-600"
              placeholder="Tax will be calculated automatically"
            />
            <p className="mt-1 text-xs text-gray-500">Tax is automatically calculated at 8.5%</p>
          </div>

          {/* Final Total */}
          <div className="bg-[#03414C] bg-opacity-5 p-3 rounded-lg">
            <label className="block text-sm font-medium text-[white] mb-1">
              Final Total (Including Tax)
            </label>
            <div className="text-2xl font-bold text-[white]">
              ${(formData.total + formData.tax).toFixed(2)}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={formData.payment}
              onChange={(e) => handleInputChange('payment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Digital">Digital</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Cashier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cashier *
            </label>
            <input
              type="text"
              value={formData.cashier}
              onChange={(e) => handleInputChange('cashier', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.cashier ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter cashier name"
            />
            {errors.cashier && (
              <p className="mt-1 text-sm text-red-600">{errors.cashier}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <SpecialButton
                           variant="modal-confirm"
                           type="submit"
                           onClick={handleClose}
                         >
                           Cancel
                         </SpecialButton>
             <SpecialButton
                            variant="modal-confirm"
                            type="submit"
                            // onClick={() => {}}
                          >
                            Create Sale
                          </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSaleModal;
