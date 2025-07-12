import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSpinner, FaUpload } from "react-icons/fa";
import apiClient from "../../services/api";
import toast from "react-hot-toast";

interface SaleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualCreate: () => void;
  storeId?: string;
  clientId?: string;
}

const SaleCreationModal: React.FC<SaleCreationModalProps> = ({
  isOpen,
  onClose,
  onManualCreate,
  storeId,
  clientId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.toLowerCase().endsWith(".csv")
    ) {
      toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Only add clientId to formData
      if (clientId) {
        formData.append("clientId", clientId);
      }

      console.log("Uploading sales file:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storeId,
        clientId,
      });

      // Build URL with storeId as query string
      let uploadUrl = "/sales/uploadsheet";
      if (storeId) {
        uploadUrl = `${uploadUrl}?storeId=${encodeURIComponent(storeId)}`;
      }

      const response = await apiClient.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);

      if (response.data) {
        toast.success(
          `Sales uploaded successfully! ${response.data.message || ""}`
        );
        onClose();

        // Optionally, you can navigate to sales list or refresh the page
        navigate(`/store/${storeId}/sales`);
      } else {
        toast.success("Sales file uploaded successfully!");
        onClose();
      }
    } catch (error: unknown) {
      console.error("Error uploading sales file:", error);

      let errorMessage = "Failed to upload sales file";

      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string; error?: string } } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        } else if (errorResponse.response?.data?.error) {
          errorMessage = errorResponse.response.data.error;
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    handleFileInputClick();
  };

  if (!isOpen) return null;

  return (
    <>
     <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-md animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0f4d57]">Create New Sale</h2>
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
            onClick={onManualCreate}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57]  hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-[#0f4d57] group-hover:text-white transition-colors">
                <FaPlus className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0f4d57]"> Make Sales Manually</h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                Manually add a new sale transaction.
                </p>
              </div>
            </div>
          </button>
          {/* Upload Sales Option */}
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#0f4d57]  hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-[#0f4d57] group-hover:text-white transition-colors">
                {isUploading ? (
                  <FaSpinner className="w-6 h-6 text-white group-hover:text-green-600 animate-spin" />
                ) : (
                  <FaUpload className="w-6 h-6 text-blue-600 group-hover:text-white" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0f4d57]">
                  {isUploading ? "Uploading..." : "Upload From File"}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                Upload sales data from an Excel (.xlsx, .xls) or CSV file.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>

    </>
  );
};

export default SaleCreationModal;
