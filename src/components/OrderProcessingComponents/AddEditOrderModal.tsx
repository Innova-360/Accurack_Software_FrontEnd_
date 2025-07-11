import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "../buttons";
import type { OrderItem, OrderStatus, PaymentType } from "../../types/orderProcessing";
import type { Customer } from "../../types/customer";

interface AddEditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: any) => void;
  order?: OrderItem | null;
  customers: Customer[];
  customersLoading?: boolean;
}

const AddEditOrderModal: React.FC<AddEditOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  order,
  customers,
  customersLoading = false,
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    status: 'pending' as OrderStatus,
    paymentAmount: 0,
    paymentType: 'CASH' as PaymentType,
    driverName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customerId,
        customerName: order.customerName,
        status: order.status,
        paymentAmount: order.paymentAmount,
        paymentType: order.paymentType,
        driverName: order.driverName,
      });
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        status: 'pending',
        paymentAmount: 0,
        paymentType: 'CASH',
        driverName: '',
      });
    }
    setErrors({});
  }, [order, isOpen]);

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: selectedCustomer ? selectedCustomer.customerName : '',
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.paymentAmount || formData.paymentAmount <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0';
    }
    if (!formData.paymentType) {
      newErrors.paymentType = 'Payment type is required';
    }
    if (!formData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: Array<{ value: OrderStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentOptions: Array<{ value: PaymentType; label: string }> = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHECK', label: 'Check' },
    { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {order ? 'Edit Order' : 'Add New Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.customerId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={customersLoading}
            >
              <option value="">
                {customersLoading ? 'Loading customers...' : 'Select a customer'}
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customerName} - {customer.phoneNumber}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.paymentAmount}
              onChange={(e) => handleInputChange('paymentAmount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.paymentAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.paymentAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
            )}
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type *
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => handleInputChange('paymentType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.paymentType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.paymentType && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentType}</p>
            )}
          </div>

          {/* Driver Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver Name *
            </label>
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => handleInputChange('driverName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.driverName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter driver name"
            />
            {errors.driverName && (
              <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {order ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditOrderModal;
