import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaArrowLeft, FaCheck, FaPrint, FaCloudUploadAlt } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import { SpecialButton } from '../../components/buttons';
import { createSale } from '../../store/slices/salesSlice';
import { fetchBusinessDetails, setBusinessDetails } from '../../store/slices/businessSlice';
import type { RootState, AppDispatch } from '../../store';
import type { SaleRequestData, SaleItem } from '../../store/slices/salesSlice';
import useRequireStore from '../../hooks/useRequireStore';
import apiClient from '../../services/api';
import { uploadImageToCloudinary } from '../../services/cloudinary';

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
  discountType: 'percentage' | 'amount';
  discountAmount: number;
  taxRate: number;
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
  // const { loading: salesLoading } = useSelector((state: RootState) => state.sales);

  const invoiceData = location.state?.invoiceData as InvoiceData;
  console.log('Invoice Data:', invoiceData);

  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const [invoiceResponse, setInvoiceResponse] = useState<any>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessFormData, setBusinessFormData] = useState({
    businessName: '',
    contactNo: '',
    website: '',
    address: '',
    logoUrl: ''
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Invoice specific fields
  const [invoiceFields, setInvoiceFields] = useState({
    customerid: invoiceResponse?.customerId,
    invoiceNo: invoiceNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryDate: ''
  });

  // Business details state
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    taxId: ''
  });

  // Enhanced customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: invoiceData?.customerDetails?.name || '',
    phone: invoiceData?.customerDetails?.phone || '',
    email: invoiceData?.customerDetails?.email || '',
    address: invoiceData?.customerDetails?.address || '',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: ''
  });

  useEffect(() => {
    if (!invoiceData) {
      navigate('/sales/add-new-sale');
      return;
    }

    // Check if business details are already saved (simulate localStorage check)
    const savedBusinessDetails = localStorage.getItem('businessDetails');
    if (savedBusinessDetails) {
      setBusinessDetails(JSON.parse(savedBusinessDetails));
      setCurrentStep(2); // Skip business details if already filled
    }
  }, [invoiceData, navigate]);

  const handleBusinessDetailsSubmit = () => {
    // Validate business details
    if (!businessDetails.companyName.trim() || !businessDetails.companyAddress.trim() ||
      !businessDetails.companyPhone.trim() || !businessDetails.companyEmail.trim()) {
      alert('Please fill in all required business details');
      return;
    }

    // Save business details to localStorage for future use
    localStorage.setItem('businessDetails', JSON.stringify(businessDetails));
    setCurrentStep(2);
  };

  const handleProductDetailsNext = () => {
    setCurrentStep(3);
  };

  const handleCustomerDetailsNext = async () => {
    // Validate customer details
    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error('Customer name and phone are required');
      return;
    }

    // Check business details first
    await checkBusinessDetails();
  };

  const checkBusinessDetails = async () => {
    try {
      // const response = await dispatch(fetchBusinessDetails()).unwrap();
      const businessResponse = await apiClient.get('/invoice/get-business/details');

      if (businessResponse.data.showBusinessForm) {
        setShowBusinessForm(true);
      } else {
        // Business exists, proceed with invoice creation
        await handleCreateSaleAndInvoice();
      }
    } catch (error) {
      console.error('Error checking business details:', error);
      setShowBusinessForm(true);
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
      toast.error('Please fill all required fields.');
      return;
    }
    if (businessFormData.website && !validateUrl(businessFormData.website)) {
      toast.error('Invalid website URL.');
      return;
    }

    try {
      await apiClient.post('/invoice/set-business/details',businessFormData);
      toast.success('Business details saved successfully!');
      setShowBusinessForm(false);
      // Now proceed with invoice creation
      await handleCreateSaleAndInvoice();
    } catch (error) {
      console.log("error",err)
      // Error is handled by the slice
      toast.error('Failed to save business details');
    }
  };

  const handleCreateSaleAndInvoice = async () => {
    if (!currentStore?.id || !user?.clientId) {
      toast.error('Store or user information is missing');
      return;
    }

    setIsCreatingSale(true);
    try {
      // Prepare sale items from invoice data
      const saleItems: SaleItem[] = invoiceData.products.map((product) => ({
        productId: product.productId,
        productName: product.name,
        quantity: product.quantity,
        sellingPrice: product.price,
        totalPrice: product.total,
        pluUpc: product.pluUpc || product.plu || product.sku || '',
      }));

      console.log('Sale items with pluUpc:', JSON.stringify(saleItems, null, 2));

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
        paymentMethod: invoiceData.paymentMethod as "CASH" | "CARD" | "BANK_TRANSFER" | "CHECK" | "DIGITAL_WALLET",
        totalAmount: Math.round(invoiceData.finalTotal * 100) / 100,
        tax: Math.round(invoiceData.taxAmount * 100) / 100,
        cashierName: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email || "Current User",
        generateInvoice: false,
        source: "manual",
        status: "PENDING",
        saleItems,
      };

      console.log('Creating sale for invoice:', saleData);
      const saleResponse = await dispatch(createSale(saleData)).unwrap();
      console.log('Sale response:', saleResponse);

      // Extract sale ID from response structure
      const saleId = saleResponse?.sale?.id || saleResponse?.data?.sale?.id || saleResponse?.id;

      if (!saleId) {
        throw new Error('Sale ID not found in response');
      }

      // Generate invoice with sale ID
      const invoicePayload = {
        saleId: String(saleId),
        customFields: [
          {
            name: "VAT Number",
            value: businessDetails.taxId || ""
          },
          {
            name: "PO Number",
            value: `PO-${Date.now()}`
          }
        ]
      };

      // Call invoice generation API
      const response = await apiClient.post('/invoice', invoicePayload);
      console.log('Invoice generated:', response.data);
      setInvoiceResponse(response.data);
      toast.success('Invoice generated successfully!');
      setCurrentStep(4);
    } catch (error: any) {
      console.log('Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsCreatingSale(false);
    }
  };

  const handlePrint = () => {
    const invoiceElement = document.querySelector('.invoice-print');
    if (!invoiceElement) {
      toast.error('Invoice content not found');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    // Get the invoice HTML content
    const invoiceHTML = invoiceElement.innerHTML;

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #374151;
              background: white;
              padding: 20px;
            }
            .text-3xl { font-size: 1.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-sm { font-size: 0.875rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-gray-900 { color: #111827; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4B5563; }
            .text-gray-500 { color: #6B7280; }
            .text-red-600 { color: #DC2626; }
            .text-green-600 { color: #059669; }
            .text-green-800 { color: #065F46; }
            .bg-green-50 { background-color: #ECFDF5; }
            .bg-green-100 { background-color: #D1FAE5; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-8 { margin-bottom: 2rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bg-gray-100 { background-color: #F3F4F6 !important; }
            .bg-gray-50 { background-color: #F9FAFB !important; }
            .bg-green-100 { background-color: #DCFCE7 !important; }
            .text-green-800 { color: #166534 !important; }
            .border-l-4 { border-left: 4px solid; }
            .rounded { border-radius: 0.375rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-t { border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; }
            .rounded-b { border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem; }
            .rounded-full { border-radius: 9999px; }
            input, textarea { border: none !important; background: transparent !important; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            /* Brand colors */
            .bg-\[\#03414C\] { background-color: #03414C !important; }
            .text-\[\#03414C\] { color: #03414C !important; }
            .border-\[\#03414C\] { border-color: #03414C !important; }
            /* Ensure all backgrounds print */
            table thead tr { background-color: #03414C !important; color: white !important; }
            .bg-gray-50 { background-color: #F9FAFB !important; }
            .bg-green-100 { background-color: #DCFCE7 !important; }
            .border-b-2 { border-bottom: 2px solid #E5E7EB; }
            .border-b { border-bottom: 1px solid #F3F4F6; }
            .border-t { border-top: 1px solid #E5E7EB; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-6 { padding-top: 1.5rem; }
            .p-4 { padding: 1rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-full { border-radius: 9999px; }
            .w-full { width: 100%; }
            .w-64 { width: 16rem; }
            .whitespace-pre-line { white-space: pre-line; }
            table { border-collapse: collapse; width: 100%; }
            @page { 
              margin: 0.5in; 
              size: A4;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleBackToSales = () => {
    navigate('/sales');
  };

  if (!invoiceData) {
    return <div>Loading...</div>;
  }

  const renderProgressSteps = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step ? 'bg-[#03414C] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {currentStep > step ? <FaCheck size={16} /> : step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 ${currentStep > step ? 'bg-[#03414C]' : 'bg-gray-200'
                }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStepLabels = () => (
    <div className="flex justify-center mb-6">
      <div className="flex space-x-12 text-sm">
        <span className={currentStep >= 1 ? 'text-[#03414C] font-medium' : 'text-gray-500'}>
          Business Details
        </span>
        <span className={currentStep >= 2 ? 'text-[#03414C] font-medium' : 'text-gray-500'}>
          Product Details
        </span>
        <span className={currentStep >= 3 ? 'text-[#03414C] font-medium' : 'text-gray-500'}>
          Customer Details
        </span>
        <span className={currentStep >= 4 ? 'text-[#03414C] font-medium' : 'text-gray-500'}>
          Invoice Preview
        </span>
      </div>
    </div>
  );

  const renderBusinessDetailsStep = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={businessDetails.companyName}
            onChange={(e) => setBusinessDetails({ ...businessDetails, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter company name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={businessDetails.companyAddress}
            onChange={(e) => setBusinessDetails({ ...businessDetails, companyAddress: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter complete business address"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={businessDetails.companyPhone}
              onChange={(e) => setBusinessDetails({ ...businessDetails, companyPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={businessDetails.companyEmail}
              onChange={(e) => setBusinessDetails({ ...businessDetails, companyEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              value={businessDetails.companyWebsite}
              onChange={(e) => setBusinessDetails({ ...businessDetails, companyWebsite: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="Enter website URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID (Optional)
            </label>
            <input
              type="text"
              value={businessDetails.taxId}
              onChange={(e) => setBusinessDetails({ ...businessDetails, taxId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              placeholder="Enter tax ID"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <SpecialButton
          variant="primary"
          onClick={handleBusinessDetailsSubmit}
          className="px-6 py-2 bg-[#03414C] hover:bg-[#025561] text-white"
        >
          Next Step
        </SpecialButton>
      </div>
    </div>
  );

  const renderProductDetailsStep = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Details</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Product Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Unit Price</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
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
              <span className="text-red-600">-${invoiceData.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    // If called from button, trigger file input click
    if (!e || !('target' in e) || e.type === "click") {
      fileInputRef.current?.click();
      return;
    }
    // If called from file input change
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setBusinessFormData(prev => ({ ...prev, logoUrl: url }));
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
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Business Setup Required</h3>
            <p className="mt-1 text-sm text-blue-700">
              You need to create your business profile first before generating invoices. This
              information will be used on all your invoices.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Details</h2>

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
              setBusinessFormData({ ...businessFormData, businessName: e.target.value })
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
              setBusinessFormData({ ...businessFormData, contactNo: e.target.value })
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
              setBusinessFormData({ ...businessFormData, address: e.target.value })
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
              setBusinessFormData({ ...businessFormData, website: e.target.value })
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

            {logoUploading && <FiLoader className="animate-spin text-[#03414C] w-5 h-5" />}

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
            onClick={() => navigate('/sales/add-new-sale')}
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Details</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerDetails.name}
              onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
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
              onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
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
            onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
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
            onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            placeholder="Enter customer address"
          />
        </div>

        {/* <div className="border-t border-gray-200 pt-4 mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Company Information (Optional)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={customerDetails.companyName}
                onChange={(e) => setCustomerDetails({...customerDetails, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone
                </label>
                <input
                  type="tel"
                  value={customerDetails.companyPhone}
                  onChange={(e) => setCustomerDetails({...customerDetails, companyPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                  placeholder="Enter company phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
                </label>
                <input
                  type="email"
                  value={customerDetails.companyEmail}
                  onChange={(e) => setCustomerDetails({...customerDetails, companyEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                  placeholder="Enter company email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={customerDetails.companyWebsite}
                onChange={(e) => setCustomerDetails({...customerDetails, companyWebsite: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                placeholder="Enter company website"
              />
            </div>
          </div>
        </div> */}
      </div>

      <div className="flex justify-between mt-6">
        <SpecialButton
          variant="secondary"
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </SpecialButton>
        <SpecialButton
          variant="primary"
          onClick={handleCustomerDetailsNext}
          className="px-6 py-2 bg-[#03414C] hover:bg-[#025561] text-white"
          disabled={isCreatingSale}
        >
          {isCreatingSale ? 'Creating Sale & Invoice...' : 'Generate Invoice'}
        </SpecialButton>
      </div>
    </div>
  );

  const renderInvoicePreview = () => (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaCheck className="text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Invoice generated successfully!</span>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft size={16} />
          Back to Edit
        </button>
        <div className="flex gap-3">
          {/* <SpecialButton
            variant="secondary"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FaDownload size={16} />
            Download PDF
          </SpecialButton> */}
          <SpecialButton
            variant="secondary"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FaPrint size={16} />
            Print Invoice
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

      {/* Invoice Data Display */}
      {invoiceResponse && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Invoice Number:</span>
              <span className="ml-2 text-gray-900">{invoiceResponse.data?.invoiceNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-gray-900">{invoiceResponse.data?.status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Amount:</span>
              <span className="ml-2 text-gray-900">${invoiceResponse.data?.totalAmount}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment Method:</span>
              <span className="ml-2 text-gray-900">{invoiceResponse.data?.paymentMethod}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="ml-2 text-gray-900">{invoiceResponse.data?.customerName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-900">{new Date(invoiceResponse.data?.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      <div className="invoice-print bg-white border-2 border-blue-500 rounded-lg p-8 print:border-none print:shadow-none">
        {/* Header */}
        <div className="border-b-4 border-[#03414C] pb-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-[#03414C] tracking-wider">ACCURACK</h1>
              {/* <p className="text-lg text-gray-600 mt-2">Professional Invoice Solutions</p> */}
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
              <div className="bg-[#03414C] text-white px-4 py-2 rounded mt-2">
                <span className="text-sm font-medium">#{invoiceResponse?.data?.invoiceNumber || invoiceFields.invoiceNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Information Table */}
        <div className="mb-8">
          <table className="w-full border-2 border-[#03414C]">
            <thead>
              <tr className="bg-[#03414C] text-white">
                <th className="text-left py-4 px-6 text-sm font-bold border-r border-white">SHIP TO</th>
                <th className="text-left py-4 px-6 text-sm font-bold border-r border-white">SOLD TO</th>
                <th className="text-left py-4 px-6 text-sm font-bold">INVOICE DETAILS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-6 px-6 border-r-2 border-gray-300 align-top">
                  <div className="space-y-2">
                    <div className="font-bold text-gray-900 text-base">{customerDetails.name || 'Customer Name'}</div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">{customerDetails.address || 'Customer Address'}</div>
                    <div className="text-gray-700 font-medium">{customerDetails.phone || 'Phone Number'}</div>
                  </div>
                </td>
                <td className="py-6 px-6 border-r-2 border-gray-300 align-top">
                  <div className="space-y-2">
                    <div className="font-bold text-gray-900 text-base">{customerDetails.companyName || customerDetails.name || 'Company Name'}</div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">{customerDetails.address || 'Billing Address'}</div>
                    <div className="text-gray-700">{customerDetails.email || 'Email Address'}</div>
                  </div>
                </td>
                <td className="py-6 px-6 align-top">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-semibold text-gray-700">Customer No:</span>
                      <span className="font-bold text-gray-900">{invoiceResponse?.data?.customer?.id?.slice(-8) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-semibold text-gray-700">Invoice Date:</span>
                      <span className="font-bold text-gray-900">{invoiceResponse?.data?.createdAt ? new Date(invoiceResponse.data.createdAt).toLocaleDateString() : new Date(invoiceFields.invoiceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-semibold text-gray-700">Delivery Date:</span>
                      <div className="flex items-center">
                        <input
                          type="date"
                          value={invoiceFields.deliveryDate}
                          onChange={(e) => setInvoiceFields({...invoiceFields, deliveryDate: e.target.value})}
                          className="border-b border-gray-300 focus:border-[#03414C] outline-none bg-transparent text-right font-bold text-gray-900 print:border-none"
                        />
                      </div>
                    </div>
                    {/* <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Payment Terms:</span>
                      <span className="font-bold text-[#03414C]">{invoiceResponse?.data?.paymentMethod || 'CASH'}</span>
                    </div> */}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>



        {/* Products Table */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#03414C] mb-4 border-b-2 border-[#03414C] pb-2">ITEMS & SERVICES</h3>
          <table className="w-full border-2 border-[#03414C]">
            <thead>
              <tr className="bg-[#03414C] text-white">
                <th className="text-left py-3 px-4 text-sm font-bold border-r border-white">PLU/UPC</th>
                <th className="text-left py-3 px-4 text-sm font-bold border-r border-white">DESCRIPTION</th>
                <th className="text-center py-3 px-4 text-sm font-bold border-r border-white">QTY</th>
                <th className="text-center py-3 px-4 text-sm font-bold border-r border-white">UNIT</th>
                <th className="text-center py-3 px-4 text-sm font-bold border-r border-white">PACK</th>
                <th className="text-right py-3 px-4 text-sm font-bold">UNIT PRICE</th>
              </tr>
            </thead>
            <tbody>
              {(invoiceResponse?.data?.sale?.saleItems || invoiceData.products).map((item: any, index: number) => (
                <tr key={item.id || index} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-300 font-mono">{item.pluUpc || item.plu || item.sku || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-300 font-medium">{item.productName || item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-center border-r border-gray-300 font-bold">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center border-r border-gray-300">EA</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center border-r border-gray-300">1</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-bold">${(item.sellingPrice || item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Thank you message and terms */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#03414C]">
              <h4 className="text-lg font-bold text-[#03414C] mb-2">Thank You!</h4>
              <p className="text-gray-700 leading-relaxed">We appreciate your business and look forward to serving you again.</p>
            </div>
            {/* <div className="text-sm text-gray-600">
              <p className="font-semibold mb-1">Payment Terms:</p>
              <p>Payment is due upon receipt of this invoice.</p>
              <p className="mt-2">For questions about this invoice, please contact us.</p>
            </div> */}
          </div>
          
          {/* Totals */}
          <div>
            <div className="border-2 border-[#03414C] rounded-lg overflow-hidden">
              <div className="bg-[#03414C] text-white p-3">
                <h4 className="font-bold text-center">INVOICE SUMMARY</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">Subtotal:</span>
                  <span className="font-bold text-lg">${(invoiceResponse?.data?.totalAmount - invoiceResponse?.data?.tax || invoiceData.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">Tax:</span>
                  <span className="font-bold text-lg">${(invoiceResponse?.data?.tax || invoiceData.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-[#03414C] pb-3">
                  <span className="font-bold text-[#03414C] text-lg">TOTAL DUE:</span>
                  <span className="font-bold text-2xl text-[#03414C]">${(invoiceResponse?.data?.totalAmount || invoiceData.finalTotal).toFixed(2)}</span>
                </div>
                <div className="text-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">PAID</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Footer
        <div className="border-t-2 border-[#03414C] pt-6 text-center">
          <div className="text-[#03414C] font-bold text-lg mb-2">ACCURACK - Professional Invoice Solutions</div>
          <div className="text-gray-600 text-sm">
            <p>This invoice was generated electronically and is valid without signature.</p>
          </div>
        </div>
         */}


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
                  <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                  <p className="text-gray-600">Generate professional invoice</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {renderProgressSteps()}
            {renderStepLabels()}
          </div>
        )}

        {/* Step Content */}
        {showBusinessForm ? renderBusinessForm() : (
          <>
            {currentStep === 1 && renderBusinessDetailsStep()}
            {currentStep === 2 && renderProductDetailsStep()}
            {currentStep === 3 && renderCustomerDetailsStep()}
            {currentStep === 4 && renderInvoicePreview()}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateInvoice;