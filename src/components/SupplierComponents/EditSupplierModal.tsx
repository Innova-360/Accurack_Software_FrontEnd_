import React, { useState, useEffect } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { SpecialButton } from "../buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateSupplier } from "../../store/slices/supplierSlice";
import type { Supplier, SupplierFormData } from "../../types/supplier";
import useRequireStore from "../../hooks/useRequireStore";

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
}) => {
  const dispatch = useAppDispatch();
  const currentStore = useRequireStore();
  const { loading } = useAppSelector((state) => state.suppliers);
  const [formData, setFormData] = useState<SupplierFormData>({
    supplier_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    storeId: currentStore?.id || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to get the valid ID for API operations
  const getValidSupplierId = (supplier: Supplier): string | null => {
    // Prefer numeric/UUID id if available
    if (
      supplier.id &&
      supplier.id.trim() &&
      !supplier.id.includes(" ") &&
      supplier.id.length <= 50
    ) {
      return supplier.id;
    }

    // Check if supplier_id is valid (should be numeric or UUID, not sample text)
    if (
      supplier.supplier_id &&
      supplier.supplier_id.trim() &&
      !supplier.supplier_id.includes(" ") &&
      supplier.supplier_id.length <= 50 &&
      /^[a-zA-Z0-9_-]+$/.test(supplier.supplier_id)
    ) {
      return supplier.supplier_id;
    }

    return null;
  };

  // Update form data when supplier changes
  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_id: supplier.supplier_id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        storeId: supplier.storeId,
      });
    }
  }, [supplier]);
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

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.storeId) {
      newErrors.storeId = "Store ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !supplier) {
      return;
    }
    if (!currentStore?.id) {
      console.error("No current store found");
      toast.error("No store selected. Please select a store first.");
      return;
    }

    const validId = getValidSupplierId(supplier);

    if (!validId) {
      toast.error(
        "Cannot edit this supplier: This appears to be sample/dummy data that cannot be modified. Please add real suppliers to manage them."
      );
      console.log("Invalid supplier ID:", supplier.supplier_id);
      return;
    }

    try {
      console.log(
        "Updating supplier with valid ID:",
        validId,
        "with data:",
        formData
      );

      await dispatch(
        updateSupplier({
          id: validId,
          supplierData: {
            ...formData,
            storeId: currentStore.id,
          },
        })
      ).unwrap();

      console.log("Supplier updated successfully");
      toast.success("Supplier updated successfully!");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error updating supplier:", error);
      // Show error to user
      const errorMessage =
        typeof error === "string"
          ? error
          : "Failed to update supplier. Please try again.";
      toast.error(errorMessage);
    }
  };
  const handleClose = () => {
    if (supplier) {
      setFormData({
        supplier_id: supplier.supplier_id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        storeId: supplier.storeId,
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#03414C] rounded-lg">
              <FaEdit className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#03414C]">
                Edit Supplier
              </h2>
              <p className="text-sm text-gray-600">
                Update supplier information
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

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
              placeholder="Enter supplier name (e.g., ABC Suppliers Ltd)"
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
              placeholder="Enter email address (e.g., supplier@example.com)"
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
              placeholder="Enter phone number (e.g., +1-555-123-4567)"
              disabled={loading}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter supplier address (e.g., 123 Main St, City, State 12345)"
              rows={3}
              disabled={loading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Store Information */}
          {currentStore && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store
              </label>
              <p className="text-sm text-gray-600">{currentStore.name}</p>
              <p className="text-xs text-gray-500">
                Store ID: {currentStore.id}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <SpecialButton
              variant="modal-cancel"
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </SpecialButton>
            <SpecialButton
              variant="modal-confirm"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Supplier"}
            </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierModal;
