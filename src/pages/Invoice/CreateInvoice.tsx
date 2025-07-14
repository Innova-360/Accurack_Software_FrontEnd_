import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaArrowLeft,
  FaCheck,
  FaPrint,
  FaCloudUploadAlt,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import { createSale } from "../../store/slices/salesSlice";
import type { RootState } from "../../store";
import type { SaleRequestData, SaleItem } from "../../store/slices/salesSlice";
import useRequireStore from "../../hooks/useRequireStore";
import apiClient from "../../services/api";
import { uploadImageToCloudinary } from "../../services/cloudinary";

interface BusinessDetails {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId: string;
}

interface InvoiceData {
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    companyName?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    productId?: string;
    pluUpc?: string;
    plu?: string;
    sku?: string;
  }>;
  subtotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  taxRate: number;
  allowance: number;
  taxAmount: number;
  finalTotal: number;
  paymentMethod: string;
  notes: string;
}

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentStore = useRequireStore();
  const { user } = useSelector((state: RootState) => state.user);
  const [customFields, setCustomFields] = useState([{ name: "", value: "" }]);
  const [checkingBusinessDetails, setCheckingBusinessDetails] = useState(false);

  const invoiceData = location.state?.invoiceData as InvoiceData;
  console.log("Invoice Data:", invoiceData);

  const [currentStep, setCurrentStep] = useState(1); // Start at Product Details
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const [invoiceResponse, setInvoiceResponse] = useState(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessFormData, setBusinessFormData] = useState({
    businessName: "",
    contactNo: "",
    website: "",
    address: "",
    logoUrl: "",
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Invoice specific fields
  const [invoiceFields, setInvoiceFields] = useState({
    customerid: invoiceResponse?.customerId,
    invoiceNo: invoiceNumber,
    invoiceDate: new Date().toISOString().split("T")[0],
    deliveryDate: new Date().toISOString().split("T")[0] + "T09:00",
  });

  const [storeBusinessDetails, setStoreBusinessDetails] =
    useState<BusinessDetails>({
      companyName: "",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      companyWebsite: "",
      taxId: "",
    });

  // Enhanced customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: invoiceData?.customerDetails?.name || "",
    phone: invoiceData?.customerDetails?.phone || "",
    email: invoiceData?.customerDetails?.email || "",
    address: invoiceData?.customerDetails?.address || "",
    companyName: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
  });

  console.log(invoiceData.products[0].selectedProduct.packs.length);

  const handleBusinessDetailsSubmit = () => {
    // Validate business details
    if (
      !businessDetails.companyName.trim() ||
      !businessDetails.companyAddress.trim() ||
      !businessDetails.companyPhone.trim() ||
      !businessDetails.companyEmail.trim()
    ) {
      alert("Please fill in all required business details");
      return;
    }

    // Save business details to localStorage for future use
    localStorage.setItem("businessDetails", JSON.stringify(businessDetails));
    setCurrentStep(2);
  };

  const handleProductDetailsNext = () => {
    setCurrentStep(2);
  };

  const handleCustomerDetailsNext = async () => {
    // Validate customer details
    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }
    try {
      await checkBusinessDetails();
    } catch (error) {
      console.error("Error checking business details:", error);
      toast.error("Failed to check business details");
      return;
    }
  };

  const checkBusinessDetails = async () => {
    try {
      setCheckingBusinessDetails(true);

      const businessResponse = await apiClient.get(
        "/invoice/get-business/details"
      );

      if (businessResponse.data.showBusinessForm) {
        setShowBusinessForm(true);
      } else {
        setStoreBusinessDetails(businessResponse.data.data);
        console.log("Business details fetched:", storeBusinessDetails);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error("Error checking business details:", error);
      setShowBusinessForm(true);
    } finally {
      setCheckingBusinessDetails(false);
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleBusinessFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessFormData.businessName || !businessFormData.contactNo) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (businessFormData.website && !validateUrl(businessFormData.website)) {
      toast.error("Invalid website URL.");
      return;
    }

    try {
      await apiClient.post("/invoice/set-business/details", businessFormData);
      toast.success("Business details saved successfully!");
      setShowBusinessForm(false);
      // Now proceed with invoice creation

      // Show invoice preview first without generating
      setCurrentStep(3);
    } catch (error) {
      console.log("error", error);
      // Error is handled by the slice
      toast.error("Failed to save business details");
    }
  };

  const handleCreateSaleAndInvoice = async () => {
    if (!currentStore?.id || !user?.clientId) {
      toast.error("Store or user information is missing");
      console.log("Current Store", currentStore);
      console.log("Current User", user);
      return;
    }
    if (isCreatingSale) return; // Prevent double call
    setIsCreatingSale(true);
    try {
      // Prepare sale items from invoice data
      const saleItems: SaleItem[] = invoiceData.products.map((product) => ({
        productId: product.productId,
        productName: product.name,
        quantity: product.quantity,
        sellingPrice: product.price,
        totalPrice: product.total,
        pluUpc: product.pluUpc || product.plu || product.sku || "",
      }));

      console.log(
        "Sale items with pluUpc:",
        JSON.stringify(saleItems, null, 2)
      );

      // Prepare sale data - ONLY sale-related fields
      const saleData: SaleRequestData = {
        customerPhone: customerDetails.phone.trim(),
        customerData: {
          customerName: customerDetails.name.trim(),
          customerAddress: customerDetails.address.trim(),
          phoneNumber: customerDetails.phone.trim(),
          telephoneNumber: customerDetails.phone.trim(),
          customerMail: customerDetails.email.trim(),
          storeId: currentStore.id,
          clientId: user.clientId,
        },
        storeId: currentStore.id,
        clientId: user.clientId,
        paymentMethod: invoiceData.paymentMethod as
          | "CASH"
          | "CARD"
          | "BANK_TRANSFER"
          | "CHECK"
          | "DIGITAL_WALLET",
        totalAmount: Math.round(invoiceData.finalTotal * 100) / 100,
        tax: Math.round(invoiceData.taxAmount * 100) / 100,
        allowance: invoiceData.allowance,
        cashierName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email || "Current User",
        generateInvoice: false,
        source: "manual",
        status: "PENDING",
        saleItems,
      };

      console.log("Creating sale for invoice:", saleData);
      const saleResponse = await dispatch(createSale(saleData)).unwrap();
      console.log("Sale response:", saleResponse);

      // Extract sale ID from response structure
      const saleId =
        saleResponse?.sale?.id ||
        saleResponse?.data?.sale?.id ||
        saleResponse?.id;

      if (!saleId) {
        throw new Error("Sale ID not found in response");
      }

      // Generate invoice with sale ID
      const invoicePayload = {
        saleId: String(saleId),
        customFields: customFields
          .filter((f) => f.name && f.value)
          .map((f) => ({
            name: f.name,
            value: f.value,
          })),
      };

      // Call invoice generation API
      const response = await apiClient.post("/invoice", invoicePayload);
      console.log("Invoice generated:", response.data);
      setInvoiceResponse(response.data);
      toast.success("Invoice generated successfully!");
    } catch (error: any) {
      console.log("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsCreatingSale(false);
    }
  };

  //     toast.error('Invoice content not found');

  //   }

  //     toast.error('Unable to open print window');

  //   }

  //   printWindow.document.write(`
  //   <!DOCTYPE html>
  //   <html>
  //     <head>
  //       <title>Invoice</title>
  //       <style>
  //         * {
  //           margin: 0;
  //           padding: 0;
  //           box-sizing: border-box;
  //           -webkit-print-color-adjust: exact !important;
  //           color-adjust: exact !important;
  //         }
  //         body {
  //           font-family: 'Courier New', Courier, monospace !important;
  //           background: #fff !important;
  //           color: #111827;
  //           margin: 0;
  //           padding: 0;
  //           font-size: 13px;
  //           line-height: 1.5;
  //         }
  //         .invoice-logo {
  //           height: 80px !important;
  //           width: auto !important;
  //           margin-top: 20px !important;
  //           margin-bottom: 20px !important;
  //           object-fit: contain !important;
  //           display: block !important;
  //           max-width: 100% !important;
  //         }
  //         .invoice-print {
  //           background: #fff !important;
  //           max-width: 900px;
  //           margin: 0 auto;
  //           padding: 24px;
  //           box-shadow: none;
  //           border-radius: 0;
  //         }

  //         /* Layout */
  //         .flex { display: flex; }
  //         .justify-between { justify-content: space-between; }
  //         .justify-end { justify-content: flex-end; }
  //         .text-right { text-align: right; }
  //         .text-center { text-align: center; }
  //         .text-left { text-align: left; }

  //         /* Colors and Borders */
  //         .border-t-4 { border-top: 4px solid #03414C !important; }
  //         .border-t-2 { border-top: 2px solid #03414C !important; }
  //         .border-b-2 { border-bottom: 2px solid #03414C !important; }
  //         .border-black { border-color: #03414C !important; }
  //         .border-gray-200 { border-color: #e5e7eb !important; }
  //         .border-gray-300 { border-color: #d1d5db !important; }
  //         .border-b { border-bottom: 1px solid #d1d5db !important; }
  //         .border-t { border-top: 1px solid #d1d5db !important; }
  //         .bg-white { background: #fff !important; }
  //         .text-gray-600 { color: #4b5563 !important; }
  //         .text-gray-900 { color: #111827 !important; }
  //         .text-blue-800 { color: #03414C !important; }

  //         /* Typography */
  //         .text-2xl { font-size: 24px !important; }
  //         .text-lg { font-size: 18px !important; }
  //         .text-sm { font-size: 14px !important; }
  //         .font-medium { font-weight: 500 !important; }
  //         .font-semibold { font-weight: 600 !important; }
  //         .font-bold { font-weight: 700 !important; }

  //         /* Spacing */
  //         .my-6 { margin-top: 24px !important; margin-bottom: 24px !important; }
  //         .mb-6 { margin-bottom: 24px !important; }
  //         .mb-8 { margin-bottom: 32px !important; }
  //         .mb-3 { margin-bottom: 12px !important; }
  //         .mt-6 { margin-top: 24px !important; }
  //         .pt-2\.5 { padding-top: 10px !important; }
  //         .pt-2 { padding-top: 8px !important; }
  //         .pb-4 { padding-bottom: 16px !important; }
  //         .px-6 { padding-left: 24px !important; padding-right: 24px !important; }
  //         .py-7 { padding-top: 28px !important; padding-bottom: 28px !important; }
  //         .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
  //         .py-4 { padding-top: 16px !important; padding-bottom: 16px !important; }
  //         .p-4 { padding: 16px !important; }

  //         /* Width */
  //         .w-1\/2 { width: 50% !important; }
  //         .w-1\/6 { width: 16.666667% !important; }
  //         .w-64 { width: 256px !important; }

  //         /* Space between */
  //         .space-y-1 > * + * { margin-top: 4px !important; }
  //         .space-y-2 > * + * { margin-top: 8px !important; }

  //         /* Shadow */
  //         .shadow-lg { box-shadow: none !important; }

  //         /* Print specific */
  //         .print\:hidden { display: none !important; }
  //         .bg-green-50 { background: #fff !important; }
  //         .border-green-200 { border-color: #d1d5db !important; }
  //         .rounded-lg { border-radius: 0 !important; }

  //         /* Fix for escaped classes */
  //         .pt-2\\.5 { padding-top: 10px !important; }
  //         .w-1\\/2 { width: 50% !important; }
  //         .w-1\\/6 { width: 16.666667% !important; }

  //         @page {
  //           margin: 0.5in;
  //           size: A4;
  //         }

  //         @media print {
  //           * {
  //             -webkit-print-color-adjust: exact !important;
  //             color-adjust: exact !important;
  //           }
  //           body {
  //             background: #fff !important;
  //             color: #111827 !important;
  //             margin: 0;
  //             padding: 0;
  //             font-size: 13px;
  //           }
  //           .invoice-print {
  //             box-shadow: none !important;
  //             border-radius: 0 !important;
  //             padding: 16px !important;
  //             margin: 0 !important;
  //             width: 100% !important;
  //             max-width: 100% !important;
  //           }
  //           .print\:hidden { display: none !important; }
  //           .shadow-lg { box-shadow: none !important; }
  //           .bg-white { background: #fff !important; }
  //           .bg-green-50 { background: #fff !important; }
  //           .rounded-lg { border-radius: 0 !important; }
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       ${invoiceHTML}
  //     </body>
  //   </html>
  // `);

  //   printWindow.document.close();
  //   printWindow.focus();

  //     printWindow.print();
  //     printWindow.close();
  //   }, 250);
  // };

  const handleBackToSales = () => {
    navigate("/sales");
  };

  if (!invoiceData) {
    return <div>Loading...</div>;
  }

  const renderProgressSteps = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step ? "bg-[#03414C] text-white" : "bg-gray-200 text-gray-600"}`}
            >
              {currentStep > step ? <FaCheck size={16} /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ${currentStep > step ? "bg-[#03414C]" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStepLabels = () => (
    <div className="flex justify-center mb-6">
      <div className="flex space-x-12 text-sm">
        <span
          className={
            currentStep >= 1 ? "text-[#03414C] font-medium" : "text-gray-500"
          }
        >
          Product Details
        </span>
        <span
          className={
            currentStep >= 2 ? "text-[#03414C] font-medium" : "text-gray-500"
          }
        >
          Customer Details
        </span>
        <span
          className={
            currentStep >= 3 ? "text-[#03414C] font-medium" : "text-gray-500"
          }
        >
          Invoice Preview
        </span>
      </div>
    </div>
  );

  const renderProductDetailsStep = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Product Details
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Product Name
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Quantity
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Unit Price
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="py-3 px-4">{product.name}</td>
                <td className="py-3 px-4">{product.quantity}</td>
                <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                <td className="py-3 px-4">${product.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>${invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="text-red-600">
                -${invoiceData.discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Tax ({invoiceData.taxRate}%):
              </span>
              <span>${invoiceData.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>${invoiceData.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {invoiceData.notes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Notes:</h3>
          <p className="text-gray-700">{invoiceData.notes}</p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <SpecialButton
          variant="secondary"
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </SpecialButton>
        <SpecialButton
          variant="primary"
          onClick={handleProductDetailsNext}
          className="px-6 py-2 bg-[#03414C] hover:bg-[#025561] text-white"
        >
          Next Step
        </SpecialButton>
      </div>
    </div>
  );

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    if (!e || !("target" in e) || e.type === "click") {
      fileInputRef.current?.click();
      return;
    }

    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setBusinessFormData((prev) => ({ ...prev, logoUrl: url }));
      toast.success("Logo uploaded successfully!");
    } catch (err) {
      console.error("Error uploading logo:", err);
      toast.error("Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  const renderBusinessForm = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Info Message */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Business Setup Required
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              You need to create your business profile first before generating
              invoices. This information will be used on all your invoices.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Business Details
      </h2>

      <form onSubmit={handleBusinessFormSubmit} className="space-y-4">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={businessFormData.businessName}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                businessName: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter business name"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={businessFormData.contactNo}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                contactNo: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter contact number"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={businessFormData.address}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                address: e.target.value,
              })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter business address"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website (Optional)
          </label>
          <input
            type="url"
            value={businessFormData.website}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                website: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter website URL"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleLogoUpload}
              disabled={logoUploading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#03414C] text-white rounded-lg hover:bg-[#025561] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCloudUploadAlt className="w-4 h-4" />
              <span>{logoUploading ? "Uploading..." : "Upload Logo"}</span>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden"
              disabled={logoUploading}
            />

            {logoUploading && (
              <FiLoader className="animate-spin text-[#03414C] w-5 h-5" />
            )}

            {businessFormData.logoUrl && (
              <img
                src={businessFormData.logoUrl}
                alt="Business Logo"
                className="w-12 h-12 rounded object-cover border"
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <SpecialButton
            variant="secondary"
            onClick={() => navigate("/sales/add-new-sale")}
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back to Sales
          </SpecialButton>
          <button
            type="submit"
            className="px-6 py-2 bg-[#03414C] hover:bg-[#025561] text-white rounded-lg transition-colors duration-200"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );

  const renderCustomerDetailsStep = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Customer Details
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerDetails.name}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={customerDetails.phone}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  phone: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={customerDetails.email}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            value={customerDetails.address}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                address: e.target.value,
              })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter customer address"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <SpecialButton
          variant="secondary"
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </SpecialButton>
        <SpecialButton
          variant="primary"
          onClick={handleCustomerDetailsNext}
          className="px-6 py-2 bg-[#03414C] hover:bg-[#025561] text-white"
          disabled={isCreatingSale || checkingBusinessDetails}
        >
          Preview Invoice
        </SpecialButton>
      </div>
    </div>
  );

  const renderInvoicePreview = () => (
    <div className=" p-6">
      {/* Preview/Success Message 
      {!invoiceResponse ? (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
          <div className="flex items-center">
            <div className="text-blue-600 mr-2">👁️</div>
            <span className="text-blue-800 font-medium">Invoice Preview - Review and generate your invoice</span>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 print:hidden">
          <div className="flex items-center">
            <FaCheck className="text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Invoice generated successfully!</span>
          </div>
        </div>
      )}
        */}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 print:hidden">
        <SpecialButton
          variant="secondary"
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft size={16} />
          Back to Edit
        </SpecialButton>
        <div className="flex gap-3">
          <SpecialButton
            variant="secondary"
            onClick={handleCreateSaleAndInvoice}
            className="flex items-center gap-2  py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FaPrint size={16} />
            Generate Invoice
          </SpecialButton>
          <SpecialButton
            variant="primary"
            onClick={handleBackToSales}
            className="px-4 py-2 bg-[#03414C] hover:bg-[#025561] text-white"
          >
            Back to Sales
          </SpecialButton>
        </div>
      </div>

      {/* Custom Fields Input Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 print:hidden">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="space-y-3">
          {customFields.map((field, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Field Name"
                value={field.name}
                onChange={(e) => {
                  const newFields = [...customFields];
                  newFields[index].name = e.target.value;
                  setCustomFields(newFields);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
              />
              <input
                type="text"
                placeholder="Field Value"
                value={field.value}
                onChange={(e) => {
                  const newFields = [...customFields];
                  newFields[index].value = e.target.value;
                  setCustomFields(newFields);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
              />
              {customFields.length > 1 && (
                <button
                  onClick={() => {
                    const newFields = customFields.filter(
                      (_, i) => i !== index
                    );
                    setCustomFields(newFields);
                  }}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTrash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setCustomFields([...customFields, { name: "", value: "" }])
          }
          className="mt-3 flex items-center gap-2 px-4 py-2 text-[#03414C] hover:bg-[#03414C]/10 border border-[#03414C] rounded-lg transition-colors"
        >
          <FaPlus size={14} />
          Add Custom Field
        </button>
      </div>

      <h3 className="text-2xl my-6">Customer Copy</h3>
      <div
        className="invoice-print bg-white px-6 py-7 shadow-lg border border-gray-200"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          backgroundColor: "#ffffff",
          color: "#000000",
          borderColor: "#e5e7eb",
        }}
      >
        <div
          className="border-t-4 border-black pb-4"
          style={{
            borderTopColor: "#03414C",
            borderTopWidth: "4px",
            borderTopStyle: "solid",
          }}
        >
          <img
            src={storeBusinessDetails?.logoUrl}
            alt=""
            className="invoice-logo h-28 w-auto pt-5"
          />
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <h2 className="font-semibold">
              {storeBusinessDetails?.businessName}
            </h2>
            <p></p>
            <p>{storeBusinessDetails?.address}</p>
            <p>{storeBusinessDetails?.contactNo}</p>
            <p>{storeBusinessDetails?.website}</p>
          </div>

          <div className="text-right text-sm space-y-1">
            <p>
              <strong>Invoice No:</strong>{" "}
              {invoiceResponse?.data?.invoiceNumber
                ?.split("-")
                .pop()
                ?.slice(-6) || "000001"}
            </p>
            <p>
              <strong>Account No:</strong>{" "}
              {invoiceResponse?.data?.customerId?.slice(-8) || "00002234"}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(
                invoiceResponse?.data?.createdAt || Date.now()
              ).toLocaleDateString()}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div className="mb-6 w-1/2">
            <h3 className="font-semibold">Billed To</h3>
            <p>{invoiceResponse?.data?.customerName || customerDetails.name}</p>
            <p>
              {invoiceResponse?.data?.customerAddress ||
                customerDetails.address}
            </p>
            <p>
              {invoiceResponse?.data?.customerPhone || customerDetails.phone}
            </p>
            <p>
              {invoiceResponse?.data?.customerMail || customerDetails.email}
            </p>
          </div>
          {/* Custom Fields */}
          {customFields.filter((f) => f.name && f.value).length > 0 && (
            <div className="mb-6 w-1/2">
              <div className="space-y-2">
                {customFields
                  .filter((f) => f.name && f.value)
                  .map((field, idx) => (
                    <div key={idx} className="flex justify-end gap-x-4 text-sm">
                      <span className="font-medium">
                        <strong>{field.name}:</strong>
                      </span>
                      <span>{field.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-b-2 border-black py-2 font-semibold flex text-sm">
          <div className="w-1/2">Item Details</div>
          <div className="w-1/6 text-center">Qty</div>
          <div className="w-1/6 text-center">Unit</div>
          {invoiceData.products[0].selectedProduct.packs.length > 0 && (
            <div className="w-1/6 text-center">Pack Size</div>
          )}
          <div className="w-1/6 text-center">Unit Price</div>
          {/* <div className="w-1/6">Allowance</div> */}
          <div className="w-1/6 text-right">Extended Price</div>
        </div>

        {invoiceData.products.map((item: any, idx: number) => (
          <div
            key={item.id || idx}
            className="flex py-4 border-b border-gray-200 text-sm"
          >
            <div className="w-1/2">
              <p className="font-semibold">{item.productName || item.name}</p>
              {/* <p className="text-gray-600">Your Product Detailed Description</p> */}
            </div>
            <div className="w-1/6 text-center">{item.quantity}</div>
            <div className="w-1/6 text-center">
              {item.selectedProduct.packs.length > 0 ? "Box" : "Item"}
            </div>
            {item.selectedProduct?.packs.length > 0 && (
              <div className="w-1/6 text-center">
                {item.selectedProduct.packs[0].totalPacksQuantity}
              </div>
            )}

            <div className="w-1/6 text-center">
              $ {(item.sellingPrice || item.price)?.toFixed(2)}
            </div>
            <div className="w-1/6 text-right font-bold">
              $ {(item.totalPrice || item.total)?.toFixed(2)}
            </div>
          </div>
        ))}

        {/* Totals Section */}
        <div className="flex justify-end mt-6 text-sm">
          {/* <div>
            <img src={invoiceResponse.data.qrCode} alt="QR Code" style={{ width: 80, height: 80 }} />
          </div> */}
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>
                $
                {(
                  (invoiceResponse?.data?.totalAmount ||
                    invoiceData.finalTotal) -
                  (invoiceResponse?.data?.tax || invoiceData.taxAmount)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax:</span>
              <span>
                ${" "}
                {(invoiceResponse?.data?.tax || invoiceData.taxAmount).toFixed(
                  2
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 border-gray-300">
              <span>Total:</span>
              <span>
                ${" "}
                {(
                  invoiceResponse?.data?.totalAmount || invoiceData.finalTotal
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <h3 className="text-2xl my-6">Company Copy</h3>
      <div
        className=" bg-white px-6 py-7 shadow-lg border border-gray-200"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          backgroundColor: "#ffffff",
          color: "#000000",
          borderColor: "#e5e7eb",
        }}
      >
        <div
          className="border-t-4 border-black pb-4"
          style={{
            borderTopColor: "#03414C",
            borderTopWidth: "4px",
            borderTopStyle: "solid",
          }}
        >
          <img
            src={storeBusinessDetails?.logoUrl}
            alt=""
            className="invoice-logo h-28 w-auto pt-5"
          />
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <h2 className="font-semibold">
              {storeBusinessDetails?.businessName}
            </h2>
            <p></p>
            <p>{storeBusinessDetails?.address}</p>
            <p>{storeBusinessDetails?.contactNo}</p>
            <p>{storeBusinessDetails?.website}</p>
          </div>

          <div className="text-right text-sm space-y-1">
            <p>
              <strong>Invoice No:</strong>{" "}
              {invoiceResponse?.data?.invoiceNumber
                ?.split("-")
                .pop()
                ?.slice(-6) || "000001"}
            </p>
            <p>
              <strong>Account No:</strong>{" "}
              {invoiceResponse?.data?.customerId?.slice(-8) || "00002234"}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(
                invoiceResponse?.data?.createdAt || Date.now()
              ).toLocaleDateString()}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div className="mb-6 w-1/2">
            <h3 className="font-semibold">Billed To</h3>
            <p>{invoiceResponse?.data?.customerName || customerDetails.name}</p>
            <p>
              {invoiceResponse?.data?.customerAddress ||
                customerDetails.address}
            </p>
            <p>
              {invoiceResponse?.data?.customerPhone || customerDetails.phone}
            </p>
            <p>
              {invoiceResponse?.data?.customerMail || customerDetails.email}
            </p>
          </div>
          {/* Custom Fields */}
          {customFields.filter((f) => f.name && f.value).length > 0 && (
            <div className="mb-6 w-1/2">
              <div className="space-y-2">
                {customFields
                  .filter((f) => f.name && f.value)
                  .map((field, idx) => (
                    <div key={idx} className="flex justify-end gap-x-4 text-sm">
                      <span className="font-medium">
                        <strong>{field.name}:</strong>
                      </span>
                      <span>{field.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-b-2 border-black py-2 font-semibold flex text-sm">
          <div className="w-1/2">Item Details</div>
          <div className="w-1/6 text-center">Qty</div>
          <div className="w-1/6 text-center">Unit</div>
          {invoiceData.products[0].selectedProduct.packs.length > 0 && (
            <div className="w-1/6 text-center">Pack Size</div>
          )}
          <div className="w-1/6 text-center">Unit Price</div>
          {/* <div className="w-1/6">Allowance</div> */}
          <div className="w-1/6 text-right">Extended Price</div>
        </div>

        {invoiceData.products.map((item: any, idx: number) => (
          <div
            key={item.id || idx}
            className="flex py-4 border-b border-gray-200 text-sm"
          >
            <div className="w-1/2">
              <p className="font-semibold">{item.productName || item.name}</p>
              {/* <p className="text-gray-600">Your Product Detailed Description</p> */}
            </div>
            <div className="w-1/6 text-center">{item.quantity}</div>
            <div className="w-1/6 text-center">
              {item.selectedProduct.packs.length > 0 ? "Box" : "Item"}
            </div>
            {item.selectedProduct?.packs.length > 0 && (
              <div className="w-1/6 text-center">
                {item.selectedProduct.packs[0].totalPacksQuantity}
              </div>
            )}

            <div className="w-1/6 text-center">
              $ {(item.sellingPrice || item.price)?.toFixed(2)}
            </div>
            <div className="w-1/6 text-right font-bold">
              $ {(item.totalPrice || item.total)?.toFixed(2)}
            </div>
          </div>
        ))}

        {/* Totals Section */}
        <div className="flex justify-end mt-6 text-sm">
          {/* <div>
            <img src={invoiceResponse.data.qrCode} alt="QR Code" style={{ width: 80, height: 80 }} />
          </div> */}
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>
                $
                {(
                  (invoiceResponse?.data?.totalAmount ||
                    invoiceData.finalTotal) -
                  (invoiceResponse?.data?.tax || invoiceData.taxAmount)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax:</span>
              <span>
                ${" "}
                {(invoiceResponse?.data?.tax || invoiceData.taxAmount).toFixed(
                  2
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 border-gray-300">
              <span>Total:</span>
              <span>
                ${" "}
                {(
                  invoiceResponse?.data?.totalAmount || invoiceData.finalTotal
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:px-0 print:py-0">
        {currentStep < 4 && (
          <div className="print:hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Professional Invoice
                  </h1>
                  {/* <p className="text-gray-600">Generate professional invoice</p> */}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {renderProgressSteps()}
            {renderStepLabels()}
          </div>
        )}

        {/* Step Content */}
        {showBusinessForm ? (
          renderBusinessForm()
        ) : (
          <>
            {currentStep === 1 && renderProductDetailsStep()}
            {currentStep === 2 && renderCustomerDetailsStep()}
            {currentStep === 3 && renderInvoicePreview()}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateInvoice;
