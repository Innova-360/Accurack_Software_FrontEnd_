import toast from "react-hot-toast";
import React, { useState } from "react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createSupplier } from "../../store/slices/supplierSlice";
import type { SupplierFormData } from "../../types/supplier";
import Header from "../../components/Header";
import useRequireStore from "../../hooks/useRequireStore";

const AddSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const currentStore = useRequireStore();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.suppliers);
  
  const [formData, setFormData] = useState<SupplierFormData>({
    supplier_id: "",
    name: "",
    email: "",
    phone: "",
    address: "", // This will be composed from detailed fields
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    storeId: currentStore?.id || "",
  });

  // Update storeId when currentStore changes
  React.useEffect(() => {
    if (currentStore?.id && !formData.storeId) {
      setFormData((prev) => ({
        ...prev,
        storeId: currentStore.id,
      }));
    }
  }, [currentStore?.id, formData.storeId]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleInputChange = (field: keyof SupplierFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Vendor name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State/Province is required";
    }
    if (!formData.zipCode.toString().trim()) {
      newErrors.zipCode = "ZIP/Postal code is required";
    }
    if (!formData.storeId) {
      newErrors.storeId = "Store ID is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      // Compose address from detailed fields
      const composedAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();
      
      const supplierData = {
        supplier_id: formData.name.toLowerCase().replace(/\s+/g, "-"), // Generate a simple ID from name
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: composedAddress, // Use composed address
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        storeId: currentStore?.id || formData.storeId,
      };

      // Create supplier and get the response
      await dispatch(createSupplier(supplierData)).unwrap();

      toast.success("Supplier created successfully!");
      
      // Navigate back to suppliers page
      navigate(`/store/${currentStore?.id}/supplier`);
      
    } catch (error) {
      console.error("Error creating supplier:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : "Failed to create supplier. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(`/store/${currentStore?.id}/supplier`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between py-4 lg:py-6 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCancel}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <FaArrowLeft className="text-gray-600" size={17} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-[#03414C] to-[#025a6b] rounded-xl">
                    <FaPlus className="text-white" size={15} />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 mb-1">
                      Add New Vendor
                    </h1>
                    <p className="text-sm lg:text-base text-gray-600 font-medium">
                      Create a new vendor profile for your store
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#03414C] to-[#025a6b] p-6 lg:p-5">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                Vendor Information
              </h2>
              <p className="text-blue-100 mt-1">
                Please fill in all the required information to create a new vendor
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter supplier name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Address Information
                </h3>
                
                {/* Street Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                      errors.streetAddress ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter street address"
                    disabled={loading}
                  />
                  {errors.streetAddress && (
                    <p className="mt-2 text-sm text-red-600">{errors.streetAddress}</p>
                  )}
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter city"
                      disabled={loading}
                    />
                    {errors.city && (
                      <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter state/province"
                      disabled={loading}
                    />
                    {errors.state && (
                      <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 ${
                        errors.zipCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter ZIP/postal code"
                      disabled={loading}
                    />
                    {errors.zipCode && (
                      <p className="mt-2 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-[#03414C] to-[#025a6b] text-white px-8 py-3 rounded-xl hover:from-[#025a6b] hover:to-[#03414C] focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  {loading ? "Creating..." : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddSupplierPage;
