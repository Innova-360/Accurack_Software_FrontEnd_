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
      console.log("Fetching business profile...");

      const response = await apiClient.get("/invoice/get-business/details");
      console.log("Fetch response:", response.data);

      if (response.data.success && response.data.data) {
        const profileData = response.data.data;
        console.log("Setting profile data:", profileData);

        setProfile(profileData);
        setFormData({
          businessName: profileData.businessName || "",
          contactNo: profileData.contactNo || "",
          website: profileData.website || "",
          address: profileData.address || "",
          logoUrl: profileData.logoUrl || "",
        });

        console.log("Business profile loaded successfully");
      } else {
        console.log("No data in response or success false");
        setProfile(null);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      if (error.response?.status === 404) {
        // No business profile exists yet
        console.log("404 - No business profile found, starting in edit mode");
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
    console.log(`Input changed - ${name}:`, value);

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log("Updated form data:", newData);
      return newData;
    });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    console.log("Saving form data:", formData);

    try {
      setSaving(true);

      // Use update API if profile exists, create API if new
      const apiEndpoint = profile
        ? "/invoice/update-business/details"
        : "/invoice/set-business/details";

      const response = await apiClient.put(apiEndpoint, formData);

      console.log("Save response:", response.data);

      if (response.data.success) {
        // Update profile with the saved data
        const updatedProfile = response.data.data || formData;
        console.log("Updated profile:", updatedProfile);

        setProfile(updatedProfile);

        // Also update formData to ensure consistency
        setFormData({
          businessName: updatedProfile.businessName || formData.businessName,
          contactNo: updatedProfile.contactNo || formData.contactNo,
          website: updatedProfile.website || formData.website,
          address: updatedProfile.address || formData.address,
          logoUrl: updatedProfile.logoUrl || formData.logoUrl,
        });

        setIsEditing(false);
        toast.success(
          profile
            ? "Business profile updated successfully"
            : "Business profile created successfully"
        );

        // Force re-fetch to ensure sync
        await fetchBusinessProfile();
      } else {
        toast.error(
          "Failed to save: " + (response.data.message || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update business profile"
      );
    } finally {
      setSaving(false);
    }
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
      console.log("Image uploaded:", imageUrl);
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
                    Business Settings
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your business information
                  </p>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <SpecialButton
                variant="inventory-primary"
                onClick={() => {
                  console.log("Edit button clicked, current profile:", profile);
                  console.log("Current form data:", formData);
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
                  {saving ? "Saving..." : "Save Changes"}
                </SpecialButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Info - Remove in production */}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-colors duration-200"
                    placeholder="Enter your business name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile?.businessName || "Not provided"}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-colors duration-200"
                    placeholder="Enter contact number"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile?.contactNo || "Not provided"}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-colors duration-200"
                    placeholder="https://your-website.com"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile?.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#03414C] hover:underline"
                      >
                        {profile.website}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-colors duration-200"
                    placeholder="Enter your business address"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile?.address || "Not provided"}
                  </p>
                )}
              </div>

              {/* Business Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Current Logo Preview */}
                    {formData.logoUrl && (
                      <div className="flex items-center space-x-3">
                        <img
                          src={formData.logoUrl}
                          alt="Current Logo"
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="text-sm text-gray-600">
                          Current logo
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={triggerImageUpload}
                      disabled={uploading}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#03414C] transition-colors duration-200 flex flex-col items-center space-y-2 text-gray-600 hover:text-[#03414C]"
                    >
                      {uploading ? (
                        <>
                          <FaSpinner className="animate-spin w-6 h-6" />
                          <span className="text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-6 h-6" />
                          <span className="text-sm font-medium">
                            {formData.logoUrl ? "Change Logo" : "Upload Logo"}
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
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
                  <div className="flex items-center space-x-3">
                    {profile?.logoUrl ? (
                      <img
                        src={profile.logoUrl}
                        alt="Business Logo"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaBuilding className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      {/* <p className="text-gray-900 font-medium">
                        {profile?.logoUrl
                          ? "Logo uploaded"
                          : "No logo uploaded"}
                      </p>
                      {profile?.logoUrl && (
                        <p className="text-sm text-gray-500">
                          Click edit to change
                        </p>
                      )} */}
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
