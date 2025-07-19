import axios from "axios";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../services/api";
import { extractErrorMessage } from "../../utils/lastUpdatedUtils";
import { FaSpinner } from "react-icons/fa";

interface UploadInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const UploadInventoryModal: React.FC<UploadInventoryModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingFile, setProcessingFile] = useState(false);

  const { id } = useParams();

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload only Excel files (.xlsx, .xls)");
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setProcessingFile(true);
        try {
          // Simulate async parse/validate (replace with real logic if needed)
          await new Promise((resolve) => setTimeout(resolve, 300));
          setSelectedFile(file);
        } catch (err) {
          toast.error("Failed to parse file. Please check the format.");
          setSelectedFile(null);
        } finally {
          setProcessingFile(false);
        }
      } else {
        toast.error(
          "Please upload only Excel files (.xlsx, .xls) or CSV files."
        );
      }
    }
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    return (
      validTypes.includes(file.type) ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".csv")
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Close modal immediately
    handleClose();

    // Show processing toast
    const processingToast = toast.loading(
      `Processing ${selectedFile.name}...`,
      {
        duration: Infinity,
      }
    );

    const url = `${BASE_URL}/product/uploadsheet?storeId=${id}`;
    try {
      // Send as multipart/form-data for multer
      const formData = new FormData();
      formData.append("file", selectedFile);
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // Dismiss processing toast and show success
      toast.dismiss(processingToast);
      toast.success("Inventory uploaded successfully!");
      // Call the success callback to refetch products
      onUploadSuccess?.();
    } catch (error: any) {
      // Dismiss processing toast and show error
      toast.dismiss(processingToast);
      toast.error(extractErrorMessage(error));
      console.error("Upload error:", error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleDownloadBasicTemplate = () => {
    // Create a basic template matching validated inventory columns
    const templateData = [
      ["PLU", "name", "category", "price", "SellingPrice", "stock", "SKU"],
      [
        "PLU001",
        "Premium Coffee Beans",
        "BEVERAGES",
        "24.99",
        "29.99",
        "150",
        "SKU-CF-001",
      ],
      ["PLU002", "Organic Milk", "DAIRY", "5.49", "6.49", "75", "SKU-ML-002"],
      ["PLU003", "Artisan Bread", "BAKERY", "7.99", "9.99", "25", "SKU-BR-003"],
    ];

    // Convert to CSV for download
    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory_basic_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadEnhancedTemplate = () => {
    // Create a comprehensive template with all advanced columns
    const templateData = [
      [
        "ProductName",
        "Category",
        "Description",
        "VendorPrice",
        "PLU/UPC",
        "EAN",
        "CustomSKU",
        "VendorName",
        "VendorPhone",
        "IndividualItemQuantity",
        "IndividualItemSellingPrice",
        "MinimumSellingQuantity",
        "MinimumOrderValue",
        "DiscountValue",
        "DiscountPercentage",
        "PackOf",
        "BasePrice",
        "PriceDiscountAmount",
        "PercentDiscount",
        "MatrixAttributes",
        "Attribute1",
        "Attribute2",
      ],
      [
        "Premium Coffee Beans",
        "BEVERAGES",
        "High-quality arabica coffee beans sourced from premium farms",
        "20.99",
        "PLU001/123456789012",
        "1234567890123",
        "SKU-CF-001",
        "Coffee Co. Ltd",
        "+1-555-0123",
        "150",
        "29.99",
        "1",
        "50.00",
        "2.00",
        "10",
        "12",
        "24.99",
        "5.00",
        "15",
        "Size:Large,Origin:Colombia",
        "Large",
        "Colombia",
      ],
      [
        "Organic Milk",
        "DAIRY",
        "Fresh organic whole milk, 1 gallon",
        "4.49",
        "PLU002/234567890123",
        "2345678901234",
        "SKU-ML-002",
        "Dairy Farm Inc",
        "+1-555-0124",
        "75",
        "6.49",
        "1",
        "25.00",
        "1.00",
        "5",
        "6",
        "5.49",
        "2.00",
        "8",
        "Type:Organic,Fat:Whole",
        "Organic",
        "Whole",
      ],
      [
        "Artisan Bread",
        "BAKERY",
        "Freshly baked sourdough bread",
        "6.99",
        "PLU003/345678901234",
        "3456789012345",
        "SKU-BR-003",
        "Local Bakery",
        "+1-555-0125",
        "25",
        "9.99",
        "1",
        "30.00",
        "1.50",
        "8",
        "1",
        "7.99",
        "2.00",
        "12",
        "Type:Sourdough,Size:Large",
        "Sourdough",
        "Large",
      ],
    ];

    // Convert to CSV for download
    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory_enhanced_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 modal-overlay" onClick={handleClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-lg animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0f4d57]">
            Upload Inventory File
          </h2>
          <button
            onClick={handleClose}
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

        {/* Template Download */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <button
            onClick={handleDownloadBasicTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 "
          >
            Download Template 1
          </button>

          <button
            onClick={handleDownloadEnhancedTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Template 2
          </button>
        </div>

        {/* File Upload Area */}
        <div className="relative">
          {/* Loader overlay */}
          {processingFile && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-20">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mb-2" />
              <span className="text-blue-700 font-medium">
                Processing file...
              </span>
            </div>
          )}
          {/* Existing upload area code here (the drag-and-drop or file input UI) */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-[#0f4d57] bg-[#0f4d57]/5"
                : selectedFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 text-green-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-medium text-green-700">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto"
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
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop your Excel file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors"
                >
                  Choose File
                </button>
                <p className="text-xs text-gray-500">
                  Supported formats: .xlsx, .xls (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-6 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadInventoryModal;
