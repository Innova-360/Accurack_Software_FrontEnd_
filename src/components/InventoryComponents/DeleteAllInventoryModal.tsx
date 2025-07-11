import React, { useState } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface DeleteAllInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productCount: number;
  isDeleting?: boolean;
}

const DeleteAllInventoryModal: React.FC<DeleteAllInventoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productCount,
  isDeleting = false,
}) => {
  const [confirmationText, setConfirmationText] = useState("");
  const expectedText = "delete inventory";
  const isConfirmationValid = confirmationText === expectedText;

  const handleConfirm = () => {
    if (isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 modal-overlay" onClick={handleClose} />

      {/* Modal Container - Centered */}
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-modal-enter">
          {/* Modal Content - Scrollable Area */}
          <div className="overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-600">
                  Delete All Inventory
                </h2>
              </div>
              {!isDeleting && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Warning Content */}
            <div className="mb-6">

              {/* Confirmation Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    To confirm this action, please type the following phrase
                    exactly:
                  </label>
                  <div className="bg-gray-100 p-3 rounded-lg mb-3">
                    <code className="text-sm font-mono text-gray-800 select-none">
                      {expectedText}
                    </code>
                  </div>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type the confirmation phrase here..."
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      confirmationText === ""
                        ? "border-gray-300 focus:border-[#0f4d57] focus:ring-[#0f4d57]/20"
                        : isConfirmationValid
                          ? "border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50"
                          : "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50"
                    }`}
                    disabled={isDeleting}
                  />
                  {confirmationText !== "" && !isConfirmationValid && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <FaExclamationTriangle className="w-4 h-4 mr-1" />
                      The confirmation phrase doesn't match. Please type it
                      exactly as shown above.
                    </p>
                  )}
                  {isConfirmationValid && (
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Confirmation phrase matches. You can now proceed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className={`flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 ${
                  isDeleting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmationValid || isDeleting}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !isConfirmationValid || isDeleting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:scale-105"
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting All Products...
                  </>
                ) : (
                  `Delete All ${productCount} Products`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAllInventoryModal;
