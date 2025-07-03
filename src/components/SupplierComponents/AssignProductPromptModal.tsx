import { FaTimes, FaBox, FaLink, FaCheckCircle } from "react-icons/fa";
import React from "react";
import type { Supplier } from "../../types/supplier";

interface AssignProductPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onViewProducts: (supplier: Supplier) => void;
}

const AssignProductPromptModal: React.FC<AssignProductPromptModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onViewProducts,
}) => {
  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header with Success Icon */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FaTimes className="text-gray-400 hover:text-gray-600" size={16} />
          </button>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FaCheckCircle className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Supplier Created Successfully!
            </h3>
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-[#03414C]">
                {supplier.name}
              </span>{" "}
              has been added to your suppliers list.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaBox className="text-blue-600" size={18} />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Ready to assign products?
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  You can now assign products to{" "}
                  <span className="font-medium">{supplier.name}</span> to start
                  managing your inventory and supplier relationships.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
            >
              Not Now
            </button>
            <button
              onClick={() => {
                onClose();
                // Add a small delay to ensure modal closes before navigation
                setTimeout(() => {
                  onViewProducts(supplier);
                }, 100);
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#03414C] to-[#025a6b] text-white rounded-lg hover:from-[#025a6b] hover:to-[#03414C] transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FaLink size={14} />
              Assign Products
            </button>
          </div>
        </div>

        {/* Optional: Bottom decoration */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-b-2xl"></div>
      </div>
    </div>
  );
};

export default AssignProductPromptModal;
