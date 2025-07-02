import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { uploadImageToCloudinary } from "../../services/cloudinary"; // Adjust path as needed
import { FaCloudUploadAlt } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

const initialState = {
  clientId: "",
  businessName: "",
  contactNo: "",
  website: "",
  address: "",
  logoUrl: "",
};

 

const validateUrl = (url) => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const BusinessForm = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    // If called from button, trigger file input click
    if (!e || !e.target || e.type === "click") {
      fileInputRef.current?.click();
      return;
    }
    // If called from file input change
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, logoUrl: url }));
      toast.success("Logo uploaded!");
    } catch (err) {
      toast.error("Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!form.clientId || !form.businessName || !form.contactNo) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!validatePhone(form.contactNo)) {
      toast.error("Invalid phone number format.");
      return;
    }
    if (form.website && !validateUrl(form.website)) {
      toast.error("Invalid website URL.");
      return;
    }
    setSubmitting(true);
    const payload = { ...form };
    toast.loading("Registering business...", { id: "submit-toast" });
    try {
      await axios.post("/api/v1/business", payload);
      toast.success("Business registered!", { id: "submit-toast" });
      setForm(initialState);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Registration failed.",
        { id: "submit-toast" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-[#043E49] mb-2 text-center">Business Registration</h2>
        <p className="text-gray-500 mb-6 text-center">Register your business to get started</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client ID */}
          {/* <div>
            <label className="block text-sm font-medium text-[#043E49] mb-1">Client ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              placeholder="Unique client ID"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#043E49]"
              required
            />
          </div> */}
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-[#043E49] mb-1">Business Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="Your business name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#043E49]"
              required
            />
          </div>
          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-[#043E49] mb-1">Contact Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="contactNo"
              value={form.contactNo}
              onChange={handleChange}
              placeholder="e.g. +1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#043E49]"
              required
            />
          </div>
          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-[#043E49] mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#043E49]"
            />
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[#043E49] mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Business address"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#043E49]"
              rows={2}
            />
          </div>
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-[#043E49] mb-1">Logo</label>
          <div className="flex items-center space-x-4">
      {/* Upload Button */}
      <button
  type="button"
  onClick={handleLogoUpload}
  disabled={logoUploading}
  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#043E49] text-white rounded hover:bg-[#032B2E] disabled:opacity-50 disabled:cursor-not-allowed"
>
  <FaCloudUploadAlt className="w-5 h-5" />
  <span>{logoUploading ? "Uploading..." : "Upload your Logo"}</span>
</button>


      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        className="hidden"
        disabled={logoUploading}
      />

      {/* Spinner */}
      {logoUploading && (
        <FiLoader className="animate-spin text-[#043E49] w-5 h-5" />
      )}

      {/* Uploaded Logo Preview */}
      {form.logoUrl && (
        <img
          src={form.logoUrl}
          alt="Logo"
          className="w-10 h-10 rounded object-cover border lg:ml-[100px]"
        />
      )}
    </div>

          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-[#043E49] text-white rounded hover:bg-[#032B2E] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <FiLoader className="animate-spin w-5 h-5" /> : ''}
            {submitting ? "Registering..." : "Register Business"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessForm;
