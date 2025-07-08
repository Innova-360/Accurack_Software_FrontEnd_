import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Building2,
    User2,
    ShoppingCart,
    Calendar,
    CreditCard,
    Package,
    CheckCircle,
    Clock,
    XCircle,
    ChevronRight
} from "lucide-react";
import Header from "../../components/Header";
import { fetchSaleById } from "../../store/slices/salesSlice";
import type { RootState, AppDispatch } from "../../store";

const SalesDetails: React.FC = () => {
    const { saleid } = useParams<{ saleid: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentSale, loading, error } = useSelector((state: RootState) => state.sales);
    const navigate = useNavigate();

    useEffect(() => {
        if (saleid) {
            dispatch(fetchSaleById(saleid));
        }
    }, [dispatch, saleid]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57]"></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!currentSale) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center py-12">
                            <p className="text-gray-500">Sale not found</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
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



    return (
        <div className="printable-receipt">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0.5in;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    .print-hidden {
                        display: none !important;
                    }
                    
                    .print-container {
                        font-size: 12px !important;
                        line-height: 1.4 !important;
                        color: #333 !important;
                    }
                    
                    .print-title {
                        font-size: 20px !important;
                        margin-bottom: 10px !important;
                        color: #2c3e50 !important;
                        font-weight: 600 !important;
                    }
                    
                    .print-card {
                        background: #fafafa !important;
                        border: none !important;
                        border-radius: 8px !important;
                        box-shadow: none !important;
                        margin-bottom: 15px !important;
                        padding: 16px !important;
                    }
                    
                    .print-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr 1fr !important;
                        gap: 15px !important;
                        margin-bottom: 15px !important;
                    }
                    
                    .print-table {
                        font-size: 11px !important;
                        margin-bottom: 15px !important;
                        border-collapse: collapse !important;
                    }
                    
                    .print-table th,
                    .print-table td {
                        padding: 8px 10px !important;
                        border: none !important;
                        border-bottom: 1px solid #e0e0e0 !important;
                    }
                    
                    .print-table th {
                        background: #f8f9fa !important;
                        font-weight: 600 !important;
                        color: #495057 !important;
                    }
                    
                    .print-table tbody tr:nth-child(even) {
                        background: #f8f9fa !important;
                    }
                    
                    .print-summary {
                        font-size: 12px !important;
                        padding: 16px !important;
                        margin-bottom: 15px !important;
                        background: #f8f9fa !important;
                        border-radius: 8px !important;
                    }
                    
                    .print-total {
                        font-size: 16px !important;
                        font-weight: 600 !important;
                        border-top: 2px solid #dee2e6 !important;
                        padding-top: 12px !important;
                        margin-top: 12px !important;
                        color: #2c3e50 !important;
                    }
                    
                    .print-status {
                        background: #e3f2fd !important;
                        color: #1976d2 !important;
                        border: 1px solid #bbdefb !important;
                        padding: 4px 12px !important;
                        border-radius: 20px !important;
                        font-size: 11px !important;
                    }
                    
                    .print-compact {
                        margin-bottom: 12px !important;
                    }
                    
                    .print-row {
                        display: flex !important;
                        justify-content: space-between !important;
                        padding: 4px 0 !important;
                        border-bottom: 1px dotted #dee2e6 !important;
                    }
                    
                    .print-section-title {
                        font-size: 14px !important;
                        font-weight: 600 !important;
                        color: #495057 !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .print-text-primary {
                        color: #2c3e50 !important;
                    }
                    
                    .print-text-secondary {
                        color: #6c757d !important;
                    }
                    
                    .print-text-success {
                        color: #28a745 !important;
                    }
                    
                    .print-bg-light {
                        background: #f8f9fa !important;
                    }
                }
            `}</style>
            <Header className="print-hidden"/>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 print:p-2 print:min-h-0 print:bg-white print-container">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 print:mb-4">
                        <nav className="flex gap-x-2 mb-6 items-center text-sm text-gray-500 print-hidden">
                            <span className="hover:text-[#0f4d57] transition-colors">Sales Orders</span>
                            <ChevronRight size={16} className="text-gray-400 cursor-pointer" />
                            <span className="text-[#0f4d57] font-medium">Order #{currentSale.id.slice(-8).toUpperCase()}</span>
                        </nav>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 print-card print:mb-2">
                            <div className="flex justify-between items-start print:items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 print-title print:text-primary">
                                        <button
                                            onClick={() => (navigate(-1))}
                                            className="text-gray-600 hover:text-[#0f4d57] print-hidden cursor-pointer"
                                        >
                                            <svg
                                                className="w-5 h-5 sm:w-6 sm:h-6 transform"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 19l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>
                                        Order Details
                                    </h1>
                                    <p className="text-gray-600 text-lg print:text-sm print:print-text-secondary">Order #{currentSale.id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(currentSale.status || 'pending')} print-status`}>
                                    {getStatusIcon(currentSale.status || 'pending')}
                                    {(currentSale.status || 'PENDING').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Top Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print-grid print:mb-4">
                        {/* Cashier Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow print-card print-compact">
                            <div className="flex items-center mb-4 print:mb-2">
                                <div className="p-2 bg-[#0f4d57]/10 rounded-lg mr-3 print:hidden">
                                    <Building2 className="h-6 w-6 text-[#0f4d57]" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 print:text-sm print:print-text-primary print-section-title">Cashier Details</h3>
                            </div>
                            <div className="space-y-3 print:space-y-1">
                                <div>
                                    <p className="text-xl font-bold text-gray-900 mb-1 print:text-sm print:print-text-primary print:mb-0">
                                        {currentSale.user.firstName} {currentSale.user.lastName}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm print:space-y-1 print:text-xs">
                                    <div className="flex justify-between print-row">
                                        <span className="text-gray-600 print:print-text-secondary">Cashier:</span>
                                        <span className="font-medium text-gray-900 print:print-text-primary">{currentSale.cashierName}</span>
                                    </div>
                                    <div className="flex justify-between print-row">
                                        <span className="text-gray-600 print:print-text-secondary">User ID:</span>
                                        <span className="font-mono text-gray-900 print:print-text-primary print-highlight">{currentSale.userId.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between print-row">
                                        <span className="text-gray-600 print:print-text-secondary">Source:</span>
                                        <span className="font-medium text-gray-900 print:print-text-primary">{currentSale.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow print-card print-compact">
                            <div className="flex items-center mb-4 print:mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg mr-3 print:hidden">
                                    <User2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 print:text-sm print:print-text-primary print-section-title">Customer Details</h3>
                            </div>
                            <div className="space-y-3 print:space-y-1">
                                <div>
                                    <p className="text-xl font-bold text-gray-900 mb-1 print:text-sm print:print-text-primary print:mb-0">
                                        {currentSale.customer.customerName}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 print:space-y-1 print:text-xs print:print-text-secondary">
                                    <p className="leading-relaxed">{currentSale.customer.customerAddress}</p>
                                    <p className="font-medium print:print-text-primary">{currentSale.customer.phoneNumber}</p>
                                    <p className="text-blue-600 print:print-text-primary">{currentSale.customer.customerMail}</p>
                                    {currentSale.customer.telephoneNumber && (
                                        <p>Tel: {currentSale.customer.telephoneNumber}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sale Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow print-card print-compact">
                            <div className="flex items-center mb-4 print:mb-2">
                                <div className="p-2 bg-green-50 rounded-lg mr-3 print:hidden">
                                    <ShoppingCart className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 print:text-sm print:print-text-primary print-section-title">Sale Summary</h3>
                            </div>
                            <div className="space-y-3 print:space-y-1">
                                <div className="grid grid-cols-2 gap-3 text-sm print:gap-2 print:text-xs">
                                    <div className="flex items-center gap-2 print:gap-1">
                                        <Calendar className="h-4 w-4 text-gray-400 print:hidden" />
                                        <div>
                                            <p className="text-gray-600 print:print-text-secondary">Date</p>
                                            <p className="font-medium text-gray-900 print:print-text-primary">{formatDate(currentSale.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 print:gap-1">
                                        <CreditCard className="h-4 w-4 text-gray-400 print:hidden" />
                                        <div>
                                            <p className="text-gray-600 print:print-text-secondary">Payment</p>
                                            <p className="font-medium text-gray-900 print:print-text-primary print-highlight">{currentSale.paymentMethod}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 print:gap-1">
                                        <Package className="h-4 w-4 text-gray-400 print:hidden" />
                                        <div>
                                            <p className="text-gray-600 print:print-text-secondary">Qty Sent</p>
                                            <p className="font-medium text-gray-900 print:print-text-primary">{currentSale.quantitySend}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 print:gap-1">
                                        <CheckCircle className="h-4 w-4 text-gray-400 print:hidden" />
                                        <div>
                                            <p className="text-gray-600 print:print-text-secondary">Confirmation</p>
                                            <p className="font-medium text-gray-900 print:print-text-primary">{currentSale.confirmation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 print-card print:mb-4">
                        <div className="p-6 border-b border-gray-200 print:p-2 print:border-b-0">
                            <div className="flex items-center gap-3 print:gap-1">
                                <div className="p-2 bg-purple-50 rounded-lg print:hidden">
                                    <Package className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 print:text-sm print:print-text-primary print-section-title">Sale Items</h3>
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium print:bg-transparent print:print-text-secondary print:px-1 print:text-xs">
                                    ({currentSale.saleItems.length} items)
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full print-table">
                                <thead className="bg-gray-50 print:print-bg-light">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900 print:print-text-primary print:text-xs">Product</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900 print:print-text-primary print:text-xs">PLU/UPC</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900 print:print-text-primary print:text-xs">Category</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-900 print:print-text-primary print:text-xs">Qty</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-900 print:print-text-primary print:text-xs">Unit Price</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-900 print:print-text-primary print:text-xs">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentSale.saleItems.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                                            <td className="py-4 px-6 print:text-xs">
                                                <div className="font-medium text-gray-900 print:print-text-primary">{item.productName}</div>
                                            </td>
                                            <td className="py-4 px-6 print:text-xs">
                                                <span className="font-mono text-sm text-gray-600 print:print-text-secondary print-highlight">{item.pluUpc}</span>
                                            </td>
                                            <td className="py-4 px-6 print:text-xs">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full print:bg-transparent print:print-text-secondary print:px-0">
                                                    {item.product?.category?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center print:text-xs">
                                                <span className="font-semibold text-gray-900 print:print-text-primary">{item.quantity}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-gray-900 print:print-text-primary print:text-xs">
                                                ${item.sellingPrice.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-[#0f4d57] print:print-text-primary print:text-xs">
                                                ${item.totalPrice.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 print-card print-summary print:mb-4">
                        <div className="space-y-4 print:space-y-2">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1 print:border-b print:border-gray-300 print-row">
                                <span className="text-gray-600 print:print-text-secondary">Subtotal</span>
                                <span className="font-medium text-gray-900 print:print-text-primary">${(currentSale.totalAmount - currentSale.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1 print:border-b print:border-gray-300 print-row">
                                <span className="text-gray-600 print:print-text-secondary">Tax</span>
                                <span className="font-medium text-gray-900 print:print-text-primary">${currentSale.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1 print:border-b print:border-gray-300 print-row">
                                <span className="text-gray-600 print:print-text-secondary">Allowance</span>
                                <span className="font-semibold text-green-600 print:print-text-success">-${((currentSale as any).allowance || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 print:py-1 print:border-b print:border-gray-300 print-row">
                                <span className="text-gray-600 print:print-text-secondary">Generate Invoice</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentSale.generateInvoice
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    } print:bg-transparent print:print-text-secondary print:px-0`}>
                                    {currentSale.generateInvoice ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="pt-4 print:pt-2 print-total">
                                <div className="flex justify-between items-center print-row">
                                    <span className="text-lg font-semibold text-gray-900 print:print-text-primary">Total Amount</span>
                                    <span className="text-2xl font-bold text-[#0f4d57] print:print-text-primary">${currentSale.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            {currentSale.generateInvoice && (
                                <div className="mt-6 flex gap-3 print-hidden">
                                    <button className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                        Preview Invoice
                                    </button>
                                    <button className="flex-1 px-4 py-2 text-sm bg-[#0f4d57] text-white rounded-lg hover:bg-[#0f4d57]/90 transition-colors">
                                        Generate Invoice
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 print-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSale.status || 'pending')}`}>
                                        {getStatusIcon(currentSale.status || 'pending')}
                                        {(currentSale.status || 'PENDING').toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Last updated: {formatDate(currentSale.updatedAt)}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Print Receipt
                                </button>
                                {/* {currentSale.status === 'COMPLETED' && (
                                    <button className="px-6 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                        Process Return
                                    </button>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default SalesDetails;
