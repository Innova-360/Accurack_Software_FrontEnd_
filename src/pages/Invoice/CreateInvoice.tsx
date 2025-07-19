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
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useRef } from 'react';
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface BusinessDetails {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId: string;
  businessName?: string;
  address?: string;
  contactNo?: string;
  website?: string;
  logoUrl?: string;
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
    packType?: "BOX" | "ITEM";
    selectedProduct?: any;
    packs?: Array<{
      id: string;
      productId: string;
      minimumSellingQuantity: number;
      totalPacksQuantity: number;
      orderedPacksPrice: number;
      discountAmount: number;
      percentDiscount: number;
      createdAt: string;
      updatedAt: string;
    }>;
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

// QR Code wrapper component to handle errors gracefully
const SafeQRCode = ({ value, ...props }: any) => {
  try {
    if (!value || value.trim() === '') return null;
    return <QRCodeSVG value={value} {...props} />;
  } catch (error) {
    console.warn('QR Code generation failed for value:', value);
    return <span className="text-xs text-gray-500">Invalid QR code</span>;
  }
};

const CreateInvoice: React.FC = () => {
  const printRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentStore = useRequireStore();
  const { user } = useSelector((state: RootState) => state.user);
  const [customFields, setCustomFields] = useState([{ name: "", value: "" }]);
  const [checkingBusinessDetails, setCheckingBusinessDetails] = useState(false);
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;


  const invoiceData = location.state?.invoiceData as InvoiceData;

  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const [invoiceResponse, setInvoiceResponse] = useState<any>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessFormData, setBusinessFormData] = useState({
    businessName: "",
    contactNo: "",
    website: "",
    address: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    logoUrl: "",
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadPdf = async () => {
    const toastId = toast.loading("Generating PDF…");
    try {
      const element = printRef.current;
      if (!element) {
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const data = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 10;

      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;

      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, 'PNG', margin, margin, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
      toast.success("PDF downloaded!", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      return;
    }

  };



  const [storeBusinessDetails, setStoreBusinessDetails] =
    useState<BusinessDetails>({
      companyName: "",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      companyWebsite: "",
      taxId: "",
    });

  const [customerDetails, setCustomerDetails] = useState({
    name: invoiceData?.customerDetails?.name || "",
    phone: invoiceData?.customerDetails?.phone || "",
    email: invoiceData?.customerDetails?.email || "",
    address: invoiceData?.customerDetails?.address || "",
    streetAddress: invoiceData?.customerDetails?.street || "",
    city: invoiceData?.customerDetails?.city || "",
    state: invoiceData?.customerDetails?.state || "",
    zipCode: invoiceData?.customerDetails?.postalCode || "",
    country: invoiceData?.customerDetails?.country || "",
    companyName: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
  });

  const handleProductDetailsNext = () => {
    setCurrentStep(2);
  };

  const handleCustomerDetailsNext = async () => {
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

    // Merge address fields into a single address string
    const mergedAddress = [
      businessFormData.streetAddress,
      businessFormData.city &&
        businessFormData.state &&
        businessFormData.zipCode
        ? `${businessFormData.city}, ${businessFormData.state} ${businessFormData.zipCode}`
        : [
          businessFormData.city,
          businessFormData.state,
          businessFormData.zipCode,
        ]
          .filter(Boolean)
          .join(" "),
      businessFormData.country,
    ]
      .filter(Boolean)
      .join("\n");

    const submitData = {
      ...businessFormData,
      address: mergedAddress || businessFormData.address,
    };

    try {
      await apiClient.post("/invoice/set-business/details", submitData);
      toast.success("Business details saved successfully!");
      setShowBusinessForm(false);
      setCurrentStep(3);
    } catch (error) {
      toast.error("Failed to save business details");
    }
  };

  const handleCreateSaleAndInvoice = async () => {
    if (!currentStore?.id || !user?.clientId) {
      toast.error("Store or user information is missing");
      return;
    }
    if (isCreatingSale) return;
    setIsCreatingSale(true);
    try {
      const saleItems: SaleItem[] = invoiceData.products.map((product) => ({
        productId: product.productId || "",
        productName: product.name,
        quantity: product.quantity,
        sellingPrice: product.price,
        totalPrice: product.total,
        pluUpc: product.pluUpc || product.plu || product.sku || "",
        packType: product.packType || "ITEM",
      }));

      // Merge customer address fields into a single address string
      const mergedCustomerAddress = [
        customerDetails.streetAddress,
        customerDetails.city && customerDetails.state && customerDetails.zipCode
          ? `${customerDetails.city}, ${customerDetails.state} ${customerDetails.zipCode}`
          : [
            customerDetails.city,
            customerDetails.state,
            customerDetails.zipCode,
          ]
            .filter(Boolean)
            .join(" "),
        customerDetails.country,
      ]
        .filter(Boolean)
        .join("\n");

      const finalCustomerAddress =
        mergedCustomerAddress || customerDetails.address;

      const saleData: SaleRequestData = {
        customerPhone: customerDetails.phone.trim(),
        customerData: {
          customerName: customerDetails.name.trim(),
          customerStreetAddress: finalCustomerAddress.trim(),
          country: customerDetails.country.trim(),
          state: customerDetails.state.trim(),
          city: customerDetails.city.trim(),
          zipCode: customerDetails.zipCode.trim(),
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

      const saleResponse = await (dispatch as any)(
        createSale(saleData)
      ).unwrap();

      const saleId =
        saleResponse?.sale?.id ||
        saleResponse?.data?.sale?.id ||
        saleResponse?.id;

      if (!saleId) {
        throw new Error("Sale ID not found in response");
      }

      const invoicePayload = {
        saleId: String(saleId),
        invoiceNumber,
        customFields: customFields
          .filter((f) => f.name && f.value)
          .map((f) => ({
            name: f.name,
            value: f.value,
          })),
      };
      const response = await apiClient.post("/invoice", invoicePayload);
      setInvoiceResponse(response.data);
      toast.success("Invoice generated successfully!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsCreatingSale(false);
    }
  };

  const handleBackToSales = () => {
    navigate(`/store/${currentStore?.id}/sales`);
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
                Unit Type
              </th>
              
              {hasPackProducts && (
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Box Size
                </th>
              )}
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
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.pluUpc && (
                      <div className="text-sm text-gray-500">
                        PLU/UPC: {product.pluUpc}
                      </div>
                    )}
                    {product.sku && (
                      <div className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div>{product.quantity}</div>
                    <div className="text-xs text-gray-500">
                      {product.packType === "BOX" ? "Box(es)" : "Item(s)"}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    {product.pluUpc && (
                      <SafeQRCode
                        value={`Name:${product.name}|PLU:${product.pluUpc}`}
                        size={60}
                        bgColor="transparent"
                        fgColor="#000000"
                        level="M"
                      />
                    )}
                    {!product.pluUpc && (
                      <span className="text-xs text-gray-400">No PLU</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {product.packType === "BOX" ? "Box" : "Item"}
                </td>
                {hasPackProducts && (
                  <td className="py-3 px-4">
                    {product.packType === "BOX"
                      ? product.selectedProduct?.packs?.[0]?.minimumSellingQuantity ||
                      product.selectedProduct?.packs?.[0]?.totalPacksQuantity ||
                      "12"
                      : "1"}
                  </td>
                )}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>

          {/* Street Address */}
          <input
            type="text"
            value={businessFormData.streetAddress}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                streetAddress: e.target.value,
              })
            }
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Street Address"
          />

          {/* City, State, ZIP Code in a row */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={businessFormData.city}
              onChange={(e) =>
                setBusinessFormData({
                  ...businessFormData,
                  city: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="City"
            />
            <input
              type="text"
              value={businessFormData.state}
              onChange={(e) =>
                setBusinessFormData({
                  ...businessFormData,
                  state: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="State"
            />
            <input
              type="text"
              value={businessFormData.zipCode}
              onChange={(e) =>
                setBusinessFormData({
                  ...businessFormData,
                  zipCode: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="ZIP Code"
            />
          </div>

          {/* Country */}
          <input
            type="text"
            value={businessFormData.country}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                country: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Country"
          />
        </div>

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

        <div className="flex justify-between mt-6">
          <SpecialButton
            variant="secondary"
            onClick={() => navigate(`/store/${currentStore?.id}/sales`)}
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
        Customer Detail
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

          {/* Street Address */}
          <input
            type="text"
            value={customerDetails.streetAddress}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                streetAddress: e.target.value,
              })
            }
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Street Address"
          />

          {/* City, State, ZIP Code in a row */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={customerDetails.city}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  city: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="City"
            />
            <input
              type="text"
              value={customerDetails.state}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  state: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="State"
            />
            <input
              type="text"
              value={customerDetails.zipCode}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  zipCode: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="ZIP Code"
            />
          </div>

          {/* Country */}
          <input
            type="text"
            value={customerDetails.country}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                country: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Country"
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

  // Group products by name and packType
  const groupedProducts = invoiceData.products.reduce(
    (acc, product) => {
      const key = `${product.name}-${product.packType || "ITEM"}`;

      if (acc[key]) {
        // Product already exists, add quantities and totals
        acc[key].quantity += product.quantity;
        acc[key].total += product.total;
        // Keep the price per unit from the first occurrence
      } else {
        // New product group
        acc[key] = { ...product };
      }

      return acc;
    },
    {} as Record<string, any>
  );

  const consolidatedProducts = Object.values(groupedProducts);

  const hasPackProducts = invoiceData.products.some(
    (product) => product.packType === "BOX"
  );

  console.log("🔍 Debug Pack Products:", {
    products: invoiceData.products.map((p) => ({
      name: p.name,
      packType: p.packType,
    })),
    hasPackProducts,
  });

  { console.log("Invoice response", invoiceResponse) }



  const renderInvoicePreview = () => (
    <div className=" p-6">
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
            onClick={handleDownloadPdf}
            className="flex items-center gap-2  py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            Save as pdf
          </SpecialButton>
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
          backgroundColor: "#ffffff",
          color: "#000000",
          borderColor: "#e5e7eb",
        }}
        ref={printRef}
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
              {storeBusinessDetails?.businessName ||
                storeBusinessDetails?.companyName}
            </h2>
            <p></p>
            <p>
              {storeBusinessDetails?.address ||
                storeBusinessDetails?.companyAddress}
            </p>
            <p>
              {storeBusinessDetails?.contactNo ||
                storeBusinessDetails?.companyPhone}
            </p>
            <p>
              {storeBusinessDetails?.website ||
                storeBusinessDetails?.companyWebsite}
            </p>
          </div>

          <div className="text-right text-sm space-y-1">
            <p>
              <strong>Invoice No:</strong>{" "}
              {invoiceNumber.slice(0, 9)}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(
                invoiceResponse?.data?.createdAt || Date.now()
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div className="mb-6 w-1/2">
            <h3 className="font-semibold">Billed To</h3>
            <p>{invoiceResponse?.data?.customerName || customerDetails.name}</p>
            <p>
              {customerDetails.streetAddress}
            </p>
            <p>
              {`${customerDetails.city} , ${customerDetails.state} ${customerDetails.zipCode}`}
            </p>
            <p>
              {customerDetails.country}
            </p>
            <p className="phone-details">
              Phone : {invoiceResponse?.data?.customerPhone || customerDetails.phone}
            </p>
            <p>
              Email : {customerDetails.email}
            </p>
          </div>
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
          <div className="w-1/6 text-center">QR Code</div>
          <div className="w-1/6 text-center">Qty</div>
          <div className="w-1/6 text-center">Unit</div>
          <div className="w-1/6 text-center">Box Size</div>
          <div className="w-1/6 text-center">Unit Price</div>
          <div className="w-1/6 text-right">Extended Price</div>
        </div>

        {consolidatedProducts.map((item: any, idx: number) => (
          <div
            key={item.id || idx}
            className="flex py-4 border-b border-gray-200 text-sm"
          >
            <div className="w-1/2">
              <p className="font-semibold">{item.productName || item.name}</p>
            </div>
            <div className="w-1/6 text-center">
              {item.pluUpc && (
                <div className="flex justify-center">
                  <SafeQRCode
                    value={`Name:${item.name || item.productName}|PLU:${item.pluUpc}`}
                    size={40}
                    bgColor="transparent"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              )}
            </div>
            <div className="w-1/6 text-center">{item.quantity}</div>
            <div className="w-1/6 text-center">
              {item.packType === "BOX" ? "Box" : "Item"}
            </div>
            <div className="w-1/6 text-center">
              {item.packType === "BOX" ? (
                item.packs && item.packs.length > 0
                  ? item.packs[0].minimumSellingQuantity
                  : item.selectedProduct?.packs?.[0]?.minimumSellingQuantity || "12"
              ) : (
                "1"
              )}
            </div>
            <div className="w-1/6 text-center">
              $ {(item.sellingPrice || item.price)?.toFixed(2)}
            </div>
            <div className="w-1/6 text-right font-bold">
              $ {(item.totalPrice || item.total)?.toFixed(2)}
            </div>
          </div>
        ))}

        <div className="flex justify-between mt-24 text-sm items-end">
          <div className="w-64 space-y-2 ">
            <p className="text-center !pt-2 border-t-2 text-lg">Signature</p>
          </div>
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
              {storeBusinessDetails?.businessName ||
                storeBusinessDetails?.companyName}
            </h2>
            <p></p>
            <p>
              {storeBusinessDetails?.address ||
                storeBusinessDetails?.companyAddress}
            </p>
            <p>
              {storeBusinessDetails?.contactNo ||
                storeBusinessDetails?.companyPhone}
            </p>
            <p>
              {storeBusinessDetails?.website ||
                storeBusinessDetails?.companyWebsite}
            </p>
          </div>

          <div className="text-right text-sm space-y-1">
            <p>
              <strong>Invoice No:</strong>{" "}
              {invoiceNumber.slice(0, 9)}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(
                invoiceResponse?.data?.createdAt || Date.now()
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div className="mb-6 w-1/2">
            <h3 className="font-semibold">Billed To</h3>
            <p>{invoiceResponse?.data?.customerName || customerDetails.name}</p>
            <p>
              {customerDetails.streetAddress}
            </p>
            <p>
              {`${customerDetails.city} , ${customerDetails.state} ${customerDetails.zipCode}`}
            </p>
            <p>
              {customerDetails.country}
            </p>
            <p className="mt-3">
              Phone : {invoiceResponse?.data?.customerPhone || customerDetails.phone}
            </p>
            <p>
              Email : {customerDetails.email}
            </p>
          </div>
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
          <div className="w-1/6 text-center">QR Code</div>
          <div className="w-1/6 text-center">Qty</div>
          <div className="w-1/6 text-center">Unit</div>
          <div className="w-1/6 text-center">Box Size</div>
          <div className="w-1/6 text-center">Unit Price</div>
          <div className="w-1/6 text-right">Extended Price</div>
        </div>

        {consolidatedProducts.map((item: any, idx: number) => (
          <div
            key={item.id || idx}
            className="flex py-4 border-b border-gray-200 text-sm"
          >
            <div className="w-1/2">
              <p className="font-semibold">{item.productName || item.name}</p>
            </div>
            <div className="w-1/6 text-center">
              {item.pluUpc && (
                <div className="flex justify-center">
                  <SafeQRCode
                    value={`Name:${item.name || item.productName}|PLU:${item.pluUpc}`}
                    size={40}
                    bgColor="transparent"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              )}
            </div>
            <div className="w-1/6 text-center">{item.quantity}</div>
            <div className="w-1/6 text-center">
              {item.packType === "BOX" ? "Box" : "Item"}
            </div>
            <div className="w-1/6 text-center">
              {item.packType === "BOX" ? (
                item.packs && item.packs.length > 0
                  ? item.packs[0].minimumSellingQuantity
                  : item.selectedProduct?.packs?.[0]?.minimumSellingQuantity || "12"
              ) : (
                "1"
              )}
            </div>
            <div className="w-1/6 text-center">
              $ {(item.sellingPrice || item.price)?.toFixed(2)}
            </div>
            <div className="w-1/6 text-right font-bold">
              $ {(item.totalPrice || item.total)?.toFixed(2)}
            </div>
          </div>
        ))}

        <div className="flex justify-between mt-24 text-sm items-end">
          <div className="w-64 space-y-2 ">
            <p className="text-center !pt-2 border-t-2 text-lg">Signature</p>
          </div>
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
                </div>
              </div>
            </div>

            {renderProgressSteps()}
            {renderStepLabels()}
          </div>
        )}

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
