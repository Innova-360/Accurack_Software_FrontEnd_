import React from 'react';
import { FaEye, FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaDollarSign, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { SpecialButton } from '../buttons';
import type { Supplier } from './AddSupplierModal';

interface ViewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier
}) => {
  if (!isOpen || !supplier) return null;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#03414C] rounded-lg">
              <FaEye className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#03414C]">Supplier Details</h2>
              <p className="text-sm text-gray-600">View supplier information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#03414C] bg-opacity-10 rounded-lg">
                  <FaTag className="text-[#03414C]" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Supplier Name</p>
                  <p className="font-semibold text-gray-900">{supplier.name}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#03414C] bg-opacity-10 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${supplier.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(supplier.status)}`}>
                    {supplier.status}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#03414C] bg-opacity-10 rounded-lg">
                  <FaTag className="text-[#03414C]" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900">{supplier.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaEnvelope className="text-blue-600" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{supplier.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaPhone className="text-blue-600" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{supplier.phone}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaMapMarkerAlt className="text-blue-600" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{supplier.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Products Supplied */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaBox className="text-green-600" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="font-semibold text-gray-900">{supplier.productsSupplied}</p>
                </div>
              </div>

              {/* Total Value */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaDollarSign className="text-green-600" size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(supplier.totalValue)}</p>
                </div>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-3 mt-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCalendarAlt className="text-green-600" size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Joined Date</p>
                <p className="font-semibold text-gray-900">{supplier.joinedDate}</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-[#03414C] bg-opacity-5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#03414C] mb-4">Quick Stats</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#03414C]">{supplier.productsSupplied}</p>
                <p className="text-xs text-gray-600">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#03414C]">{formatCurrency(supplier.totalValue)}</p>
                <p className="text-xs text-gray-600">Total Value</p>
              </div>
              <div>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${supplier.status === 'Active' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className={`w-3 h-3 rounded-full ${supplier.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <p className="text-xs text-gray-600 mt-1">Status</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <SpecialButton
              variant="modal-cancel"
              onClick={onClose}
              fullWidth
            >
              Close
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSupplierModal;
