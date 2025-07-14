import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaEdit,
  FaUpload,
  FaSpinner,
} from "react-icons/fa";
import { SpecialButton } from "../../components/buttons";
import toast from "react-hot-toast";
import apiClient from "../../services/api";
import { uploadImageToCloudinary } from "../../services/cloudinary";

interface BusinessProfile {
  id: string;
  businessName: string;
  contactNo: string;
  website: string;
  address: string;
  logoUrl: string;
}

const BusinessSettings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactNo: "",
    website: "",
    address: "",
    logoUrl: "",
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("/invoice/get-business/details");

      if (response.data.success && response.data.data) {
        const profileData = response.data.data;

        setProfile(profileData);
        setFormData({
          businessName: profileData.businessName || "",
          contactNo: profileData.contactNo || "",
          website: profileData.website || "",
          address: profileData.address || "",
          logoUrl: profileData.logoUrl || "",
        });
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      if (error.response?.status === 404) {
        // No business profile exists yet

        setProfile(null);
        setIsEditing(true);
      } else {
        toast.error("Failed to fetch business profile");
        console.error("Business profile fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      return newData;
    });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    try {
      setSaving(true);

      if (profile) {
        // Update existing profile
        await handleUpdateProfile();
      } else {
        // Create new profile
        await handleCreateProfile();
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save business profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async () => {
    const response = await apiClient.post(
      "/invoice/set-business/details",
      formData
    );

    if (response.data.success) {
      const createdProfile = response.data.data || formData;

      setProfile(createdProfile);
      updateFormData(createdProfile);
      setIsEditing(false);

      toast.success("Business profile created successfully!");
      await fetchBusinessProfile();
    } else {
      toast.error(
        "Failed to create: " + (response.data.message || "Unknown error")
      );
    }
  };

  const handleUpdateProfile = async () => {
    const response = await apiClient.put(
      "/invoice/update-business/details",
      formData
    );

    if (response.data.success) {
      const updatedProfile = response.data.data || formData;

      setProfile(updatedProfile);
      updateFormData(updatedProfile);
      setIsEditing(false);

      toast.success("Business profile updated successfully!");
      await fetchBusinessProfile();
    } else {
      toast.error(
        "Failed to update: " + (response.data.message || "Unknown error")
      );
    }
  };

  const updateFormData = (profileData: any) => {
    setFormData({
      businessName: profileData.businessName || formData.businessName,
      contactNo: profileData.contactNo || formData.contactNo,
      website: profileData.website || formData.website,
      address: profileData.address || formData.address,
      logoUrl: profileData.logoUrl || formData.logoUrl,
    });
  };

  const handleCancel = () => {
    if (profile) {
      // Reset form data to original profile data
      setFormData({
        businessName: profile.businessName || "",
        contactNo: profile.contactNo || "",
        website: profile.website || "",
        address: profile.address || "",
        logoUrl: profile.logoUrl || "",
      });
      setIsEditing(false);
    } else {
      // If no profile exists, go back or reset to empty
      setFormData({
        businessName: "",
        contactNo: "",
        website: "",
        address: "",
        logoUrl: "",
      });
      navigate(-1);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      toast.loading("Uploading image...", { id: "upload" });

      const imageUrl = await uploadImageToCloudinary(file);

      setFormData((prev) => ({
        ...prev,
        logoUrl: imageUrl,
      }));

      toast.success("Image uploaded successfully", { id: "upload" });
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image: " + error.message, { id: "upload" });
    } finally {
      setUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03414C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <FaArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#03414C] to-[#0f4d57] rounded-full flex items-center justify-center">
                  <FaBuilding className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {!profile && isEditing
                      ? "Create Business Profile"
                      : "Business Settings"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {!profile && isEditing
                      ? "Set up your business information"
                      : "Manage your business information"}
                  </p>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <SpecialButton
                variant="inventory-primary"
                onClick={() => {
                  setIsEditing(true);
                }}
                icon={<FaEdit />}
              >
                Edit Business
              </SpecialButton>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <SpecialButton
                  variant="inventory-primary"
                  onClick={handleSave}
                  icon={<FaSave />}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : profile
                      ? "Update Business"
                      : "Create Business"}
                </SpecialButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Info - Remove in production */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Form Header */}
          {!profile && isEditing && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#03414C] to-[#0f4d57] rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaBuilding className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Setup Your Business Profile
                  </h2>
                  <p className="text-sm text-white/80">
                    Fill in your business details to get started
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your business name"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaBuilding className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {profile?.businessName || "Not provided"}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter contact number"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <p className="text-gray-900">
                      {profile?.contactNo || "Not provided"}
                    </p>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="https://your-website.com"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    {profile?.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#03414C] hover:underline font-medium"
                      >
                        {profile.website}
                      </a>
                    ) : (
                      <p className="text-gray-900">Not provided</p>
                    )}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                    placeholder="Enter your complete business address"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {profile?.address || "Not provided"}
                    </p>
                  </div>
                )}
              </div>

              {/* Business Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Logo
                </label>
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Current Logo Preview */}
                    {formData.logoUrl && (
                      <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <img
                          src={formData.logoUrl}
                          alt="Current Logo"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-green-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Current logo
                          </p>
                          <p className="text-xs text-green-600">
                            Click below to change
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={triggerImageUpload}
                      disabled={uploading}
                      className="w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#03414C] hover:bg-[#03414C]/5 transition-all duration-200 flex flex-col items-center space-y-3 text-gray-600 hover:text-[#03414C] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <FaSpinner className="animate-spin w-8 h-8" />
                          <span className="text-sm font-medium">
                            Uploading...
                          </span>
                          <span className="text-xs text-gray-500">
                            Please wait
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <FaUpload className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-semibold">
                            {formData.logoUrl
                              ? "Change Logo"
                              : "Upload Business Logo"}
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG up to 5MB
                          </span>
                        </>
                      )}
                    </button>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-6 border border-gray-200">
                    <div className="flex items-center space-x-4">
                      {profile?.logoUrl ? (
                        <img
                          src={profile.logoUrl}
                          alt="Business Logo"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                          <FaBuilding className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 font-semibold">
                          {profile?.logoUrl ? "Business Logo" : "No Logo"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {profile?.logoUrl
                            ? "Logo is set for your business"
                            : "Click edit to upload a logo"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
