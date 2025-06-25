import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ProductFormData } from "../../components/InventoryComponents/CreateInventory/types";
import {
  needsVariations,
  shouldHideFields,
} from "../../components/InventoryComponents/CreateInventory/utils";
import ProductBasicInfo from "../../components/InventoryComponents/CreateInventory/ProductBasicInfo";
import PackConfiguration from "../../components/InventoryComponents/CreateInventory/PackConfiguration";
import AttributesConfiguration from "../../components/InventoryComponents/CreateInventory/AttributesConfiguration";
import VariationsConfiguration from "../../components/InventoryComponents/CreateInventory/VariationsConfiguration";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createProduct } from "../../store/slices/productsSlice";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentStore } from "../../store/selectors";
import useSuppliers from "../../hooks/useSuppliers";
import { fetchUser } from "../../store/slices/userSlice";

const CreateInventory: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const getStoreIdFromUrl = () => {
    const match = location.pathname.match(/store\/([a-f0-9-]+)\//i);
    return match ? match[1] : "";
  };

  const currentStore = useAppSelector(selectCurrentStore);
  const storeId = currentStore?.id || getStoreIdFromUrl();
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers(storeId);

  // const user = useAppSelector((state) => state.user.user);

  // Get user from Redux store
  const clientId = useAppSelector((state) => state.user.user?.clientId);
  // console.log("Client ID from Redux store:", clientId);
  // Add explicit types for calculateDiscounts
  const calculateDiscounts = (
    discountType: "percentage" | "fixed" | undefined,
    discountValue: number | string | undefined,
    price: number | string | undefined
  ) => {
    if (!discountValue || isNaN(Number(discountValue))) {
      return { discountAmount: 0, percentAmount: 0 };
    }
    if (discountType === "percentage") {
      const percent = parseFloat(String(discountValue));
      const amount = price ? (parseFloat(String(price)) * percent) / 100 : 0;
      return { discountAmount: 0, percentAmount: amount };
    } else if (discountType === "fixed") {
      return {
        discountAmount: parseFloat(String(discountValue)),
        percentAmount: 0,
      };
    }
    return { discountAmount: 0, percentAmount: 0 };
  };

  const buildApiPayload = () => {
    // Use clientId from Redux store
    const basePayload: any = {
      name: formData.productName,
      category: formData.category,
      ean: formData.ean,
      pluUpc: formData.pluUpc,
      supplierId: formData.supplierId || "",
      sku: formData.customSku,
      singleItemCostPrice: parseFloat(formData.itemCost) || 0,
      itemQuantity: parseInt(formData.quantity) || 0,
      msrpPrice: parseFloat(formData.msrpPrice) || 0,
      singleItemSellingPrice: parseFloat(formData.itemSellingCost) || 0,
      clientId: clientId, // Use clientId from Redux store
      storeId: storeId,
      hasVariants: hasVariants,
      packs: (formData.packDiscounts || []).map((pack: any) => {
        const { discountAmount, percentAmount } = calculateDiscounts(
          pack.discountType,
          pack.discountValue,
          formData.itemSellingCost
        );
        return {
          minimumSellingQuantity: pack.quantity,
          totalPacksQuantity: pack.totalPacksQuantity || 0,
          orderedPacksPrice: pack.orderedPacksPrice || 0,
          discountAmount,
          percentDiscount:
            pack.discountType === "percentage" ? pack.discountValue : 0,
        };
      }),
      // Add discountAmount and percentDiscount at root if needed (for non-variant products)
      discountAmount: (() => {
        if (formData.orderValueDiscountType === "fixed") {
          return parseFloat(formData.orderValueDiscountValue) || 0;
        }
        return 0;
      })(),
      percentDiscount: (() => {
        if (formData.orderValueDiscountType === "percentage") {
          return parseFloat(formData.orderValueDiscountValue) || 0;
        }
        return 0;
      })(),
      variants: [], // always include variants field for API structure
    };
    if (hasVariants) {
      console.log("🔍 Processing variants for API payload:");
      console.log("Raw variations data:", formData.variations);

      basePayload.variants = (formData.variations || []).map(
        (variant: any, index: number) => {
          // Use the correct field names from the Variation interface
          const price = variant.itemSellingCost || 0; // itemSellingCost is the selling price in Variation
          const msrpPrice = variant.msrpPrice || 0;

          console.log(`🔸 Variant ${index + 1}:`, {
            name: variant.name,
            itemSellingCost: variant.itemSellingCost,
            customSku: variant.customSku,
            msrpPrice: variant.msrpPrice,
            packDiscounts: variant.packDiscounts,
          });

          // Handle variant-level discounts
          const variantDiscountAmount = variant.discount || 0;
          const variantPercentDiscount = variant.orderValueDiscount || 0;          const mappedVariant = {
            name: variant.name || "",
            price,
            sku: variant.customSku || "",
            msrpPrice,
            discountAmount: variantDiscountAmount,
            percentDiscount: variantPercentDiscount,
            packs: (variant.packDiscounts || []).map((pack: any) => {
              const packPrice = pack.orderedPacksPrice || 0;
              const { discountAmount: packDiscountAmount } = calculateDiscounts(
                pack.discountType,
                pack.discountValue,
                packPrice
              );
              return {
                minimumSellingQuantity: pack.quantity || 0,
                totalPacksQuantity: pack.totalPacksQuantity || 0,
                orderedPacksPrice: packPrice,
                discountAmount: packDiscountAmount,
                percentDiscount:
                  pack.discountType === "percentage"
                    ? pack.discountValue || 0
                    : 0,
              };
            }),
          };

          console.log(`🔸 Mapped variant ${index + 1}:`, mappedVariant);
          return mappedVariant;
        }
      );
      console.log("✅ Final variants payload:", basePayload.variants);
    }

    console.log(
      "🚀 Complete API Payload being sent:",
      JSON.stringify(basePayload, null, 2)
    );
    return basePayload;
  };

  // Form state management
  const [showVariations, setShowVariations] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  // Main form data
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    price: "",
    // vendor: "",
    customSku: "",
    ean: "",
    pluUpc: "",
    individualItemQuantity: "1",
    itemCost: "",
    itemSellingCost: "",
    minSellingQuantity: "1",
    minOrderValue: "",
    msrpPrice: "",
    supplierId: "",
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
    const payload = buildApiPayload();
    console.log("API Payload:", payload);

    dispatch(createProduct(payload) as any).then((result: any) => {
      if (!result.error) {
        // navigate("/inventory");
        console.log("What to do?");
      }
    });

    // Example POST request (uncomment and adjust as needed)
    // fetch("/products/create", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // }).then(() => navigate("/inventory"));

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
  }; // Calculate progress percentage based on whether variants are enabled
  const calculateProgress = () => {
    if (hasVariants) {
      // For variants mode, only require basic product info and attributes
      const requiredFields = [
        formData.productName,
        formData.category,
        formData.price,
      ];

      const filledFields = requiredFields.filter(
        (field) => field && field.toString().trim() !== ""
      ).length;

      // Also check if attributes are properly configured
      const hasValidAttributes =
        formData.hasAttributes &&
        formData.attributes.length > 0 &&
        formData.attributes.every((attr) => attr.options.length >= 2);

      const attributeScore = hasValidAttributes ? 1 : 0;

      return Math.round(
        ((filledFields + attributeScore) / (requiredFields.length + 1)) * 100
      );
    } else {
      // For regular mode, require all fields as before
      const requiredFields = [
        formData.productName,
        formData.category,
        formData.price,
        // formData.vendor,
        formData.pluUpc,
        formData.individualItemQuantity,
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
    }
  };

  const progress = calculateProgress();

  useEffect(() => {
    // Fetch user info on mount to ensure user is loaded
    dispatch(fetchUser() as any).then((result: any) => {
      // result.payload will be the user data if fulfilled
      if (result && result.payload) {
        localStorage.setItem("clientId", result.payload.clientId || "");
      }
    });
  }, []);

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
            </div>{" "}
            {/* Enhanced Milestone Progress Indicator */}
            <div className="flex items-center space-x-8">
              {!showVariations && (
                <div className="flex items-center space-x-4">
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
              )}{" "}
              {/* Enhanced Step Indicator with Animation */}
              <div className="flex items-center space-x-6">
                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-500 transform ${
                    !showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg scale-105 shadow-[#0f4d57]/20"
                      : "bg-green-100 text-green-700 border border-green-200 shadow-green-100/50 shadow-md"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      !showVariations
                        ? "bg-white animate-pulse"
                        : "bg-green-500 animate-ping animation-duration-1000"
                    }`}
                  ></div>
                  <span className="text-sm font-semibold">Product Details</span>
                  {!showVariations && (
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                  )}
                  {showVariations && (
                    <svg
                      className="w-4 h-4 text-green-600 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {/* Enhanced Connection Line with Animation */}
                <div
                  className={`w-8 h-0.5 transition-all duration-500 transform ${
                    showVariations
                      ? "bg-gradient-to-r from-[#0f4d57] to-green-500 shadow-md"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-500 transform ${
                    showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg scale-105 shadow-[#0f4d57]/20"
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
      </div>{" "}
      {/* Animated Form Container */}
      <div className="relative z-10">
        {/* Product Variants Toggle Section */}
        {!showVariations && (
          <div className="max-w-6xl mx-auto px-6 pt-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 mb-6 animate-slideUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Product Variants
                    </h3>
                    <p className="text-sm text-gray-600">
                      {hasVariants
                        ? "Create multiple variations of this product with different attributes"
                        : "Enable this to create product variations (e.g., different sizes, colors, etc.)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${!hasVariants ? "text-gray-900" : "text-gray-500"}`}
                  >
                    Simple Product
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        // Reset form when toggling to ensure clean state
                        if (e.target.checked) {
                          // Enable attributes when variants are enabled
                          handleFormDataChange("hasAttributes", true);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 shadow-lg"></div>
                  </label>
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${hasVariants ? "text-gray-900" : "text-gray-500"}`}
                  >
                    With Variants
                  </span>
                </div>
              </div>

              {hasVariants && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Variant Mode Enabled</p>
                      <p className="text-blue-700">
                        You'll need to configure attributes first, then create
                        specific variations with their individual details
                        (vendor, SKU, pricing, etc.) in the next step.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                {" "}
                {/* Product Basic Information */}
                <div className="transform transition-all duration-300 hover:scale-[1.01] animate-slideUp">
                  <ProductBasicInfo
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    fileInputRef={
                      fileInputRef as React.RefObject<HTMLInputElement>
                    }
                    showOptionalFields={
                      hasVariants ? false : showOptionalFields
                    }
                    isVariantMode={hasVariants}
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    suppliersError={suppliersError}
                  />
                </div>{" "}
                {/* Configuration Sections - Only show if optional fields are visible and not in variant mode */}
                {!hasVariants && showOptionalFields && (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
                      />{" "}
                    </div>
                  </div>
                )}
                {/* Attributes Configuration - Always show but with different behavior in variant mode */}
                <div
                  className="transform transition-all duration-300 hover:scale-[1.01] animate-slideUp"
                  style={{ animationDelay: hasVariants ? "100ms" : "300ms" }}
                >
                  <AttributesConfiguration
                    hasAttributes={hasVariants ? true : formData.hasAttributes}
                    onToggle={(value) =>
                      hasVariants
                        ? null
                        : handleFormDataChange("hasAttributes", value)
                    }
                    attributes={formData.attributes}
                    onAttributesChange={(attributes) =>
                      handleFormDataChange("attributes", attributes)
                    }
                    /* Pass these props only if the component supports them */
                    /* If you need this functionality, you should update the AttributesConfiguration component interface */
                    /* to include these props or use a different approach to achieve the same behavior */
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
                  </button>{" "}
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
                          {hasVariants
                            ? "Please complete basic info and configure attributes with at least 2 options each"
                            : "Please complete all required fields"}
                        </span>
                      </div>
                    )}

                    {hasVariants ? (
                      // For variant mode, always show Next button
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
                    ) : hasMultipleAttributeOptions ? (
                      // For non-variant mode with attributes
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
                      // For simple product mode
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
                {" "}
                {/* Variations Configuration with enhanced styling */}
                <div className="transform transition-all duration-500 ease-in-out animate-slideUp">
                  {" "}
                  <VariationsConfiguration
                    variations={formData.variations}
                    attributes={formData.attributes}
                    onVariationsChange={(variations) =>
                      handleFormDataChange("variations", variations)
                    }
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    suppliersError={suppliersError}
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
