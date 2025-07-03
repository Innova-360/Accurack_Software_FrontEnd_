import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaFileUpload, FaEdit, FaSpinner } from "react-icons/fa";
import { SpecialButton } from "../buttons";
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
    } catch (error: any) {
      console.error("Error uploading sales file:", error);

      let errorMessage = "Failed to upload sales file";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Sale
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <FaTimes className="text-gray-500" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Choose how you would like to create a new sale:
          </p>

          <div className="space-y-4">
            {/* Manual Creation Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#03414C] transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaEdit className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Create Manually
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Fill out the sale details manually using our form interface.
                  </p>
                  <SpecialButton
                    variant="primary"
                    onClick={onManualCreate}
                    className="w-full bg-[#03414C] hover:bg-[#025561] text-white py-2"
                    disabled={isUploading}
                  >
                    Create Manually
                  </SpecialButton>
                </div>
              </div>
            </div>

            {/* File Upload Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#03414C] transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaFileUpload className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Upload from File
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload sales data from an Excel (.xlsx, .xls) or CSV file.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <SpecialButton
                    variant="secondary"
                    onClick={handleFileInputClick}
                    className="w-full border border-green-600 text-green-600 hover:bg-green-50 py-2"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" size={16} />
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <FaFileUpload size={16} />
                        Choose File
                      </div>
                    )}
                  </SpecialButton>

                  <div className="mt-2 text-xs text-gray-500">
                    <p>Supported formats: Excel (.xlsx, .xls), CSV</p>
                    <p>Maximum file size: 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <SpecialButton
            variant="modal-cancel"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50"
            disabled={isUploading}
          >
            Cancel
          </SpecialButton>
        </div>
      </div>
    </div>
  );
};

export default SaleCreationModal;
