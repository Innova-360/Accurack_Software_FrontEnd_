import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchInvoiceById } from '../../store/slices/invoiceSlice';
import Header from '../../components/Header';
import { 
  FaArrowLeft, 
  FaEye, 
  FaUser, 
  FaPhone, 
  FaDollarSign,
  FaFileInvoice,
  FaQrcode,
  FaBarcode,
  FaCopy
} from 'react-icons/fa';
import { Building2, Package, Receipt, Truck, User, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
// import { SpecialButton } from '../../components/buttons';

const InvoiceId: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedInvoice, loading, error } = useAppSelector((state) => state.invoices);

  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceById({ invoiceId }));
    }
  }, [dispatch, invoiceId]);

  const handleBack = () => {
    navigate(-1);
  };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = () => {
//     // TODO: Implement PDF download functionality
//     toast('Download functionality coming soon!', { icon: 'ℹ️' });
//   };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Loading label="Invoice"/>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error loading invoice</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!selectedInvoice) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-600 text-xl mb-4">Invoice not found</div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const invoice = selectedInvoice;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:px-0 print:py-0">
        {/* Action Header - Hidden in print */}
        <div className="print:hidden mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-gray-600" size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
                <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* <SpecialButton
              variant='primary'
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPrint size={16} />
                Print
              </SpecialButton> */}
              {/* <SpecialButton
              variant='secondary'
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload size={16} />
                Download
              </SpecialButton> */}
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 print:shadow-none print:border-none">
          {/* Invoice Header */}
          <div className="border-b border-gray-200 p-6 print:border-b print:border-gray-300">
            <div className="flex justify-between items-start">
              {/* Business Info */}
              <div className="flex items-start gap-4">
                {invoice.logoUrl && (
                  <img
                    src={invoice.logoUrl}
                    alt="Business Logo"
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{invoice.businessName}</h2>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{invoice.businessAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone size={12} />
                      <span>{invoice.businessContact}</span>
                      <button
                        onClick={() => copyToClipboard(invoice.businessContact, 'Phone number')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaCopy size={10} />
                      </button>
                    </div>
                    {invoice.businessWebsite && (
                      <div className="flex items-center gap-2">
                        <FaEye size={12} />
                        <a 
                          href={invoice.businessWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {invoice.businessWebsite}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Status & Details */}
              <div className="text-right">
                <div className="mb-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <FaFileInvoice className="text-gray-400" size={14} />
                    <span className="font-medium">Invoice #:</span>
                    <span>{invoice.invoiceNumber}</span>
                    <button
                      onClick={() => copyToClipboard(invoice.invoiceNumber, 'Invoice number')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaCopy size={10} />
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium">Created:</span>
                    <span>{formatDate(invoice.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="font-medium">Cashier:</span>
                    <span>{invoice.cashierName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-200">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Customer Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2">{invoice.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-400" size={14} />
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2">{invoice.customerPhone}</span>
                  <button
                    onClick={() => copyToClipboard(invoice.customerPhone, 'Customer phone')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaCopy size={10} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-gray-400" size={14} />
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2">{invoice.customerMail}</span>
                  <button
                    onClick={() => copyToClipboard(invoice.customerMail, 'Customer email')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaCopy size={10} />
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-gray-400 mt-1" size={14} />
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <p className="ml-2 text-sm">{invoice.customerAddress}</p>
                  </div>
                </div>
                {invoice.shippingAddress && invoice.shippingAddress !== invoice.customerAddress && (
                  <div className="flex items-start gap-2">
                    <Truck className="text-gray-400 mt-1" size={14} />
                    <div>
                      <span className="font-medium text-gray-700">Shipping Address:</span>
                      <p className="ml-2 text-sm">{invoice.shippingAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaDollarSign className="text-green-600" />
                Payment Summary
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-gray-400" size={14} />
                  <span className="font-medium text-gray-700">Payment Method:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {invoice.paymentMethod}
                  </span>
                </div>
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Amount:</span>
                    <span>{formatCurrency(invoice.netAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span className="text-green-600">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {invoice.qrCode && (
                <div className="text-center">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center justify-center gap-2">
                    <FaQrcode className="text-gray-400" />
                    QR Code
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={invoice.qrCode} 
                      alt="Invoice QR Code" 
                      className="w-24 h-24 border border-gray-200 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sale Items */}
          {invoice.sale?.saleItems && invoice.sale.saleItems.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-purple-600" />
                Items Purchased
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">PLU/UPC</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.sale.saleItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            {item.product?.name && item.product.name !== item.productName && (
                              <div className="text-sm text-gray-500">{item.product.name}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FaBarcode className="text-gray-400" size={14} />
                            <span className="font-mono text-sm">{item.pluUpc}</span>
                            <button
                              onClick={() => copyToClipboard(item.pluUpc, 'PLU/UPC')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaCopy size={10} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.sellingPrice)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {invoice.customFields && invoice.customFields.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="text-indigo-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice.customFields.map((field) => (
                  <div key={field.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-700">{field.fieldName}:</div>
                    <div className="text-gray-900 mt-1">{field.fieldValue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sale Information */}
          {invoice.sale && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="text-orange-600" />
                Sale Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Sale ID:</span>
                  <div className="font-mono text-xs mt-1 break-all">{invoice.sale.id}</div>
                  <button
                    onClick={() => copyToClipboard(invoice.sale.id, 'Sale ID')}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Source:</span>
                  <div className="mt-1 capitalize">{invoice.sale.source}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Confirmation:</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      invoice.sale.confirmation === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.sale.confirmation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceId;