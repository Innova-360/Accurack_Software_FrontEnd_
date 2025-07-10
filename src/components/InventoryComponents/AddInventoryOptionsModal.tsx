import React from "react";
import { FaUpload, FaPlus, FaBarcode, FaTimes } from "react-icons/fa";

interface AddInventoryOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadInventory: () => void;
  onCreateInventory: () => void;
  onScanInventory: () => void;
}

const AddInventoryOptionsModal: React.FC<AddInventoryOptionsModalProps> = ({
  isOpen,
  onClose,
  onUploadInventory,
  onCreateInventory,
  onScanInventory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-md animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0f4d57]">Add Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Upload Inventory Option */}
          <button
            onClick={onUploadInventory}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57] hover:bg-[#0f4d57]/5 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-[#0f4d57] group-hover:text-white transition-colors">
                <FaUpload className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0f4d57]">
                  Upload Inventory File
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                  Bulk upload products from Excel file
                </p>
              </div>
            </div>
          </button>
          {/* Create Inventory Option */}
          <button
            onClick={onCreateInventory}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57] hover:bg-[#0f4d57]/5 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-[#0f4d57] group-hover:text-white transition-colors">
                <FaPlus className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0f4d57]">
                  Create Inventory
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                  Manually add a new product
                </p>
              </div>
            </div>
          </button>{" "}
          {/* Scan Inventory Option */}
          <button
            onClick={onScanInventory}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57] hover:bg-[#0f4d57]/5 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-[#0f4d57] group-hover:text-white transition-colors">
                <FaBarcode className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">Scan Inventory</h3>
                <p className="text-sm text-gray-500">
                  Scan barcodes to add products quickly
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Choose the method that works best for your inventory management
            needs
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryOptionsModal;
