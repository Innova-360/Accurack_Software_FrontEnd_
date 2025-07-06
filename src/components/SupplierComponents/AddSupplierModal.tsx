import toast from "react-hot-toast";
import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { SpecialButton } from "../buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createSupplier } from "../../store/slices/supplierSlice";
import type { SupplierFormData } from "../../types/supplier";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated?: (supplier: any) => void;
}
const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSupplierCreated,
}) => {
  const dispatch = useAppDispatch();
  const { currentStore } = useAppSelector((state) => state.stores);
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
      newErrors.name = "Supplier name is required";
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
      const result = await dispatch(createSupplier(supplierData)).unwrap();

      // Reset form and close modal
      setFormData({
        supplier_id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        storeId: currentStore?.id || "",
      });
      setErrors({});
      toast.success("Supplier created successfully!");
      onClose();

      // Trigger the popup with the created supplier data
      if (onSupplierCreated) {
        // Extract supplier data from the Redux action result
        // Handle nested data structure or use the supplied data as fallback
        console.log("Full result:", result);
        let createdSupplierData: any = supplierData;

        // Check if result has supplier data in different possible structures
        if (result && typeof result === "object") {
          const resultObj = result as any;
          if (resultObj.supplier) {
            createdSupplierData = resultObj.supplier;
          } else if (resultObj.data) {
            createdSupplierData = resultObj.data;
          }
        }

        // If still no valid ID found, try to get it from the refreshed suppliers list
        if (!createdSupplierData?.id && !createdSupplierData?.supplier_id && !createdSupplierData?._id) {
          console.log("No valid ID found, using form data with temporary ID");
          // Create a temporary supplier object with the form data
          // The actual supplier will be available after list refresh
          createdSupplierData = {
            ...supplierData,
            id: 'temp-' + Date.now(), // Temporary ID
            supplier_id: 'temp-' + Date.now(),
            isTemporary: true // Flag to indicate this is temporary
          };
        }

        console.log("Final supplier data for modal:", createdSupplierData);
        onSupplierCreated(createdSupplierData);
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : "Failed to create supplier. Please try again.";
      toast.error(errorMessage);
    }
  };
  const handleClose = () => {
    setFormData({
      supplier_id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      storeId: currentStore?.id || "",
    });
    setErrors({});
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <FaPlus className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Supplier
              </h2>
              <p className="text-sm text-gray-600">
                Create a new supplier profile
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" size={18} />
          </button>
        </div>{" "}
        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e)} className="p-6 space-y-4">
          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter supplier name"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address "
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter phone number "
              disabled={loading}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          {/* Address Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Address *
            </label>
            
            {/* Street Address */}
            <div className="mb-3">
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                  errors.streetAddress ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Street Address"
                disabled={loading}
              />
              {errors.streetAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
              )}
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="City"
                  disabled={loading}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="State / Province / Region"
                  disabled={loading}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </div>

            {/* ZIP Code */}
            <div>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                  errors.zipCode ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="ZIP / Postal Code"
                disabled={loading}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
          </div>
          {/* Store Information */}
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <SpecialButton
              variant="modal-cancel"
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </SpecialButton>{" "}
            <SpecialButton
              variant="modal-confirm"
              type="button"
              onClick={async () => {
                const event = new Event("submit") as unknown as React.FormEvent;
                await handleSubmit(event);
              }}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Supplier"}
            </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddSupplierModal;
