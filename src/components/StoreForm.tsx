import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaStore, FaCog } from "react-icons/fa";
import { SpecialButton } from "./buttons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createStore, updateStore } from "../store/slices/storeSlice";
import type { StoreFormData } from "../types/store";

const TIMEZONES = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "EST - Eastern Standard Time" },
  { value: "America/Chicago", label: "CST - Central Standard Time" },
  { value: "America/Denver", label: "MST - Mountain Standard Time" },
  { value: "America/Los_Angeles", label: "PST - Pacific Standard Time" },
  { value: "Europe/London", label: "GMT - Greenwich Mean Time" },
  { value: "Europe/Paris", label: "CET - Central European Time" },
  { value: "Asia/Tokyo", label: "JST - Japan Standard Time" },
  { value: "Asia/Shanghai", label: "CST - China Standard Time" },
  { value: "Asia/Kolkata", label: "IST - India Standard Time" },
  {
    value: "Australia/Sydney",
    label: "AEST - Australian Eastern Standard Time",
  },
];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "CNY", label: "CNY - Chinese Yuan", symbol: "¥" },
  { value: "INR", label: "INR - Indian Rupee", symbol: "₹" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { value: "CHF", label: "CHF - Swiss Franc", symbol: "CHF" },
  { value: "SEK", label: "SEK - Swedish Krona", symbol: "kr" },
];

const StoreForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { stores, loading: storeLoading } = useAppSelector(
    (state) => state.stores
  );
  const isEditing = !!id;

  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    timezone: "America/New_York",
    currency: "USD",
  });

  const [errors, setErrors] = useState<Partial<StoreFormData>>({});

  useEffect(() => {
    if (isEditing && id) {
      // Find store data for editing
      const store = stores.find((s) => s.id === id);
      if (store) {
        setFormData({
          name: store.name,
          address: store.address,
          phone: store.phone,
          email: store.email,
          timezone: store.timezone,
          currency: store.currency,
        });
      }
    }
  }, [isEditing, id, stores]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof StoreFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StoreFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Store name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing && id) {
        await dispatch(updateStore({ id, storeData: formData })).unwrap();
      } else {
        await dispatch(createStore(formData)).unwrap();
      }

      console.log(
        isEditing ? "Store updated successfully" : "Store created successfully"
      );

      // Navigate to stores page after successful submission
      navigate("/stores");
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error(
        "An error occurred while saving the store. Please try again."
      );
    }
  };

  const handleCancel = () => {
    navigate("/stores");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
              <FaStore className="text-teal-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#03414C]">
                {isEditing ? "Edit Store" : "Create Your Store"}
              </h1>
              <p className="text-gray-600 text-sm">
                {isEditing
                  ? "Update your store information and settings"
                  : "Set up your store with basic information and preferences"}
              </p>  
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Store Information Section */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Store Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your store name"
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="store@example.com"
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, City, State 12345"
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Store Settings Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <FaCog className="text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Store Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {" "}
              <SpecialButton
                type="button"
                variant="modal-cancel"
                onClick={handleCancel}
                disabled={storeLoading}
              >
                Cancel
              </SpecialButton>
              <SpecialButton
                type="submit"
                variant="modal-add"
                disabled={storeLoading}
              >
                {storeLoading
                  ? "Saving..."
                  : isEditing
                    ? "Update Store"
                    : "Create Store"}
              </SpecialButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreForm;
