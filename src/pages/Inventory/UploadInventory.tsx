import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Header from "../../components/Header";
import { BASE_URL } from "../../services/api";
import { extractErrorMessage } from "../../utils/lastUpdatedUtils";

const UploadInventory: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false); // <-- add uploading state

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
    setUploading(true); // <-- set uploading true
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

      // Navigate back to inventory page
      navigate(`/store/${id}/inventory`);
    } catch (error: any) {
      // Dismiss processing toast and show error
      toast.dismiss(processingToast);
      toast.error(extractErrorMessage(error));
      console.error("Upload error:", error);
      setUploading(false); // <-- set uploading false on error
    }
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

  const handleBackToInventory = () => {
    navigate(`/store/${id}/inventory`);
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0 animate-slideDown">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
            Upload Inventory Files
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={handleBackToInventory}
              className="bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
            >
              ← Back to Inventory
            </button>
          </div>
        </div>

        {/* Horizontal line */}
        <hr className="border-gray-300 mb-6 animate-slideIn" />

        {/* Main Content */}
        <div className="animate-slideUp">
          <div className="max-w-4xl mx-auto">
            {/* Template Download Section */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Need a template?
                  </h3>
                  <p className="text-blue-700">
                    Download our Excel template to get started with the correct
                    format
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
                  <svg
                    className="w-16 h-16 text-green-500 mx-auto"
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
                  <div>
                    <p className="text-xl font-medium text-green-700 mb-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-600 mb-4">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <svg
                    className="w-20 h-20 text-gray-400 mx-auto"
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
                    <p className="text-2xl font-medium text-gray-700 mb-2">
                      Drop your Excel file here
                    </p>
                    <p className="text-lg text-gray-500 mb-6">
                      or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-3 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors text-lg font-medium"
                    >
                      Choose File
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Supported formats: .xlsx, .xls, .csv (Max 10MB)</p>
                    <p className="mt-1">
                      Make sure your file follows the template format
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-8 py-3 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload Inventory File"
                )}
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center mt-12 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
                  <svg
                    className="w-5 h-5 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Scroll down for instructions
                  </span>
                  <svg
                    className="w-5 h-5 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <div className="w-8 h-8 mx-auto border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border-l-4 border-[#0f4d57]">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload Instructions
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • Download the template above to ensure correct formatting
                </li>
                <li>
                  • Make sure all required fields are filled (Product Name, PLU,
                  SKU, Category, Quantity, Price)
                </li>
                <li>
                  • Category should match existing categories in your store
                </li>
                <li>• Price should be in decimal format (e.g., 24.99)</li>
                <li>• Quantity should be a whole number</li>
                <li>• File size should be under 10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadInventory;
