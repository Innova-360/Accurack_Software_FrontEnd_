import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaArrowLeft, FaSave, FaEdit, FaUpload } from "react-icons/fa";
import { SpecialButton } from "../../components/buttons";
import toast from "react-hot-toast";
import apiClient from "../../services/api";

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
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const response = await apiClient.get("/api/v1/business");
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          businessName: response.data.data.businessName || "",
          contactNo: response.data.data.contactNo || "",
          website: response.data.data.website || "",
          address: response.data.data.address || "",
          logoUrl: response.data.data.logoUrl || "",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No business profile exists yet
        setProfile(null);
        setIsEditing(true); // Start in edit mode for new business
      } else {
        toast.error("Failed to fetch business profile");
        console.error("Business profile fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.patch("/api/v1/business", formData);
      if (response.data.success) {
        setProfile(response.data.data);
        setIsEditing(false);
        toast.success("Business profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update business profile");
      console.error("Business profile update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || "",
        contactNo: profile.contactNo || "",
        website: profile.website || "",
        address: profile.address || "",
        logoUrl: profile.logoUrl || "",
      });
      setIsEditing(false);
    } else {
      navigate(-1);
    }
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
                  <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
                  <p className="text-sm text-gray-600">Manage your business information</p>
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <SpecialButton
                variant="inventory-primary"
                onClick={() => setIsEditing(true)}
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
                  <p className="text-gray-900 py-2">{profile?.businessName || "Not provided"}</p>
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
                  <p className="text-gray-900 py-2">{profile?.contactNo || "Not provided"}</p>
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
                  <p className="text-gray-900 py-2">{profile?.address || "Not provided"}</p>
                )}
              </div>

              {/* Logo URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                {isEditing ? (
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03414C]/20 focus:border-[#03414C] transition-colors duration-200"
                      placeholder="https://your-logo-url.com/logo.png"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <FaUpload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {profile?.logoUrl ? (
                      <img
                        src={profile.logoUrl}
                        alt="Business Logo"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaBuilding className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <p className="text-gray-900">{profile?.logoUrl || "No logo uploaded"}</p>
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
