import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import BarcodeScanModal from "../../components/InventoryComponents/BarcodeScanModal";
import { FaBarcode } from "react-icons/fa";

const ScanInventory: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleBarcodeScanned = (barcode: string) => {
    setIsScanModalOpen(false);
    
    // Store barcode in localStorage as fallback
    localStorage.setItem("scannedPLU", barcode);
    
    // Navigate to create inventory page with scanned barcode pre-filled
    navigate(`/store/${id}/inventory/create`, {
      state: { scannedPLU: barcode },
    });
  };

  const handleBackToInventory = () => {
    navigate(`/store/${id}/inventory`);
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen animate-fadeIn">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0 animate-slideDown">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
            Scan Inventory Items
          </h1>
        </div>
        <hr className="border-gray-300 mb-6 animate-slideIn" />
        <div className="animate-slideUp">
          <div className="max-w-4xl mx-auto">
            {/* Scan Area */}
            <div
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-12 text-center transition-colors"
            >
              <div className="space-y-6">
                <FaBarcode size={80} className="mx-auto text-gray-400" />
                <div>
                  <p className="text-2xl font-medium text-gray-700 mb-2">
                    Scan Product Barcode
                  </p>
                  <p className="text-lg text-gray-500 mb-6">
                    Use your device camera to scan product barcodes
                  </p>
                  <button
                    onClick={() => setIsScanModalOpen(true)}
                    className="px-8 py-3 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors text-lg font-medium"
                  >
                    Start Scanning
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Position barcode within the camera frame</p>
                  <p className="mt-1">
                    Scanned barcode will be pre-filled in the product form
                  </p>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center mt-4 mb-4">
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
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-[#0f4d57]">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Scanning Instructions
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Click "Start Scanning" to open your device camera</li>
                <li>• Position the product barcode within the scanning frame</li>
                <li>• Hold steady until the barcode is detected</li>
                <li>• The scanned barcode will be automatically added to the product form</li>
                <li>• Complete the remaining product details and save</li>
                <li>• Ensure good lighting for better scanning results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <BarcodeScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />
    </>
  );
};

export default ScanInventory; 