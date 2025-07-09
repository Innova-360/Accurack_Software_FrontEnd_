import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import { fetchCustomers } from "../../store/slices/customerSlice";
import { fetchSales, fetchSaleById } from "../../store/slices/salesSlice";
import { createReturn } from "../../store/slices/returnSlice";
import useRequireStore from "../../hooks/useRequireStore";
import type { RootState, AppDispatch } from "../../store";

interface ReturnFormData {
  selectedCustomerId: string;
  selectedSaleId: string;
  selectedProductId: string;
  quantity: number;
  returnDate: string;
  reason: string;
  status: "saleable" | "no_saleable" | "scrap";
}

const CreateReturn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id: storeId } = useParams<{ id: string }>();
  const currentStore = useRequireStore();

  // Redux state
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const { sales, loading: salesLoading } = useSelector((state: RootState) => state.sales);
  const { currentSale, loading: currentSaleLoading } = useSelector((state: RootState) => state.sales);
  const { loading: returnLoading } = useSelector((state: RootState) => state.returns);

  // Local state
  const [formData, setFormData] = useState<ReturnFormData>({
    selectedCustomerId: "",
    selectedSaleId: "",
    selectedProductId: "",
    quantity: 1,
    returnDate: new Date().toISOString().split("T")[0],
    reason: "",
    status: "saleable",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerSales, setCustomerSales] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);

  // Fetch customers on component mount
  useEffect(() => {
    if (currentStore?.id) {
      dispatch(fetchCustomers({ storeId: currentStore.id, page: 1, limit: 1000 }));
    }
  }, [dispatch, currentStore?.id]);

  // Fetch sales when customer is selected
  useEffect(() => {
    if (formData.selectedCustomerId && currentStore?.id) {
      dispatch(fetchSales({ storeId: currentStore.id, page: 1, limit: 1000 }));
    }
  }, [dispatch, formData.selectedCustomerId, currentStore?.id]);

  // Filter sales by selected customer
  useEffect(() => {
    if (formData.selectedCustomerId && sales.length > 0) {
      const selectedCustomer = customers.find(c => c.id === formData.selectedCustomerId);
      if (selectedCustomer) {
        // Filter sales that belong to the selected customer
        const filteredSales = sales.filter(sale => {
          const saleCustomerName = sale.customer?.customerName || sale.customerData?.customerName || "";
          const saleCustomerPhone = sale.customer?.phoneNumber || sale.customerData?.phoneNumber || sale.customerPhone || "";
          
          return saleCustomerName === selectedCustomer.customerName || 
                 saleCustomerPhone === selectedCustomer.phoneNumber;
        });
        setCustomerSales(filteredSales);
      }
    } else {
      setCustomerSales([]);
    }
  }, [formData.selectedCustomerId, sales, customers]);

  // Fetch sale details when sale is selected
  useEffect(() => {
    if (formData.selectedSaleId) {
      dispatch(fetchSaleById(formData.selectedSaleId));
    }
  }, [dispatch, formData.selectedSaleId]);

  // Update sale products when current sale changes
  useEffect(() => {
    if (currentSale && currentSale.saleItems) {
      setSaleProducts(currentSale.saleItems);
    } else {
      setSaleProducts([]);
    }
  }, [currentSale]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset dependent fields when parent selection changes
    if (name === "selectedCustomerId") {
      setFormData((prev) => ({
        ...prev,
        selectedSaleId: "",
        selectedProductId: "",
      }));
      setSaleProducts([]);
    }

    if (name === "selectedSaleId") {
      setFormData((prev) => ({
        ...prev,
        selectedProductId: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.selectedCustomerId) {
      newErrors.selectedCustomerId = "Please select a customer";
    }
    if (!formData.selectedSaleId) {
      newErrors.selectedSaleId = "Please select a sale";
    }
    if (!formData.selectedProductId) {
      newErrors.selectedProductId = "Please select a product";
    }
    if (formData.quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }
    if (!formData.returnDate) {
      newErrors.returnDate = "Return date is required";
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    if (formData.reason.length > 100) {
      newErrors.reason = "Reason must be 100 characters or less";
    }

    // Validate quantity against available product quantity
    if (formData.selectedProductId) {
      const selectedProduct = saleProducts.find(p => p.productId === formData.selectedProductId);
      if (selectedProduct && formData.quantity > selectedProduct.quantity) {
        newErrors.quantity = `Quantity cannot exceed ${selectedProduct.quantity}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedCustomer = customers.find(c => c.id === formData.selectedCustomerId);
    const selectedProduct = saleProducts.find(p => p.productId === formData.selectedProductId);

    if (!selectedCustomer || !selectedProduct) {
      toast.error("Invalid selection");
      return;
    }

    const returnData = {
      saleId: formData.selectedSaleId,
      productId: formData.selectedProductId,
      quantity: formData.quantity,
      returnDate: formData.returnDate,
      reason: formData.reason,
      status: formData.status,
    };

    try {
      await dispatch(createReturn(returnData)).unwrap();
      toast.success("Return created successfully!");
      navigate(`/store/${storeId}/return`);
    } catch (error: any) {
      toast.error(error || "Failed to create return");
    }
  };

  const handleCancel = () => {
    navigate(`/store/${storeId}/return`);
  };

  const selectedCustomer = customers.find(c => c.id === formData.selectedCustomerId);
  const selectedProduct = saleProducts.find(p => p.productId === formData.selectedProductId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Return</h1>
              <p className="text-gray-600">Process a product return</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Selection
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer *
                  </label>
                  <select
                    name="selectedCustomerId"
                    value={formData.selectedCustomerId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                      errors.selectedCustomerId ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={customersLoading}
                  >
                    <option value="">
                      {customersLoading 
                        ? "Loading customers..." 
                        : "Select a customer"}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customerName} - {customer.phoneNumber}
                      </option>
                    ))}
                  </select>
                  {errors.selectedCustomerId && (
                    <p className="text-red-500 text-xs mt-1">{errors.selectedCustomerId}</p>
                  )}
                </div>

                {selectedCustomer && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="ml-2 text-gray-900">{selectedCustomer.customerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="ml-2 text-gray-900">{selectedCustomer.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedCustomer.customerMail}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Address:</span>
                        <span className="ml-2 text-gray-900">{selectedCustomer.customerAddress}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sale Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sale Selection
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Sale *
                  </label>
                  <select
                    name="selectedSaleId"
                    value={formData.selectedSaleId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                      errors.selectedSaleId ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!formData.selectedCustomerId || salesLoading}
                  >
                    <option value="">
                      {!formData.selectedCustomerId 
                        ? "Select a customer first" 
                        : salesLoading 
                        ? "Loading sales..." 
                        : customerSales.length === 0 
                        ? "No sales found for this customer"
                        : "Select a sale"}
                    </option>
                    {customerSales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        Sale #{sale.id.slice(-8)} - {new Date(sale.createdAt).toLocaleDateString()} - ${sale.totalAmount?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {errors.selectedSaleId && (
                    <p className="text-red-500 text-xs mt-1">{errors.selectedSaleId}</p>
                  )}
                </div>

                {formData.selectedSaleId && currentSale && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Sale Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Sale ID:</span>
                        <span className="ml-2 text-gray-900">{currentSale.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Date:</span>
                        <span className="ml-2 text-gray-900">{new Date(currentSale.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Total Amount:</span>
                        <span className="ml-2 text-gray-900">${currentSale.totalAmount?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Payment Method:</span>
                        <span className="ml-2 text-gray-900">{currentSale.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className="ml-2 text-gray-900">{currentSale.status}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Items:</span>
                        <span className="ml-2 text-gray-900">{currentSale.saleItems?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Product Selection
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product *
                  </label>
                  <select
                    name="selectedProductId"
                    value={formData.selectedProductId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                      errors.selectedProductId ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!formData.selectedSaleId || currentSaleLoading}
                  >
                    <option value="">
                      {!formData.selectedSaleId 
                        ? "Select a sale first" 
                        : currentSaleLoading 
                        ? "Loading products..." 
                        : saleProducts.length === 0 
                        ? "No products found in this sale"
                        : "Select a product"}
                    </option>
                    {saleProducts.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productName} - Qty: {product.quantity} - ${product.sellingPrice?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {errors.selectedProductId && (
                    <p className="text-red-500 text-xs mt-1">{errors.selectedProductId}</p>
                  )}
                </div>

                {selectedProduct && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Product Name:</span>
                        <span className="ml-2 text-gray-900">{selectedProduct.productName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">PLU/UPC:</span>
                        <span className="ml-2 text-gray-900 font-mono">{selectedProduct.pluUpc || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Selling Price:</span>
                        <span className="ml-2 text-gray-900">${selectedProduct.sellingPrice?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Available Quantity:</span>
                        <span className="ml-2 text-gray-900">{selectedProduct.quantity}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Total Price:</span>
                        <span className="ml-2 text-gray-900">${selectedProduct.totalPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Return Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Return Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                      errors.returnDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.returnDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                  >
                    <option value="saleable">Saleable</option>
                    <option value="no_saleable">No Saleable</option>
                    <option value="scrap">Scrap</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason * (max 100 characters)
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={100}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                      errors.reason ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter reason for return"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.reason && (
                      <p className="text-red-500 text-xs">{errors.reason}</p>
                    )}
                    <p className="text-gray-400 text-xs ml-auto">
                      {formData.reason.length}/100
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedProduct && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Return Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Return Amount</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Unit Price:</span>
                        <span className="text-sm font-medium">${selectedProduct.sellingPrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="text-sm font-medium">{formData.quantity}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total Refund:</span>
                          <span className="text-lg font-bold text-[#0f4d57]">
                            ${((selectedProduct.sellingPrice || 0) * formData.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Return Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Customer:</span>
                        <span className="text-sm font-medium">{selectedCustomer?.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sale ID:</span>
                        <span className="text-sm font-medium">{formData.selectedSaleId.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Product:</span>
                        <span className="text-sm font-medium">{selectedProduct.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium ${
                          formData.status === "saleable" 
                            ? "text-green-600" 
                            : formData.status === "no_saleable" 
                            ? "text-orange-600" 
                            : "text-red-600"
                        }`}>
                          {formData.status === "saleable" 
                            ? "Saleable" 
                            : formData.status === "no_saleable" 
                            ? "No Saleable" 
                            : "Scrap"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <SpecialButton
                type="button"
                variant="modal-cancel"
                onClick={handleCancel}
                className="px-6 py-3"
              >
                Cancel
              </SpecialButton>
              <SpecialButton
                type="submit"
                variant="primary"
                className="px-6 py-3 bg-[#0f4d57] hover:bg-[#0d3f47]"
                disabled={returnLoading}
              >
                {returnLoading ? "Creating..." : "Create Return"}
              </SpecialButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReturn;
