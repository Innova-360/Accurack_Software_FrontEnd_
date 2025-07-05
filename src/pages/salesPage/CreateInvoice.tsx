import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaArrowLeft, FaCheck, FaDownload, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import { SpecialButton } from '../../components/buttons';
import { createSale } from '../../store/slices/salesSlice';
import type { RootState, AppDispatch } from '../../store';
import type { SaleRequestData, SaleItem } from '../../store/slices/salesSlice';
import useRequireStore from '../../hooks/useRequireStore';
import apiClient from '../../services/api';

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
  const dispatch = useDispatch<AppDispatch>();
  const currentStore = useRequireStore();
  const { user } = useSelector((state: RootState) => state.user);
  const { loading: salesLoading } = useSelector((state: RootState) => state.sales);
  
  const invoiceData = location.state?.invoiceData as InvoiceData;
  console.log('Invoice Data:', invoiceData);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

    // First create the sale, then generate invoice
    await handleCreateSaleAndInvoice();
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
      toast.success('Sale created successfully!');

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
          },
          {
            name: "Invoice Type",
            value: "Sale Invoice"
          },
          {
            name: "Due Date",
            value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ]
      };

      // Call invoice generation API
      try {
        const response = await apiClient.post('/invoice', invoicePayload);
        console.log('Invoice generated:', response.data);
        toast.success('Invoice generated successfully!');
      } catch (invoiceError: any) {
        console.error('Error generating invoice:', invoiceError);
        toast.error(`Invoice generation failed: ${invoiceError.response?.data?.message || invoiceError.message}`);
      }

      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast.error(`Failed to create sale: ${error.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsCreatingSale(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    console.log('Downloading PDF...');
  };

  const handlePrint = () => {
    // Add print styles
    const printStyles = `
      @media print {
        body * {
          visibility: hidden;
        }
        .invoice-print, .invoice-print * {
          visibility: visible;
        }
        .invoice-print {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:bg-white {
          background-color: white !important;
        }
        .print\\:border-none {
          border: none !important;
        }
        .print\\:shadow-none {
          box-shadow: none !important;
        }
        .print\\:px-0 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .print\\:py-0 {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
      }
    `;
    
    // Add print styles to head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);
    
    // Print
    window.print();
    
    // Remove print styles after printing
    document.head.removeChild(styleElement);
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
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= step ? 'bg-[#03414C] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step ? <FaCheck size={16} /> : step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 ${
                currentStep > step ? 'bg-[#03414C]' : 'bg-gray-200'
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
            onChange={(e) => setBusinessDetails({...businessDetails, companyName: e.target.value})}
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
            onChange={(e) => setBusinessDetails({...businessDetails, companyAddress: e.target.value})}
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
              onChange={(e) => setBusinessDetails({...businessDetails, companyPhone: e.target.value})}
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
              onChange={(e) => setBusinessDetails({...businessDetails, companyEmail: e.target.value})}
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
              onChange={(e) => setBusinessDetails({...businessDetails, companyWebsite: e.target.value})}
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
              onChange={(e) => setBusinessDetails({...businessDetails, taxId: e.target.value})}
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
              onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
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
              onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
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
            onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
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
            onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
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
          <SpecialButton
            variant="secondary"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FaDownload size={16} />
            Download PDF
          </SpecialButton>
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

      {/* Invoice Preview */}
      <div className="invoice-print bg-white border-2 border-blue-500 rounded-lg p-8 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
            <p className="text-gray-600">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Thank you for your business!
            </p>
          </div>
        </div>

        {/* Business and Customer Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* From (Business) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">From:</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-gray-900">{businessDetails.companyName}</p>
              <p className="text-gray-600 whitespace-pre-line">{businessDetails.companyAddress}</p>
              <p className="text-gray-600">{businessDetails.companyPhone}</p>
              <p className="text-gray-600">{businessDetails.companyEmail}</p>
              {businessDetails.companyWebsite && (
                <p className="text-gray-600">{businessDetails.companyWebsite}</p>
              )}
              {businessDetails.taxId && (
                <p className="text-gray-600">Tax ID: {businessDetails.taxId}</p>
              )}
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Bill to:</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-gray-900">{customerDetails.name}</p>
              {customerDetails.companyName && (
                <p className="text-gray-600">{customerDetails.companyName}</p>
              )}
              <p className="text-gray-600 whitespace-pre-line">{customerDetails.address}</p>
              <p className="text-gray-600">{customerDetails.phone}</p>
              {customerDetails.email && (
                <p className="text-gray-600">{customerDetails.email}</p>
              )}
              {customerDetails.companyPhone && customerDetails.companyPhone !== customerDetails.phone && (
                <p className="text-gray-600">Company: {customerDetails.companyPhone}</p>
              )}
              {customerDetails.companyEmail && (
                <p className="text-gray-600">{customerDetails.companyEmail}</p>
              )}
              {customerDetails.companyWebsite && (
                <p className="text-gray-600">{customerDetails.companyWebsite}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-sm text-gray-600">
              Same as billing address
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">
              Invoice sent on: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Payment Method: {invoiceData.paymentMethod}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Product Name</th>
                <th className="text-center py-3 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Unit Price</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Tax %</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{product.name}</td>
                  <td className="py-3 text-sm text-gray-600 text-center">{product.quantity}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">${product.price.toFixed(2)}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{invoiceData.taxRate}%</td>
                  <td className="py-3 text-sm text-gray-900 text-right font-medium">${product.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Tax ({invoiceData.taxRate}%)</span>
                <span className="text-sm font-medium">${invoiceData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Discount ({invoiceData.discountType === 'percentage' ? `${invoiceData.discount}%` : '$' + invoiceData.discount.toFixed(2)})</span>
                <span className="text-sm font-medium text-red-600">-${invoiceData.discountAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">${invoiceData.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-green-800">Payment Method</span>
                <p className="text-sm text-green-600 mt-1">{invoiceData.paymentMethod}</p>
              </div>
              <div className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
                PAID
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
            <p className="text-sm text-gray-600">{invoiceData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          <p>Thank you for choosing {businessDetails.companyName}!</p>
          <p className="mt-1">Questions about your invoice? Contact us at {businessDetails.companyEmail}</p>
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
        {currentStep === 1 && renderBusinessDetailsStep()}
        {currentStep === 2 && renderProductDetailsStep()}
        {currentStep === 3 && renderCustomerDetailsStep()}
        {currentStep === 4 && renderInvoicePreview()}
      </div>
    </div>
  );
};

export default CreateInvoice;