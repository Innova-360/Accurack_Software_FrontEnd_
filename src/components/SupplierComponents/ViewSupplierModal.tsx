import React from 'react';
import { FaEye, FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { SpecialButton } from '../buttons';
import type { Supplier } from './types';

interface ViewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier
}) => {  if (!isOpen || !supplier) return null;

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
              <h2 className="text-xl font-semibold text-[#03414C]">Vendor Details</h2>
              <p className="text-sm text-gray-600">View vendor information</p>
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
                  <FaTag className="text-[#03414C] text-[white] " size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Supplier Name</p>
                  <p className="font-semibold text-gray-900">{supplier.name}</p>
                </div>
              </div>              {/* Supplier ID */}
              

              {/* Store ID */}
            
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-4 ">
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
          </div>          {/* Business Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Created Date */}
              {supplier.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaCalendarAlt className="text-green-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Created Date</p>
                    <p className="font-semibold text-gray-900">{new Date(supplier.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Updated Date */}
              {supplier.updatedAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaCalendarAlt className="text-green-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold text-gray-900">{new Date(supplier.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>          {/* Summary Stats */}
        

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
