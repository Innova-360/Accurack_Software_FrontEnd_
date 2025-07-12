import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaDownload } from "react-icons/fa";
import Header from "../../components/Header";
import useRequireStore from "../../hooks/useRequireStore";
// import { UploadSalesModal } from "../../components/SalesComponents";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../services/api";
import { extractErrorMessage } from "../../utils/lastUpdatedUtils";

const UploadSalesPage: React.FC = () => {
  const navigate = useNavigate();
  const currentStore = useRequireStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSuccess = () => {
    // Navigate back to sales page after successful upload
    if (currentStore?.id) {
      navigate(`/store/${currentStore.id}/sales`);
    }
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    return (
      validTypes.includes(file.type) ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".csv")
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
        handleUpload(file);
      } else {
        toast.error("Please upload only Excel files (.xlsx, .xls, .csv)");
      }
    }
  };

  const handleUpload = async (file: File) => {
    if (!file || !currentStore?.id) return;

    setUploading(true);

    // Show processing toast
    const processingToast = toast.loading(`Processing ${file.name}...`, {
      duration: Infinity,
    });

    const url = `${BASE_URL}/sales/uploadsheet?storeId=${currentStore.id}`;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // Dismiss processing toast and show success
      toast.dismiss(processingToast);
      toast.success("Sales uploaded successfully!");

      // Navigate back to sales page
      handleUploadSuccess();
    } catch (error: any) {
      // Dismiss processing toast and show error
      toast.dismiss(processingToast);
      toast.error(extractErrorMessage(error));
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

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
        handleUpload(file);
      } else {
        toast.error("Please upload only Excel files (.xlsx, .xls, .csv)");
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Sales template data
    const salesTemplateData = [
      [
        "Product Name",
        "PLU",
        "SKU",
        "Category",
        "Quantity Sold",
        "Unit Price",
        "Total Amount",
        "Sale Date",
        "Customer Name",
        "Payment Method",
        "Discount",
        "Tax Amount",
      ],
      [
        "Premium Coffee Beans",
        "PLU001",
        "SKU-CF-001",
        "BEVERAGES",
        "10",
        "$24.99",
        "$249.90",
        "2024-01-15",
        "John Smith",
        "Credit Card",
        "$0.00",
        "$24.99",
      ],
      [
        "Organic Milk",
        "PLU002",
        "SKU-ML-002",
        "DAIRY",
        "5",
        "$5.49",
        "$27.45",
        "2024-01-15",
        "Jane Doe",
        "Cash",
        "$2.75",
        "$2.47",
      ],
    ];

    // Convert to CSV for download
    const csvContent = salesTemplateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sales_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGoBack = () => {
    if (currentStore?.id) {
      navigate(`/store/${currentStore.id}/sales`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Sales</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#0f4d57] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUpload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#0f4d57] mb-2">
              Upload Sales Files
            </h1>
            <p className="text-gray-600">
              Upload your sales data in bulk using our Excel template
            </p>
          </div>

          {/* Template Section */}
          <div className="mb-8 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaDownload className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    Need a template?
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Download our Excel template to get started with the correct
                    format
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Download Template
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
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
              <div className="space-y-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-green-500"
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
                </div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  {uploading ? "Uploading..." : "File Selected"}
                </h3>
                <p className="text-green-600 font-medium">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                )}
                {!uploading && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Choose Another File
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
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

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Drop your Excel file here
                </h3>
                <p className="text-gray-600 mb-6">or click to browse</p>

                <button
                  onClick={handleChooseFile}
                  disabled={uploading}
                  className="px-8 py-3 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Choose File"}
                </button>

                <p className="text-sm text-gray-500 mt-4">
                  Supported formats: .xlsx, .xls, .csv (Max 10MB)
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Instructions
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#0f4d57] mr-2">•</span>
                    Download the template above to ensure correct formatting
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0f4d57] mr-2">•</span>
                    Make sure all required fields are filled (Product Name, PLU,
                    SKU, Quantity, Price, Sale Date)
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0f4d57] mr-2">•</span>
                    Sale Date should be in YYYY-MM-DD format (e.g., 2024-01-15)
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#0f4d57] mr-2">•</span>
                    Payment Method should be: Cash, Credit Card, Debit Card, or
                    Mobile Payment
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0f4d57] mr-2">•</span>
                    Quantity should be a whole number
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0f4d57] mr-2">•</span>
                    File size should be under 10MB
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal - Keep for future use if needed */}
     
    </div>
  );
};

export default UploadSalesPage;
