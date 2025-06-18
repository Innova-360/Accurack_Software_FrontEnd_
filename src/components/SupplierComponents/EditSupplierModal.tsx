import React, { useState } from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { SpecialButton } from '../buttons';
import type { Supplier } from './types';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (updatedSupplier: Supplier) => void;
  supplier: Supplier | null;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  supplier
}) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    category: supplier?.category || 'Electronics',
    status: supplier?.status || 'Active' as 'Active' | 'Inactive',
    productsSupplied: supplier?.productsSupplied || 0,
    totalValue: supplier?.totalValue || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when supplier changes
  React.useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status,
        productsSupplied: supplier.productsSupplied,
        totalValue: supplier.totalValue
      });
    }
  }, [supplier]);

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
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.productsSupplied < 0) {
      newErrors.productsSupplied = 'Products supplied cannot be negative';
    }

    if (formData.totalValue < 0) {
      newErrors.totalValue = 'Total value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !supplier) {
      return;
    }

    const updatedSupplier: Supplier = {
      ...supplier,
      ...formData
    };

    onEdit(updatedSupplier);
    setErrors({});
  };

  const handleClose = () => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status,
        productsSupplied: supplier.productsSupplied,
        totalValue: supplier.totalValue
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#03414C] rounded-lg">
              <FaEdit className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#03414C]">Edit Supplier</h2>
              <p className="text-sm text-gray-600">Update supplier information</p>
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
          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter supplier name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter supplier address"
              rows={3}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="Electronics">Electronics</option>
              <option value="Clothing & Apparel">Clothing & Apparel</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Healthcare Products">Healthcare Products</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Products Supplied */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Products Supplied
            </label>
            <input
              type="number"
              value={formData.productsSupplied}
              onChange={(e) => handleInputChange('productsSupplied', parseInt(e.target.value) || 0)}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.productsSupplied ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Number of products supplied"
            />
            {errors.productsSupplied && (
              <p className="mt-1 text-sm text-red-600">{errors.productsSupplied}</p>
            )}
          </div>

          {/* Total Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Business Value ($)
            </label>
            <input
              type="number"
              value={formData.totalValue}
              onChange={(e) => handleInputChange('totalValue', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.totalValue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Total business value"
            />
            {errors.totalValue && (
              <p className="mt-1 text-sm text-red-600">{errors.totalValue}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <SpecialButton
              variant="modal-cancel"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </SpecialButton>
            <SpecialButton
              variant="modal-confirm"
              type="submit"
            >
              Update Supplier
            </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierModal;
