import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import { fetchCustomers } from "../../store/slices/customerSlice";
import { fetchSales, fetchSaleById } from "../../store/slices/salesSlice";
import { createReturn } from "../../store/slices/returnSlice";
import useRequireStore from "../../hooks/useRequireStore";
import type { RootState, AppDispatch } from "../../store";

interface ReturnItem {
  productId: string;
  quantity: number;
  reason: string;
  returnAmountType: "percentage" | "amount";
  returnValue: number; // percentage or fixed amount
}

interface ReturnFormData {
  selectedCustomerId: string;
  selectedSaleId: string;
  returnType: "refund_without_return" | "return";
  status: "saleable" | "no_saleable" | "scrap";
  returnItems: ReturnItem[];
}

const CreateReturn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id: storeId } = useParams<{ id: string }>();
  const currentStore = useRequireStore();

  // Redux state
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const { sales, loading: salesLoading } = useSelector((state: RootState) => state.sales);
  const { currentSale } = useSelector((state: RootState) => state.sales);
  const { loading: returnLoading } = useSelector((state: RootState) => state.returns);

  // Local state
  const [formData, setFormData] = useState<ReturnFormData>({
    selectedCustomerId: "",
    selectedSaleId: "",
    returnType: "return",
    status: "saleable",
    returnItems: [],
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
      [name]: value,
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
        returnItems: [],
      }));
      setSaleProducts([]);
    }

    if (name === "selectedSaleId") {
      setFormData((prev) => ({
        ...prev,
        returnItems: [],
      }));
    }

    // Handle return type change
    if (name === "returnType") {
      setFormData((prev) => ({
        ...prev,
        status: value === "refund_without_return" ? "no_saleable" : "saleable",
      }));
    }
  };

  const addReturnItem = () => {
    setFormData((prev) => ({
      ...prev,
      returnItems: [
        ...prev.returnItems,
        {
          productId: "",
          quantity: 1,
          reason: "",
          returnAmountType: "percentage",
          returnValue: 0,
        },
      ],
    }));
  };

  const removeReturnItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      returnItems: prev.returnItems.filter((_, i) => i !== index),
    }));
  };

  const updateReturnItem = (index: number, field: keyof ReturnItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      returnItems: prev.returnItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    // Immediate validation for quantity field
    if (field === "quantity") {
      const currentItem = formData.returnItems[index];
      if (currentItem && currentItem.productId) {
        const selectedProduct = saleProducts.find(p => p.productId === currentItem.productId);
        if (selectedProduct && value > selectedProduct.quantity) {
          setErrors((prev) => ({
            ...prev,
            [`returnItems[${index}].quantity`]: `Quantity cannot exceed ${selectedProduct.quantity}`
          }));
        } else {
          // Clear the error if quantity is valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`returnItems[${index}].quantity`];
            return newErrors;
          });
        }
      }
    }

    // Clear other field errors when user starts typing
    if (errors[`returnItems[${index}].${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`returnItems[${index}].${field}`];
        return newErrors;
      });
    }
  };

  const getAvailableProducts = (excludeIndex?: number) => {
    const selectedProductIds = formData.returnItems
      .filter((_, index) => index !== excludeIndex)
      .map((item) => item.productId);
    
    return saleProducts.filter((product) => !selectedProductIds.includes(product.productId));
  };

  const getProductById = (productId: string) => {
    return saleProducts.find((product) => product.productId === productId);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.selectedCustomerId) {
      newErrors.selectedCustomerId = "Please select a customer";
    }
    if (!formData.selectedSaleId) {
      newErrors.selectedSaleId = "Please select a sale";
    }
    if (formData.returnItems.length === 0) {
      newErrors.returnItems = "Please add at least one product to return";
    }      // Validate each return item
      formData.returnItems.forEach((item, index) => {
        if (!item.productId) {
          newErrors[`returnItems[${index}].productId`] = "Please select a product";
        }
        if (item.quantity < 1) {
          newErrors[`returnItems[${index}].quantity`] = "Quantity must be at least 1";
        }
        if (item.reason.length > 100) {
          newErrors[`returnItems[${index}].reason`] = "Reason must be 100 characters or less";
        }
        if (item.returnValue < 0) {
          newErrors[`returnItems[${index}].returnValue`] = "Return value cannot be negative";
        }
        if (item.returnAmountType === "percentage" && item.returnValue > 100) {
          newErrors[`returnItems[${index}].returnValue`] = "Percentage cannot exceed 100%";
        }

        // Validate quantity against available product quantity
        if (item.productId) {
          const selectedProduct = saleProducts.find(p => p.productId === item.productId);
          if (selectedProduct && item.quantity > selectedProduct.quantity) {
            newErrors[`returnItems[${index}].quantity`] = `Quantity cannot exceed ${selectedProduct.quantity}`;
          }
        }

        // Validate refund amount calculation
        if (item.productId) {
          const selectedProduct = saleProducts.find(p => p.productId === item.productId);
          if (selectedProduct) {
            const itemTotal = (selectedProduct.sellingPrice || 0) * item.quantity;
            const refundAmount = item.returnAmountType === "percentage" 
              ? itemTotal * (item.returnValue / 100)
              : item.returnValue;
            
            if (refundAmount > itemTotal) {
              newErrors[`returnItems[${index}].returnValue`] = `Refund amount cannot exceed item total ($${itemTotal.toFixed(2)})`;
            }
          }
        }
      });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedCustomer = customers.find(c => c.id === formData.selectedCustomerId);

    if (!selectedCustomer) {
      toast.error("Invalid customer selection");
      return;
    }

    try {
      // Transform the form data to match the API structure
      const returnItems = formData.returnItems.map(item => {
        const product = getProductById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Calculate refund amount based on return amount type
        const itemTotal = (product.sellingPrice || 0) * item.quantity;
        const refundAmount = item.returnAmountType === "percentage" 
          ? itemTotal * (item.returnValue / 100)
          : item.returnValue;

        // Map status to return category
        const returnCategory: "SALEABLE" | "NON_SALEABLE" | "SCRAP" = formData.status === "saleable" 
          ? "SALEABLE" 
          : formData.status === "no_saleable" 
          ? "NON_SALEABLE" 
          : "SCRAP";

        return {
          productId: item.productId,
          pluUpc: product.pluUpc || "",
          isProductReturned: formData.returnType === "return",
          quantity: item.quantity,
          refundAmount: Math.round(refundAmount * 100) / 100, // Round to 2 decimal places
          returnCategory: returnCategory,
          reason: item.reason,
        };
      });

      const returnData = {
        saleId: formData.selectedSaleId,
        returnItems: returnItems,
      };

      console.log("🚀 Submitting return data:", returnData);

      await dispatch(createReturn(returnData)).unwrap();
      toast.success("Return created successfully!");
      navigate(`/store/${storeId}/return`);
    } catch (error: any) {
      console.error("Return creation error:", error);
      toast.error(error || "Failed to create return");
    }
  };

  const handleCancel = () => {
    navigate(`/store/${storeId}/return`);
  };

  const selectedCustomer = customers.find(c => c.id === formData.selectedCustomerId);

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
              <h1 className="text-3xl font-bold text-gray-900">Create Return & Refund</h1>
              <p className="text-gray-600">Process a product return & refund</p>
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
                    Select Customer <span className="text-red-500">*</span>
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
                    Select Sale <span className="text-red-500">*</span>
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

            {/* Return Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Refund Options
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Options <span className="text-red-500">*</span>
                </label>
                <select
                  name="returnType"
                  value={formData.returnType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                >
                  <option value="return">Return</option>
                  <option value="refund_without_return">Refund Without Return</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  {formData.returnType === "refund_without_return" 
                    ? "Customer will receive a refund without returning the physical product. Status will be set to No Saleable."
                    : "Customer will return the physical product and receive a refund. You can choose the return status."
                  }
                </p>
              </div>
            </div>

            {/* Return Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Return Status {formData.returnType === "return" ? "(Applies to All Products)" : "(Automatically Set)"}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                  disabled={formData.returnType === "refund_without_return"}
                >
                  <option value="saleable">Saleable</option>
                  <option value="no_saleable">No Saleable</option>
                  <option value="scrap">Scrap</option>
                </select>
                {formData.returnType === "refund_without_return" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Status is automatically set to "No Saleable" for refund without return.
                  </p>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products to Return
                </h2>
                <SpecialButton
                  type="button"
                  variant="primary"
                  onClick={addReturnItem}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f4d57] hover:bg-[#0d3f47] text-white"
                  disabled={!formData.selectedSaleId || saleProducts.length === 0}
                >
                  <FaPlus size={14} />
                  Add Product
                </SpecialButton>
              </div>

              {errors.returnItems && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.returnItems}</p>
                </div>
              )}

              {formData.returnItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No products added yet. Click "Add Product" to start adding products to return.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.returnItems.map((item, index) => {
                    const availableProducts = getAvailableProducts(index);
                    const selectedProduct = getProductById(item.productId);
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-md font-medium text-gray-900">
                            Product {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeReturnItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Product Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Product <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.productId}
                              onChange={(e) => updateReturnItem(index, "productId", e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                                errors[`returnItems[${index}].productId`] ? "border-red-500" : "border-gray-300"
                              }`}
                            >
                              <option value="">Select a product</option>
                              {availableProducts.map((product) => (
                                <option key={product.productId} value={product.productId}>
                                  {product.productName} - Available: {product.quantity}
                                </option>
                              ))}
                            </select>
                            {errors[`returnItems[${index}].productId`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`returnItems[${index}].productId`]}</p>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateReturnItem(index, "quantity", parseInt(e.target.value) || 1)}
                              min="1"
                              max={selectedProduct?.quantity || 999}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                                errors[`returnItems[${index}].quantity`] ? "border-red-500" : "border-gray-300"
                              }`}
                            />
                            {errors[`returnItems[${index}].quantity`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`returnItems[${index}].quantity`]}</p>
                            )}
                          </div>

                          {/* Return Amount Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Return Amount Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.returnAmountType}
                              onChange={(e) => updateReturnItem(index, "returnAmountType", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="amount">Fixed Amount ($)</option>
                            </select>
                          </div>

                          {/* Return Value */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Return {item.returnAmountType === "percentage" ? "Percentage" : "Amount"} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.returnValue}
                              onChange={(e) => updateReturnItem(index, "returnValue", parseFloat(e.target.value) || 0)}
                              min="0"
                              max={item.returnAmountType === "percentage" ? 100 : undefined}
                              step={item.returnAmountType === "percentage" ? 1 : 0.01}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                                errors[`returnItems[${index}].returnValue`] ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder={item.returnAmountType === "percentage" ? "0-100" : "0.00"}
                            />
                            {errors[`returnItems[${index}].returnValue`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`returnItems[${index}].returnValue`]}</p>
                            )}
                          </div>

                          {/* Reason */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Return Reason (max 100 characters)
                            </label>
                            <textarea
                              value={item.reason}
                              onChange={(e) => updateReturnItem(index, "reason", e.target.value)}
                              rows={2}
                              maxLength={100}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                                errors[`returnItems[${index}].reason`] ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder="Enter reason for return (optional)"
                            />
                            <div className="flex justify-between items-center mt-1">
                              {errors[`returnItems[${index}].reason`] && (
                                <p className="text-red-500 text-xs">{errors[`returnItems[${index}].reason`]}</p>
                              )}
                              <p className="text-gray-400 text-xs ml-auto">
                                {item.reason.length}/100
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Product Summary */}
                        {selectedProduct && (
                          <div className="mt-4 bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Product Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Unit Price:</span>
                                <span className="ml-2 text-gray-900">${selectedProduct.sellingPrice?.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Total Item Value:</span>
                                <span className="ml-2 text-gray-900">
                                  ${((selectedProduct.sellingPrice || 0) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Return Amount:</span>
                                <span className="ml-2 text-gray-900 font-semibold">
                                  ${(() => {
                                    const itemTotal = (selectedProduct.sellingPrice || 0) * item.quantity;
                                    if (item.returnAmountType === "percentage") {
                                      return (itemTotal * (item.returnValue / 100)).toFixed(2);
                                    } else {
                                      return item.returnValue.toFixed(2);
                                    }
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            {formData.returnItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Return Summary
                </h2>
                <div className="space-y-4">
                  {formData.returnItems.map((item, index) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    
                    const itemTotal = (product.sellingPrice || 0) * item.quantity;
                    const returnAmount = item.returnAmountType === "percentage" 
                      ? itemTotal * (item.returnValue / 100)
                      : item.returnValue;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{product.productName}</h3>
                          <span className="text-sm text-gray-500">Product {index + 1}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Quantity:</span>
                            <span className="ml-2 text-gray-900">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Unit Price:</span>
                            <span className="ml-2 text-gray-900">${product.sellingPrice?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Item Total:</span>
                            <span className="ml-2 text-gray-900">${itemTotal.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Return Amount:</span>
                            <span className="ml-2 font-semibold text-[#0f4d57]">
                              ${returnAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-600">Return Type:</span>
                          <span className="ml-2 text-gray-900">
                            {item.returnAmountType === "percentage" 
                              ? `${item.returnValue}% of item total`
                              : `Fixed amount: $${item.returnValue.toFixed(2)}`
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Total Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Return Amount:</span>
                      <span className="text-xl font-bold text-[#0f4d57]">
                        ${formData.returnItems.reduce((total, item) => {
                          const product = getProductById(item.productId);
                          if (!product) return total;
                          
                          const itemTotal = (product.sellingPrice || 0) * item.quantity;
                          const returnAmount = item.returnAmountType === "percentage" 
                            ? itemTotal * (item.returnValue / 100)
                            : item.returnValue;
                          
                          return total + returnAmount;
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">Return Type:</span>
                        <span className={`${
                          formData.returnType === "return" 
                            ? "text-blue-600" 
                            : "text-purple-600"
                        }`}>
                          {formData.returnType === "return" 
                            ? "Return" 
                            : "Refund Without Return"}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-medium">Return Status:</span>
                        <span className={`${
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
            <div className="flex justify-end space-x-4 pt-6">
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
                className="px-6 py-3 text-white bg-[#0f4d57] hover:bg-[#0d3f47]"
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
