import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../components/Header";
import { Button } from "../../components/buttons";
import { useCustomers } from "../../hooks/useCustomers";
import useRequireStore from "../../hooks/useRequireStore";
import { createOrder } from "../../store/slices/orderProcessingSlice";
import type { AppDispatch } from "../../store";
import type { OrderStatus, PaymentType } from "../../types/orderProcessing";
import { useGetDrivers } from "../../hooks/useGetDrivers";

const CreateOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string }>();
  const currentStore = useRequireStore();

  const { customers, loading: customersLoading } = useCustomers(
    currentStore?.id,
    {
      limit: 1000, // Get all customers for dropdown
    }
  );

  const {
    drivers,
    loading: driverLoading,
    error: driverError,
    refetch,
  } = useGetDrivers(storeId, true);

  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    status: "pending" as OrderStatus,
    paymentAmount: 0,
    paymentType: "CASH" as PaymentType,
    driverName: "",
    driverId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    setFormData((prev) => ({
      ...prev,
      customerId,
      customerName: selectedCustomer ? selectedCustomer.customerName : "",
    }));
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: "" }));
    }
  };

  const handleDriverChange = (driverId: string) => {
    const selectedDriver = drivers.find((d) => d.id === driverId);
    setFormData((prev) => ({
      ...prev,
      driverId,
      driverName: selectedDriver
        ? selectedDriver.firstName.concat(" ").concat(selectedDriver.lastName)
        : "",
    }));
    if (errors.driverId) {
      setErrors((prev) => ({ ...prev, driverId: "" }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    if (!formData.paymentAmount || formData.paymentAmount <= 0) {
      newErrors.paymentAmount = "Payment amount must be greater than 0";
    }
    if (!formData.paymentType) {
      newErrors.paymentType = "Payment type is required";
    }
    if (!formData.driverName.trim()) {
      newErrors.driverName = "Driver name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!currentStore?.id) return;

    setIsSubmitting(true);
    try {
      const createData = {
        ...formData,
        storeId: currentStore.id,
        isValidated: false, // New orders start as not validated
      };

      await dispatch(createOrder(createData)).unwrap();
      toast.success("Order created successfully");
      // Navigate back to order processing page
      navigate(
        storeId
          ? `/store/${storeId}/order-processing/view-orders`
          : "/order-processing"
      );
    } catch (error: any) {
      toast.error(error || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    // Navigate back to order processing page
    navigate(
      storeId ? `/store/${storeId}/order-processing` : "/order-processing"
    );
  };

  useEffect(() => {
    if (!currentStore?.id) {
      navigate("/");
    }
  }, [currentStore, navigate]);

  if (!currentStore?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const statusOptions: Array<{ value: OrderStatus; label: string }> = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentOptions: Array<{ value: PaymentType; label: string }> = [
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHECK", label: "Check" },
    { value: "DIGITAL_WALLET", label: "Digital Wallet" },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaArrowLeft size={16} />
                  <span>Back to Orders</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Order
                </h1>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.customerId ? "border-red-500" : "border-gray-300"
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
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.customerId}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paymentAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "paymentAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.paymentAmount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.paymentAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.paymentAmount}
                  </p>
                )}
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type *
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) =>
                    handleInputChange("paymentType", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.paymentType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.paymentType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.paymentType}
                  </p>
                )}
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Name *
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.customerId ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={driverLoading}
                >
                  <option value="">
                    {driverLoading ? "Loading drivers..." : "Select a driver"}
                  </option>
                  {drivers &&
                    drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} - {driver.lastName}
                      </option>
                    ))}
                </select>
                {errors.driverId && (
                  <p className="mt-1 text-sm text-red-600">{errors.driverId}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={handleGoBack}
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Create Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateOrderPage;
