// only for backup, not used

import axios from "axios";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { BASE_URL } from "../../services/api";
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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload only Excel files (.xlsx, .xls)");
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
    console.log("Uploading inventory file:", {
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
      storeId: id,
    });
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
    } catch (error) {
      // Dismiss processing toast and show error
      toast.dismiss(processingToast);
      toast.error("Upload failed. Please try again.");
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
  const handleDownloadTemplate = () => {
    // Create a sample Excel template matching inventory structure
    const templateData = [
      [
        "Product Name",
        "PLU",
        "SKU",
        "Category",
        "Quantity",
        "Price",
        "Items Per Unit",
        "Supplier",
        "Description",
      ],
      [
        "Premium Coffee Beans",
        "PLU001",
        "SKU-CF-001",
        "BEVERAGES",
        "150",
        "$24.99",
        "1",
        "Coffee Co.",
        "High-quality arabica coffee beans sourced from premium farms",
      ],
      [
        "Organic Milk",
        "PLU002",
        "SKU-ML-002",
        "DAIRY",
        "75",
        "$5.49",
        "1",
        "Dairy Farm Inc.",
        "Fresh organic whole milk, 1 gallon",
      ],
      [
        "Artisan Bread",
        "PLU003",
        "SKU-BR-003",
        "BAKERY",
        "25",
        "$7.99",
        "1",
        "Local Bakery",
        "Freshly baked sourdough bread",
      ],
    ];

    // Convert to CSV for download (simple implementation)
    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory_template.csv";
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
          <h2 className="text-xl font-bold text-[#0f4d57]">Upload Inventory</h2>
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
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Need a template?</h3>
              <p className="text-sm text-blue-700">
                Download our Excel template to get started
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Download
            </button>
          </div>
        </div>

        {/* File Upload Area */}
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
              <p className="font-medium text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={() => setSelectedFile(null)}
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
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
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
