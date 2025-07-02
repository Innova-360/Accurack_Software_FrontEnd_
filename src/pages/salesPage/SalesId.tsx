import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Building2,
    User2,
    ShoppingCart,
    FileText,
    ArrowLeft,
    ChevronRight
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
            case 'completed': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'cancelled': return 'text-red-600';
            default: return 'text-gray-600';
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
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="">
                        <p className="flex gap-x-2 mb-4 items-center text-[#6B7280]">
                            Sales Orders <span> <ChevronRight size={20} /> </span>
                            <span className="text-black">Order #{currentSale.id.slice(-8).toUpperCase()}</span>
                        </p>

                        <div className="mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        Order details
                                    </h2>
                                    <p className="text-gray-600">Manage and process order #{currentSale.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div>
                                <span className={`ml-3 text-sm ${getStatusColor(currentSale.status)}`}>
                                    ● {currentSale.status}
                                </span>
                            </div>
                        </div>
                    </div>


                    {/* Top Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Cashier Details */}
                        <div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex items-center mb-3 gap-x-3">
                                <Building2 className="h-6 w-6 mr-2 text-gray-500" color={"#03414CF0"} />
                                <h4 className=" text-black font-semibold  text-lg">Cashier Details</h4>
                            </div>
                            <p className=" text-black font-semibold text-lg mb-3">{currentSale.user.firstName} {currentSale.user.lastName}</p>
                            <p className="text-md font-normal ">Cashier: {currentSale.cashierName}</p>
                            <p className="text-md font-normal">User ID: {currentSale.userId.slice(-8).toUpperCase()}</p>
                            <p className="text-md font-normal">Source: {currentSale.source}</p>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex items-center mb-3 gap-x-3">
                                <User2 className="h-6 w-6 mr-2 text-gray-500" color={"#03414CF0"} />
                                <h4 className=" text-black font-semibold  text-lg ">Customer Details</h4>
                            </div>
                            <p className="text-black font-semibold  text-lg mb-3">{currentSale.customer.customerName}</p>
                            <p className="text-md font-normal ">{currentSale.customer.customerAddress}</p>
                            <p className="text-md font-normal ">{currentSale.customer.phoneNumber}</p>
                            <p className="text-md font-normal ">{currentSale.customer.customerMail}</p>
                            {currentSale.customer.telephoneNumber && (
                                <p className="text-md font-normal ">Tel: {currentSale.customer.telephoneNumber}</p>
                            )}
                        </div>

                        {/* Sale Summary */}
                        <div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex items-center mb-3 gap-x-3">
                                <ShoppingCart className="h-6 w-6 mr-2 text-gray-500" color={"#03414CF0"} />
                                <h4 className=" text-black font-semibold  text-lg">Sale Summary</h4>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-md font-normal ">Sale ID:</p>
                                <p className="text-md font-normal ">{currentSale.id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-md font-normal ">Date: </p>
                                <p className="text-md font-normal ">{formatDate(currentSale.createdAt)}</p>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-md font-normal ">Payment:</p>
                                <p className="text-md font-normal ">{currentSale.paymentMethod}</p>

                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-md font-normal ">Confirmation:</p>
                                <p className="text-md font-normal ">{currentSale.confirmation}</p>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-md font-normal ">Quantity Sent:</p>
                                <p className="text-md font-normal ">{currentSale.quantitySend}</p>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white p-4 rounded-xl shadow mb-6">
                        <h4 className=" text-black font-semibold  text-lg mb-4">Sale Items</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-gray-500 border-b mb-3">
                                        <th className="text-black font-semibold text-md pb-3">Product</th>
                                        <th className="text-black font-semibold text-md pb-3">PLU/UPC</th>
                                        <th className="text-black font-semibold text-md pb-3">Category</th>
                                        <th className="text-black font-semibold text-md pb-3">Qty</th>
                                        <th className="text-black font-semibold text-md pb-3">Unit Price</th>
                                        <th className="text-black font-semibold text-md pb-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSale.saleItems.map((item, i) => (
                                        <tr key={i} className="border-b ">
                                            <td className="text-md font-normal py-2">{item.productName}</td>
                                            <td className="text-md font-normal py-2">{item.pluUpc}</td>
                                            <td className="text-md font-normal py-2">{item.product?.category?.name || 'N/A'}</td>
                                            <td className="text-md font-normal py-2">{item.quantity}</td>
                                            <td className="text-md font-normal py-2">${item.sellingPrice.toFixed(2)}</td>
                                            <td className="text-md font-normal py-2">${item.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white p-4 rounded-xl shadow mb-6">
                        <div className="flex items-center mb-4">
                            <FileText className="h-5 w-5 mr-2 text-gray-500" />
                            <h4 className=" text-black font-semibold  text-lg ">Additional Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Allowance</label>
                                <p className="mt-1 text-sm text-gray-600">${currentSale.allowance.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Generate Invoice</label>
                                <p className="mt-1 text-sm text-gray-600">{currentSale.generateInvoice ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Store ID</label>
                                <p className="mt-1 text-sm text-gray-600">{currentSale.storeId.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Client ID</label>
                                <p className="mt-1 text-sm text-gray-600">{currentSale.clientId.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sale Summary */}
                    <div className="bg-white p-4 rounded-xl shadow mb-6">
                        <h4 className="text-black font-semibold  text-lg mb-4 ">Sale Summary</h4>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${(currentSale.totalAmount - currentSale.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>${currentSale.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Allowance</span>
                                <span>${currentSale.allowance.toFixed(2)}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-semibold text-gray-800">
                                <span>Total Amount</span>
                                <span>${currentSale.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        {currentSale.generateInvoice && (
                            <div className="mt-4 flex gap-3">
                                <button className="px-4 py-2 text-sm border rounded-md text-gray-700">Preview Invoice</button>
                                <button className="px-4 py-2 text-sm bg-[#0f4d57] text-white rounded-md">Generate Invoice</button>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            <span className={getStatusColor(currentSale.status)}>● {currentSale.status}</span> Status
                            <span className="ml-4 text-gray-400">Last updated: {formatDate(currentSale.updatedAt)}</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Print Receipt
                            </button>
                            {currentSale.status === 'COMPLETED' && (
                                <button className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                                    Process Return
                                </button>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
};

export default SalesDetails;
