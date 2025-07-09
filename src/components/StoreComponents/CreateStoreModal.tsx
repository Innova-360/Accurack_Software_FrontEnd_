import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaUpload, FaImage } from "react-icons/fa";
import { TIMEZONES, CURRENCIES } from "../../types/store";
import { uploadImageToCloudinary } from "../../services/cloudinary";
import type { StoreFormData } from "../../types/store";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeData: StoreFormData) => void;
  loading?: boolean;
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    email: "",
    address: "",
    phone: "",
    currency: "USD",
    timezone: "America/New_York",
    logoUrl: "",
  });

  // Separate address fields
  const [addressFields, setAddressFields] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddressFields((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear address error when user starts typing
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, logoUrl: imageUrl }));
      setLogoPreview(imageUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const combineAddress = (): string => {
    const { street, city, state, zipCode, country } = addressFields;
    if (!street && !city && !state && !zipCode && !country) return "";
    
    let address = street.trim();
    if (city.trim() || state.trim() || zipCode.trim() || country.trim()) {
      address += address ? "\n" : "";
      const cityStateZipCountry = [city.trim(), state.trim(), zipCode.trim(), country.trim()]
        .filter(Boolean)
        .join(" ");
      address += cityStateZipCountry;
    }
    return address;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const combinedAddress = combineAddress();

    if (!formData.name.trim()) {
      newErrors.name = "Store name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate address fields
    if (!addressFields.street.trim()) {
      newErrors.street = "Street address is required";
    }
    if (!addressFields.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!addressFields.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!addressFields.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(addressFields.zipCode.trim())) {
      newErrors.zipCode = "Please enter a valid ZIP code (12345 or 12345-6789)";
    }
    if (!addressFields.country.trim()) {
      newErrors.country = "Country is required";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const combinedAddress = combineAddress();
      onSave({
        ...formData,
        address: combinedAddress,
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        email: "",
        address: "",
        phone: "",
        currency: "USD",
        timezone: "America/New_York",
        logoUrl: "",
      });
      setAddressFields({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
      setErrors({});
      setLogoPreview("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-xl font-bold text-[#0f4d57]">Create New Store</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Store logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <FaImage className="text-gray-400 text-xl" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="modal-logo-upload"
                  disabled={uploading || loading}
                />
                <label
                  htmlFor="modal-logo-upload"
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                    uploading || loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FaUpload className="mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter store name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="store@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+1-555-123-4567"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                disabled={loading}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                disabled={loading}
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Address *</h3>
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={addressFields.street}
                onChange={handleAddressChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.street ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="123 Main Street"
                disabled={loading}
              />
              {errors.street && (
                <p className="text-red-500 text-sm mt-1">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressFields.city}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="New York"
                  disabled={loading}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              {/* State (text input, not select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={addressFields.state}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="California"
                  disabled={loading}
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={addressFields.zipCode}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                    errors.zipCode ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="12345"
                  disabled={loading}
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressFields.country || ""}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                    errors.country ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="United States"
                  disabled={loading}
                />
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3f47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading || uploading ? "Creating..." : "Create Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoreModal;