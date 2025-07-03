import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Building2,
    User2,
    ShoppingCart,
    FileText,
    Calendar,
    CreditCard,
    Package,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import Header from "../../components/Header";
import { fetchSaleById } from "../../store/slices/salesSlice";
import type { RootState, AppDispatch } from "../../store";

const SalesDetails: React.FC = () => {
    const { saleid } = useParams<{ saleid: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentSale, loading, error } = useSelector((state: RootState) => state.sales);

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
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <nav className="flex gap-x-2 mb-6 items-center text-sm text-gray-500">
                            <span className="hover:text-[#0f4d57] cursor-pointer transition-colors">Sales Orders</span>
                            <ChevronRight size={16} className="text-gray-400" />
                            <span className="text-[#0f4d57] font-medium">Order #{currentSale.id.slice(-8).toUpperCase()}</span>
                        </nav>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Order Details
                                    </h1>
                                    <p className="text-gray-600 text-lg">Order #{currentSale.id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(currentSale.status)}`}>
                                    {getStatusIcon(currentSale.status)}
                                    {currentSale.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Top Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Cashier Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-[#0f4d57]/10 rounded-lg mr-3">
                                    <Building2 className="h-6 w-6 text-[#0f4d57]" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Cashier Details</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xl font-bold text-gray-900 mb-1">
                                        {currentSale.user.firstName} {currentSale.user.lastName}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cashier:</span>
                                        <span className="font-medium text-gray-900">{currentSale.cashierName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">User ID:</span>
                                        <span className="font-mono text-gray-900">{currentSale.userId.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Source:</span>
                                        <span className="font-medium text-gray-900">{currentSale.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                    <User2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xl font-bold text-gray-900 mb-1">
                                        {currentSale.customer.customerName}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="leading-relaxed">{currentSale.customer.customerAddress}</p>
                                    <p className="font-medium">{currentSale.customer.phoneNumber}</p>
                                    <p className="text-blue-600">{currentSale.customer.customerMail}</p>
                                    {currentSale.customer.telephoneNumber && (
                                        <p>Tel: {currentSale.customer.telephoneNumber}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sale Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-green-50 rounded-lg mr-3">
                                    <ShoppingCart className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Sale Summary</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-600">Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(currentSale.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-600">Payment</p>
                                            <p className="font-medium text-gray-900">{currentSale.paymentMethod}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-600">Qty Sent</p>
                                            <p className="font-medium text-gray-900">{currentSale.quantitySend}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-600">Confirmation</p>
                                            <p className="font-medium text-gray-900">{currentSale.confirmation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Package className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Sale Items</h3>
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                                    {currentSale.saleItems.length} items
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900">PLU/UPC</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-900">Qty</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-900">Unit Price</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-900">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentSale.saleItems.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{item.productName}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-sm text-gray-600">{item.pluUpc}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {item.product?.category?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-semibold text-gray-900">{item.quantity}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-gray-900">
                                                ${item.sellingPrice.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-[#0f4d57]">
                                                ${item.totalPrice.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Additional Information & Financial Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Additional Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-orange-50 rounded-lg mr-3">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Allowance</span>
                                    <span className="font-semibold text-green-600">${currentSale.allowance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Generate Invoice</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        currentSale.generateInvoice 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {currentSale.generateInvoice ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Store ID</span>
                                    <span className="font-mono text-sm text-gray-900">{currentSale.storeId.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-600">Client ID</span>
                                    <span className="font-mono text-sm text-gray-900">{currentSale.clientId.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-green-50 rounded-lg mr-3">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">${(currentSale.totalAmount - currentSale.tax).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium text-gray-900">${currentSale.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-green-600">Allowance</span>
                                    <span className="font-medium text-green-600">-${currentSale.allowance.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-[#0f4d57]">${currentSale.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            {currentSale.generateInvoice && (
                                <div className="mt-6 flex gap-3">
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSale.status)}`}>
                                        {getStatusIcon(currentSale.status)}
                                        {currentSale.status.toUpperCase()}
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
                                {currentSale.status === 'COMPLETED' && (
                                    <button className="px-6 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                        Process Return
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
};

export default SalesDetails;
