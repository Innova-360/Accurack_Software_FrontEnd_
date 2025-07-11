import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Save, ArrowLeft, X } from "lucide-react";
import Header from "../../components/Header";
import { fetchSaleById, updateSale } from "../../store/slices/salesSlice";
import type { RootState, AppDispatch } from "../../store";
import useRequireStore from "../../hooks/useRequireStore";

const EditSalePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id: storeId, saleid } = useParams<{ id: string; saleid: string }>();

    // Ensure user has access to store
    useRequireStore();

    // Redux state
    const { currentSale, loading, error } = useSelector(
        (state: RootState) => state.sales
    );

    // Form state
    const [formData, setFormData] = useState({
        paymentMethod: "CASH",
        status: "PENDING",
        totalAmount: 0,
        tax: 0,
        cashierName: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Payment method options
    const paymentMethods = [
        { value: "CASH", label: "Cash" },
        { value: "CARD", label: "Card" },
        { value: "BANK_TRANSFER", label: "Bank Transfer" },
        { value: "CHECK", label: "Check" },
        { value: "DIGITAL_WALLET", label: "Digital Wallet" },
    ];

    // Status options
    const statusOptions = [
        { value: "PENDING", label: "Pending" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
        { value: "REFUNDED", label: "Refunded" },
        { value: "PARTIALLY_RETURNED", label: "Partially Returned" },
    ];

    // Fetch sale data on component mount
    useEffect(() => {
        if (saleid) {
            dispatch(fetchSaleById(saleid));
        }
    }, [dispatch, saleid]);

    // Update form data when sale data is loaded
    useEffect(() => {
        if (currentSale) {
            setFormData({
                paymentMethod: currentSale.paymentMethod || "CASH",
                status: currentSale.status || "PENDING",
                totalAmount: currentSale.totalAmount || 0,
                tax: currentSale.tax || 0,
                cashierName: currentSale.cashierName || "",
            });
        }
    }, [currentSale]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "totalAmount" || name === "tax" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!saleid) return;

        setIsSubmitting(true);
        try {
            await dispatch(
                updateSale({
                    saleId: saleid,
                    updateData: formData,
                })
            ).unwrap();

            toast.success("Sale updated successfully!");

            // Navigate back to sales list or sale details
            if (storeId) {
                navigate(`/store/${storeId}/sales`);
            } else {
                navigate("/sales");
            }
        } catch (error) {
            console.error("Failed to update sale:", error);
            toast.error("Failed to update sale");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (storeId) {
            navigate(`/store/${storeId}/sales`);
        } else {
            navigate("/sales");
        }
    };

    if (loading && !currentSale) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03414C] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading sale details...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Sale</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-[#03414C] text-white rounded-lg hover:bg-[#025a6b] transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (!currentSale) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <X className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sale Not Found</h2>
                        <p className="text-gray-600 mb-4">The requested sale could not be found.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-[#03414C] text-white rounded-lg hover:bg-[#025a6b] transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleCancel}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Edit Sale</h1>
                                    <p className="text-gray-600">
                                        Sale ID: {currentSale.id || currentSale.transactionId}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Created: {new Date(currentSale.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Customer Information (Read-only) */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                    {currentSale.customer?.customerName ||
                                        currentSale.customerData?.customerName ||
                                        "Unknown Customer"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                    {currentSale.customer?.phoneNumber ||
                                        currentSale.customerData?.phoneNumber ||
                                        currentSale.customerPhone ||
                                        "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                    {currentSale.customer?.customerMail ||
                                        currentSale.customerData?.customerMail ||
                                        "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sale Items (Read-only) */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sale Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentSale.saleItems?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                                ${item.sellingPrice?.toFixed(2) || "0.00"}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                                                ${item.totalPrice?.toFixed(2) || "0.00"}
                                            </td>
                                        </tr>
                                    )) || (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                    No items found
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Editable Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Sale Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                                        disabled={isSubmitting}
                                    >
                                        {paymentMethods.map((method) => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                                        disabled={isSubmitting}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Amount
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {currentSale.totalAmount || " "}
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax
                                    </label>
                                    <input
                                        type="number"
                                        id="tax"
                                        name="tax"
                                        value={formData.tax}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="cashierName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Cashier Name
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {currentSale.cashierName || " "}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center space-x-2 px-6 py-2 bg-[#03414C] text-white rounded-lg hover:bg-[#025a6b] transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditSalePage;
