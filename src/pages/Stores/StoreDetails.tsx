import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaStore, FaCog, FaUpload, FaImage, FaArrowLeft } from "react-icons/fa";
import { SpecialButton } from "../../components/buttons";
import { uploadImageToCloudinary } from "../../services/cloudinary";
import apiClient from "../../services/api";
import { AxiosError } from "axios";

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
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "SEK", label: "SEK - Swedish Krona" },
];
const TAX_MODES = [
  { value: "exclusive", label: "Exclusive" },
  { value: "inclusive", label: "Inclusive" },
];

interface StoreSettings {
  currency: string;
  timezone: string;
  taxRate: number;
  taxMode: string;
  lowStockAlert: number;
  enableNotifications: boolean;
}

interface Store {
  name: string;
  email: string;
  address: string;
  phone: string;
  logoUrl?: string;
  status?: string;
  settings?: StoreSettings;
}

const initialStore: Store = {
  name: "",
  email: "",
  address: "",
  phone: "",
  logoUrl: "",
  settings: {
    currency: "",
    timezone: "",
    taxRate: 0,
    taxMode: "",
    lowStockAlert: 0,
    enableNotifications: false,
  },
};

const StoreDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store>(initialStore);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/store/${id}`);
        setStore(res.data.data);
        const storeData = {
          name: res.data.data.name,
          email: res.data.data.email,
          address: res.data.data.address,
          phone: res.data.data.phone,
          logoUrl: res.data.data.logoUrl || "",
          currency: res.data.data.settings?.currency || "USD",
          timezone: res.data.data.settings?.timezone || "America/New_York",
          taxRate: res.data.data.settings?.taxRate ?? 0,
          taxMode: res.data.data.settings?.taxMode || "exclusive",
          lowStockAlert: res.data.data.settings?.lowStockAlert ?? 10,
          enableNotifications:
            res.data.data.settings?.enableNotifications ?? true,
        };
        setForm(storeData);
        setLogoPreview(storeData.logoUrl);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(
            err.response?.data?.message || "Failed to fetch store details."
          );
        } else {
          setError("Failed to fetch store details.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStore();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      setForm((prev: any) => ({ ...prev, logoUrl: imageUrl }));
      setLogoPreview(imageUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!form.name || !form.email || !form.address || !form.phone) {
      setError("Please fill all required fields.");
      setSaving(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Invalid email address.");
      setSaving(false);
      return;
    }
    if (form.taxRate < 0 || form.taxRate > 1) {
      setError("Tax rate must be between 0 and 1.");
      setSaving(false);
      return;
    }
    if (form.lowStockAlert < 1) {
      setError("Low stock alert must be at least 1.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        address: form.address,
        phone: form.phone,
        logoUrl: form.logoUrl,
        currency: form.currency,
        timezone: form.timezone,
        taxRate: Number(form.taxRate),
        taxMode: form.taxMode,
        lowStockAlert: Number(form.lowStockAlert),
        enableNotifications: form.enableNotifications,
      };

      await apiClient.put(`/store/${id}`, payload);
      toast.success("Store updated successfully");
      setEditMode(false);
      setStore((prev: any) => ({
        ...prev,
        ...payload,
        settings: {
          currency: payload.currency,
          timezone: payload.timezone,
          taxRate: payload.taxRate,
          taxMode: payload.taxMode,
          lowStockAlert: payload.lowStockAlert,
          enableNotifications: payload.enableNotifications,
        },
      }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to update store.");
      toast.error(error.response?.data?.message || "Failed to update store.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
    setForm({
      name: store.name,
      email: store.email,
      address: store.address,
      phone: store.phone,
      logoUrl: store.logoUrl || "",
      currency: store.settings?.currency || "USD",
      timezone: store.settings?.timezone || "America/New_York",
      taxRate: store.settings?.taxRate ?? 0,
      taxMode: store.settings?.taxMode || "exclusive",
      lowStockAlert: store.settings?.lowStockAlert ?? 10,
      enableNotifications: store.settings?.enableNotifications ?? true,
    });
    setLogoPreview(store.logoUrl || "");
  };

  const handleBack = () => {
    navigate("/stores");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4d57]"></div>
              <span className="ml-2 text-gray-600">
                Loading store details...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <div className="text-center py-12">
              <div className="text-red-500 font-semibold text-lg">{error}</div>
              <SpecialButton
                onClick={handleBack}
                variant="primary"
                className="mt-4"
              >
                Back to Stores
              </SpecialButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!store || !form) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
              <FaStore className="text-teal-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#03414C]">
                {editMode ? "Edit Store" : "Store Details"}
              </h1>
              <p className="text-gray-600 text-sm">
                {editMode
                  ? "Update your store information and settings"
                  : "View and manage your store information"}
              </p>
            </div>
          </div>

          {editMode ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Store Information Section */}
              <div className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Store Information
                </h2>

                {/* Logo Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Store logo"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaImage className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                          uploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <FaUpload className="mr-2" />
                        {uploading ? "Uploading..." : "Upload Logo"}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your store name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="store@example.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123 Main St, City, State 12345"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
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
                      value={form.timezone}
                      onChange={handleChange}
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
                      value={form.currency}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate
                    </label>
                    <input
                      type="number"
                      name="taxRate"
                      min={0}
                      max={1}
                      step={0.01}
                      value={form.taxRate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Mode
                    </label>
                    <select
                      name="taxMode"
                      value={form.taxMode}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {TAX_MODES.map((mode) => (
                        <option key={mode.value} value={mode.value}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      name="lowStockAlert"
                      min={1}
                      value={form.lowStockAlert}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="enableNotifications"
                      checked={form.enableNotifications}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-teal-500 focus:ring-teal-500 mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable Notifications
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <SpecialButton
                  type="button"
                  variant="modal-cancel"
                  onClick={handleCancel}
                  disabled={saving || uploading}
                >
                  Cancel
                </SpecialButton>
                <SpecialButton
                  type="submit"
                  variant="modal-add"
                  disabled={saving || uploading}
                >
                  {saving ? "Saving..." : "Update Store"}
                </SpecialButton>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div>
              {/* Store Information Display */}
              <div className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Store Information
                </h2>

                {/* Logo Display */}
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mr-4">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt="Store logo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FaImage className="text-gray-400 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#03414C]">
                      {store.name}
                    </h3>
                    <p className="text-gray-600">{store.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{store.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <p className="text-gray-900 capitalize">{store.status}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">{store.address}</p>
                  </div>
                </div>
              </div>

              {/* Store Settings Display */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <FaCog className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Store Settings
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <p className="text-gray-900">
                      {TIMEZONES.find(
                        (tz) => tz.value === store.settings?.timezone
                      )?.label || store.settings?.timezone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <p className="text-gray-900">
                      {CURRENCIES.find(
                        (c) => c.value === store.settings?.currency
                      )?.label || store.settings?.currency}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate
                    </label>
                    <p className="text-gray-900">
                      {((store.settings?.taxRate ?? 0) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Mode
                    </label>
                    <p className="text-gray-900 capitalize">
                      {store.settings?.taxMode}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Alert
                    </label>
                    <p className="text-gray-900">
                      {store.settings?.lowStockAlert}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notifications
                    </label>
                    <p className="text-gray-900">
                      {store.settings?.enableNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 ">
                <SpecialButton
                  variant="primary"
                  onClick={() => setEditMode(true)}
                  className="border-black border-2 "
                >
                  Edit Store
                </SpecialButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;
