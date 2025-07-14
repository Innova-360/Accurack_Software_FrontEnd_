import React from "react";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: () => void;
  onUploadInventory: () => void;
  onScanInventory: () => void;
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onUploadInventory,
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Add Product Option */}
          <button
            onClick={onAddProduct}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57] hover:bg-[#0f4d57] hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#0f4d57] group-hover:bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white group-hover:text-[#0f4d57]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Add Product</h3>
                <p className="text-gray-600 group-hover:text-gray-200 text-sm">
                  Manually add a single product to inventory
                </p>
              </div>
            </div>
          </button>
          {/* Upload Inventory Option */}
          <button
            onClick={onUploadInventory}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57] hover:bg-[#0f4d57] hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 group-hover:bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white group-hover:text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Upload Inventory File</h3>
                <p className="text-gray-600 group-hover:text-gray-200 text-sm">
                  Upload an Excel file with multiple products
                </p>
              </div>
            </div>
          </button>{" "}
          {/* Scan Inventory Option */}
          <button
            onClick={onScanInventory}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57] hover:bg-[#0f4d57] hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 group-hover:bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Scan Inventory</h3>
                <p className="text-gray-600 group-hover:text-gray-200 text-sm">
                  Scan barcodes to add products quickly
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal;
