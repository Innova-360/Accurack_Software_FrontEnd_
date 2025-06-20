import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ProductFormData } from "../../components/InventoryComponents/CreateInventory/types";
import {
  needsVariations,
  shouldHideFields,
} from "../../components/InventoryComponents/CreateInventory/utils";
import ProductBasicInfo from "../../components/InventoryComponents/CreateInventory/ProductBasicInfo";
import PackConfiguration from "../../components/InventoryComponents/CreateInventory/PackConfiguration";
import DiscountConfiguration from "../../components/InventoryComponents/CreateInventory/DiscountConfiguration";
import AttributesConfiguration from "../../components/InventoryComponents/CreateInventory/AttributesConfiguration";
import VariationsConfiguration from "../../components/InventoryComponents/CreateInventory/VariationsConfiguration";

const CreateInventory: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state management
  const [showVariations, setShowVariations] = useState(false);

  // Main form data
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    price: "",
    vendor: "",
    customSku: "",
    ean: "",
    pluUpc: "",
    itemCost: "",
    itemSellingCost: "",
    minSellingQuantity: "1",
    minOrderValue: "",
    orderValueDiscountType: "",
    orderValueDiscountValue: "",
    quantity: "",
    description: "",
    imageFile: null,
    imagePreview: "",
    hasPackSettings: false,
    packDiscounts: [],
    hasDiscountSettings: false,
    discountTiers: [],
    hasAttributes: false,
    attributes: [],
    variations: [],
  });

  // Helper functions
  const handleFormDataChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showOptionalFields = !shouldHideFields(
    formData.hasAttributes,
    formData.attributes,
    showVariations
  );

  const hasMultipleAttributeOptions = needsVariations(
    formData.hasAttributes,
    formData.attributes
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inventoryData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      itemCost: parseFloat(formData.itemCost) || 0,
      itemSellingCost: parseFloat(formData.itemSellingCost) || 0,
      minSellingQuantity: parseInt(formData.minSellingQuantity) || 1,
      minOrderValue: parseFloat(formData.minOrderValue) || 0,
      orderValueDiscountValue:
        parseFloat(formData.orderValueDiscountValue) || 0,
    };

    console.log("Inventory Data:", inventoryData);
    navigate("/inventory");
  };

  const handleNext = () => {
    setShowVariations(true);
  };

  const handleBack = () => {
    setShowVariations(false);
  };

  // Calculate progress percentage (removed sku from calculation)
  const calculateProgress = () => {
    const requiredFields = [
      formData.productName,
      formData.category,
      formData.price,
      formData.vendor,
      formData.itemCost,
      formData.itemSellingCost,
      formData.minSellingQuantity,
      formData.minOrderValue,
      formData.quantity,
    ];

    const filledFields = requiredFields.filter(
      (field) => field && field.toString().trim() !== ""
    ).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Enhanced Header with Milestone Progress */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-6">
              <button
                onClick={() =>
                  showVariations ? handleBack() : navigate("/inventory")
                }
                className="group p-3 text-gray-600 hover:text-[#0f4d57] hover:bg-gray-100/80 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <svg
                  className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0f4d57] to-[#16a085] bg-clip-text text-transparent transition-all duration-300">
                  {showVariations
                    ? "Configure Product Variations"
                    : "Create New Product"}
                </h1>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {showVariations
                    ? "Set up different variations of your product with unique attributes"
                    : "Add a new product to your inventory with detailed information"}
                </p>
              </div>
            </div>

            {/* Enhanced Milestone Progress Indicator */}
            <div className="flex items-center space-x-8">
              {!showVariations && (
                <div className="flex items-center space-x-4 bg-white/70 rounded-xl p-4 shadow-lg border border-gray-200/50">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      Completion
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {progress}% Complete
                    </div>
                  </div>
                  <div className="relative w-20 h-20">
                    {/* Background Circle */}
                    <svg
                      className="w-20 h-20 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    {/* Progress Circle */}
                    <svg
                      className="absolute inset-0 w-20 h-20 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-[#0f4d57] transition-all duration-1000 ease-out"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        style={{
                          filter:
                            progress > 75
                              ? "drop-shadow(0 0 8px rgba(15, 77, 87, 0.4))"
                              : "none",
                        }}
                      />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`text-sm font-bold transition-all duration-300 ${
                          progress > 75
                            ? "text-[#0f4d57] scale-110"
                            : "text-gray-600"
                        }`}
                      >
                        {progress}%
                      </div>
                    </div>
                    {/* Glow Effect */}
                    {progress > 75 && (
                      <div className="absolute inset-0 rounded-full bg-[#0f4d57]/10 animate-pulse"></div>
                    )}
                  </div>
                </div>
              )}

              {/* Step Indicator */}
              <div className="flex items-center space-x-6">
                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-500 ${
                    !showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg transform scale-105"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      !showVariations
                        ? "bg-white animate-pulse"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-sm font-semibold">Product Details</span>
                  {!showVariations && (
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                  )}
                </div>

                {/* Connection Line */}
                <div
                  className={`w-8 h-0.5 transition-all duration-500 ${
                    showVariations ? "bg-[#0f4d57]" : "bg-gray-300"
                  }`}
                ></div>

                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-500 ${
                    showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      showVariations ? "bg-white animate-pulse" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-sm font-semibold">Variations</span>
                  {showVariations && (
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Form Container */}
      <div className="relative z-10">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6">
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              showVariations
                ? "translate-x-0 opacity-100"
                : "translate-x-0 opacity-100"
            }`}
          >
            {!showVariations ? (
              <div className="space-y-8">
                {/* Product Basic Information */}
                <div className="transform transition-all duration-300 hover:scale-[1.01] animate-slideUp">
                  <ProductBasicInfo
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    fileInputRef={
                      fileInputRef as React.RefObject<HTMLInputElement>
                    }
                    showOptionalFields={showOptionalFields}
                  />
                </div>

                {/* Configuration Sections - Only show if optional fields are visible */}
                {showOptionalFields && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pack Configuration */}
                    <div
                      className="transform transition-all duration-300 hover:scale-[1.01] animate-slideUp"
                      style={{ animationDelay: "100ms" }}
                    >
                      <PackConfiguration
                        hasPackSettings={formData.hasPackSettings}
                        onToggle={(value) =>
                          handleFormDataChange("hasPackSettings", value)
                        }
                        packDiscounts={formData.packDiscounts}
                        onPackDiscountsChange={(discounts) =>
                          handleFormDataChange("packDiscounts", discounts)
                        }
                      />
                    </div>

                    {/* Discount Configuration */}
                    <div
                      className="transform transition-all duration-300 hover:scale-[1.01] animate-slideUp"
                      style={{ animationDelay: "200ms" }}
                    >
                      <DiscountConfiguration
                        hasDiscountSettings={formData.hasDiscountSettings}
                        onToggle={(value) =>
                          handleFormDataChange("hasDiscountSettings", value)
                        }
                        discountTiers={formData.discountTiers}
                        onDiscountTiersChange={(tiers) =>
                          handleFormDataChange("discountTiers", tiers)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Attributes Configuration */}
                <div
                  className="transform transition-all duration-300 hover:scale-[1.01] animate-slideUp"
                  style={{ animationDelay: "300ms" }}
                >
                  <AttributesConfiguration
                    hasAttributes={formData.hasAttributes}
                    onToggle={(value) =>
                      handleFormDataChange("hasAttributes", value)
                    }
                    attributes={formData.attributes}
                    onAttributesChange={(attributes) =>
                      handleFormDataChange("attributes", attributes)
                    }
                  />
                </div>

                {/* Enhanced Action Buttons */}
                <div
                  className="flex items-center justify-between pt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 animate-slideUp"
                  style={{ animationDelay: "400ms" }}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/inventory")}
                    className="group px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
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
                    <span>Cancel</span>
                  </button>

                  <div className="flex items-center space-x-4">
                    {progress < 100 && (
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 animate-pulse">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Please complete all required fields
                        </span>
                      </div>
                    )}

                    {hasMultipleAttributeOptions ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={progress < 100}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 ${
                          progress >= 100
                            ? "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <span>Next: Configure Variations</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={progress < 100}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 ${
                          progress >= 100
                            ? "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Create Product</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Variations Configuration with enhanced styling */}
                <div className="transform transition-all duration-500 ease-in-out animate-slideUp">
                  <VariationsConfiguration
                    variations={formData.variations}
                    attributes={formData.attributes}
                    onVariationsChange={(variations) =>
                      handleFormDataChange("variations", variations)
                    }
                  />
                </div>

                {/* Enhanced Action Buttons for Variations */}
                <div
                  className="flex items-center justify-between pt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 animate-slideUp"
                  style={{ animationDelay: "200ms" }}
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    className="group px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Back to Product Details</span>
                  </button>

                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate("/inventory")}
                      className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-[#0f4d57] text-white rounded-lg font-medium hover:bg-[#0f4d57]/90 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Create Product with Variations</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInventory;
