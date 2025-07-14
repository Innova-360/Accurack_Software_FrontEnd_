import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createCustomer,
  updateCustomer,
} from "../../store/slices/customerSlice";
import type { CustomerFormData } from "../../types/customer";

const CreateCustomer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { id, customerId } = useParams<{ id: string; customerId?: string }>();

  // Get user and authentication state
  const userSliceUser = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Get clientId from userSlice
  const clientId = userSliceUser?.clientId;

  const { loading, error } = useAppSelector((state) => state.customers);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Check if we're editing an existing customer
  const isEditing = location.pathname.includes("/edit/");
  const existingCustomer = location.state?.customer;

  const [formData, setFormData] = useState<CustomerFormData>({
    customerName: "",
    customerAddress: "",
    phoneNumber: "",
    telephoneNumber: "",
    customerMail: "",
    storeId: id || "",
    clientId: clientId || "",
  });

  // Separate address fields
  const [addressFields, setAddressFields] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<CustomerFormData>>({});

  const getFullAddress = () => {
    const addressParts = [
      addressFields.street,
      addressFields.city,
      addressFields.state,
      addressFields.postalCode,
      addressFields.country,
    ].filter((part) => part.trim() !== "");
    return addressParts.join(", ");
  };

  const parseAddress = (fullAddress: string) => {
    if (!fullAddress || fullAddress.trim() === "") {
      return {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      };
    }

    const parts = fullAddress.split(",").map((part) => part.trim());
    return {
      street: parts[0] || "",
      city: parts[1] || "",
      state: parts[2] || "",
      postalCode: parts[3] || "",
      country: parts[4] || "",
    };
  };

  // Populate form if editing
  useEffect(() => {
    if (isEditing && existingCustomer) {
      setFormData({
        customerName: existingCustomer.customerName || "",
        customerAddress: existingCustomer.customerAddress || "",
        phoneNumber: existingCustomer.phoneNumber || "",
        telephoneNumber: existingCustomer.telephoneNumber || "",
        customerMail: existingCustomer.customerMail || "",
        storeId: id || "",
        clientId: clientId || "",
      });

      // Parse existing address into separate fields
      if (existingCustomer.customerAddress) {
        setAddressFields(parseAddress(existingCustomer.customerAddress));
      }
    }
  }, [isEditing, existingCustomer, id, clientId]);

  // Update storeId and clientId when they change
  useEffect(() => {
    if (id && clientId) {
      setFormData((prev) => ({
        ...prev,
        storeId: id,
        clientId: clientId,
      }));
    }
  }, [id, clientId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const errors: Partial<CustomerFormData> = {};

    if (!formData.customerName.trim()) {
      errors.customerName = "Customer name is required";
    }

    // Validate address fields
    if (!addressFields.city.trim()) {
      errors.customerAddress = "City is required";
    } else if (!addressFields.state.trim()) {
      errors.customerAddress = "State/Province is required";
    } else if (!addressFields.postalCode.trim()) {
      errors.customerAddress = "Postal code is required";
    } else if (!addressFields.country.trim()) {
      errors.customerAddress = "Country is required";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.customerMail.trim()) {
      errors.customerMail = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerMail)) {
      errors.customerMail = "Please enter a valid email address";
    }

    if (
      formData.telephoneNumber &&
      !/^[\d\s\-\+\(\)]+$/.test(formData.telephoneNumber)
    ) {
      errors.telephoneNumber = "Please enter a valid telephone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (
    field: keyof typeof addressFields,
    value: string
  ) => {
    setAddressFields((prev) => ({ ...prev, [field]: value }));

    // Clear address error when user starts typing in any address field
    if (formErrors.customerAddress) {
      setFormErrors((prev) => ({ ...prev, customerAddress: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill the form errors before submitting");
      return;
    }

    if (!id) {
      toast.error("Store ID is required");
      return;
    }

    if (!clientId) {
      toast.error(
        "Client ID is required. Please wait for user data to load or log in again."
      );
      return;
    }

    try {
      // Combine address fields into customerAddress
      const fullAddress = getFullAddress();
      const customerData = {
        ...formData,
        customerAddress: fullAddress,
        storeId: id,
        clientId: clientId,
      };

      if (isEditing && existingCustomer) {
        await dispatch(
          updateCustomer({
            id: existingCustomer.id,
            customerData,
          })
        ).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await dispatch(createCustomer(customerData)).unwrap();
        toast.success("Customer created successfully");
      }

      navigate(`/store/${id}/customer`);
    } catch (error: any) {
      console.error("Error submitting customer:", error);
      toast.error(
        error || `Failed to ${isEditing ? "update" : "create"} customer`
      );
    }
  };

  const handleCancel = () => {
    navigate(`/store/${id}/customer`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Customer" : "Add New Customer"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {isEditing
                  ? "Update customer information and address"
                  : "Create a new customer record with complete address"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.customerName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter customer name"
                />
                {formErrors.customerName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.customerName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.customerMail}
                  onChange={(e) =>
                    handleInputChange("customerMail", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.customerMail
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {formErrors.customerMail && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.customerMail}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.phoneNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  value={formData.telephoneNumber}
                  onChange={(e) =>
                    handleInputChange("telephoneNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.telephoneNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter telephone number"
                />
                {formErrors.telephoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.telephoneNumber}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={addressFields.street}
                      onChange={(e) =>
                        handleAddressChange("street", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFields.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFields.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter state/province"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFields.postalCode}
                      onChange={(e) =>
                        handleAddressChange("postalCode", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFields.country}
                      onChange={(e) =>
                        handleAddressChange("country", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
                {formErrors.customerAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.customerAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </button>
            <SpecialButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-6 py-2 bg-[#03414C] text-white rounded-lg hover:bg-[#03414C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                <span>{isEditing ? "Update Customer" : "Create Customer"}</span>
              )}
            </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
