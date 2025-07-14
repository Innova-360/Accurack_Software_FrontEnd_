import React, { useState, useEffect, useCallback } from "react";
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

import { useProductCategories } from "../../hooks/useProductCategories";
import { useRef } from "react";

const CreateInventory: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  // Refs for Required fields
  const productNameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const pluRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const itemQuantityRef = useRef<HTMLInputElement>(null);
  const minOrderValueRef = useRef<HTMLInputElement>(null);
  const itemCost = useRef<HTMLInputElement>(null);
  const itemSellingCost = useRef<HTMLInputElement>(null);
  const minSellingQuantityRef = useRef<HTMLInputElement>(null);

  const clientId = useAppSelector((state) => state.user.user?.clientId);

  const {
    categories: productCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories();

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
    const basePayload: any = {
      name: formData.productName,
      categoryId: formData.category, // Now using categoryId instead of category
      ean: hasVariants ? "" : formData.ean, // Clear EAN for variants as each variant will have its own
      pluUpc: hasVariants ? "" : formData.pluUpc, // Clear PLU for variants as each variant will have its own
      supplierId: formData.supplierId, // Supplier is now always optional
      sku: hasVariants ? "" : formData.customSku, // Clear SKU for variants as each variant will have its own
      singleItemCostPrice: hasVariants ? 0 : parseFloat(formData.itemCost) || 0, // Clear cost for variants
      itemQuantity: hasVariants ? 0 : parseInt(formData.quantity) || 0, // Clear quantity for variants
      msrpPrice: hasVariants ? 0 : parseFloat(formData.msrpPrice) || 0, // Clear MSRP for variants
      singleItemSellingPrice: hasVariants
        ? 0
        : parseFloat(formData.itemSellingCost) || 0, // Clear selling price for variants
      clientId: clientId, // Use clientId from Redux store
      storeId: storeId,
      hasVariants: hasVariants,
      packs: hasVariants
        ? []
        : (formData.packDiscounts || []).map((pack: any) => {
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
        if (!hasVariants && formData.orderValueDiscountType === "fixed") {
          return parseFloat(formData.orderValueDiscountValue) || 0;
        }
        return 0;
      })(),
      percentDiscount: (() => {
        if (!hasVariants && formData.orderValueDiscountType === "percentage") {
          return parseFloat(formData.orderValueDiscountValue) || 0;
        }
        return 0;
      })(),
      variants: [],
    };

    if (hasVariants && formData.variations && formData.variations.length > 0) {
      basePayload.variants = formData.variations.map(
        (variant: any, index: number) => {
          const price = parseFloat(variant.itemSellingCost) || 0; // itemSellingCost is the selling price in Variation
          const costPrice = parseFloat(variant.itemCost) || 0; // Cost price for the variant
          const msrpPrice = parseFloat(variant.msrpPrice) || 0;
          const quantity = parseInt(variant.quantity) || 0;

          // Handle variant-level discounts
          const variantDiscountAmount = parseFloat(variant.discount) || 0;
          const variantPercentDiscount =
            parseFloat(variant.orderValueDiscount) || 0;

          const mappedVariant = {
            name: variant.name || `Variant ${index + 1}`,
            price,
            costPrice: costPrice, // Include cost price for variants
            sku: variant.customSku || "",
            ean: variant.ean || "", // Include EAN for variants
            pluUpc: variant.plu || variant.pluUpc || "",
            quantity,
            supplierId: variant.supplierId || "",
            msrpPrice,
            discountAmount: variantDiscountAmount,
            percentDiscount: variantPercentDiscount,
            // Include variant attributes for identification
            attributes: variant.attributes || {},
            packs: (variant.packDiscounts || []).map((pack: any) => {
              const packPrice = parseFloat(pack.orderedPacksPrice) || 0;
              const { discountAmount: packDiscountAmount } = calculateDiscounts(
                pack.discountType,
                pack.discountValue,
                packPrice
              );
              return {
                minimumSellingQuantity: parseInt(pack.quantity) || 0,
                totalPacksQuantity: parseInt(pack.totalPacksQuantity) || 0,
                orderedPacksPrice: packPrice,
                discountAmount: packDiscountAmount,
                percentDiscount:
                  pack.discountType === "percentage"
                    ? parseFloat(pack.discountValue) || 0
                    : 0,
              };
            }),
          };

          return mappedVariant;
        }
      );

      // Log the payload for debugging when variants are enabled
    }

    return basePayload;
  };

  // Form state management
  const [showVariations, setShowVariations] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Main form data
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    price: "",
    // vendor: "",
    customSku: "",
    ean: "",
    pluUpc: "",
    individualItemQuantity: "",
    itemCost: "",
    itemSellingCost: "",
    minSellingQuantity: "",
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
  const handleFormDataChange = useCallback(
    (field: keyof ProductFormData, value: any) => {
      setFormData((prev) => {
        const updatedFormData = { ...prev, [field]: value };

        // Remove red border if the field is filled
        const fieldRefMap: Partial<
          Record<
            keyof ProductFormData,
            React.RefObject<HTMLInputElement | HTMLSelectElement | null>
          >
        > = {
          productName: productNameRef,
          category: categoryRef,
          price: priceRef,
          pluUpc: pluRef,
          individualItemQuantity: itemQuantityRef,
          minOrderValue: minOrderValueRef,
          quantity: quantityRef,
          itemCost: itemCost,
          itemSellingCost: itemSellingCost,
          minSellingQuantity: minSellingQuantityRef,
        };

        const ref = fieldRefMap[field];
        if (ref?.current && value) {
          // Special validation for minSellingQuantity - should be > 0
          const isValid =
            field === "minSellingQuantity"
              ? parseInt(value.toString()) > 0
              : value.toString().trim() !== "" && value !== "0";

          if (isValid) {
            ref.current.classList.remove("border-red-500", "border-2");
          }
        }

        return updatedFormData;
      });
    },
    []
  );

  const handleNumericInput = (key: keyof ProductFormData, rawValue: string) => {
    const cleaned = rawValue.replace(/[^0-9]/g, ""); // removes everything except digits

    // Special handling for PLU field - if it was set from a scanned barcode, preserve it
    if (key === "pluUpc" && !cleaned && formData.pluUpc) {
      return; // Don't update if we're trying to clear a valid PLU
    }

    setFormData((prev) => ({
      ...prev,
      [key]: cleaned,
    }));

    // Remove red border if the field is filled
    const fieldRefMap: Partial<
      Record<
        keyof ProductFormData,
        React.RefObject<HTMLInputElement | HTMLSelectElement | null>
      >
    > = {
      productName: productNameRef,
      category: categoryRef,
      price: priceRef,
      pluUpc: pluRef,
      individualItemQuantity: itemQuantityRef,
      minOrderValue: minOrderValueRef,
      quantity: quantityRef,
      itemCost: itemCost,
      itemSellingCost: itemSellingCost,
      minSellingQuantity: minSellingQuantityRef,
    };

    const ref = fieldRefMap[key];
    if (ref?.current && cleaned) {
      // Special validation for minSellingQuantity - should be > 0
      const isValid =
        key === "minSellingQuantity"
          ? parseInt(cleaned) > 0
          : cleaned.trim() !== "" && cleaned !== "0";

      if (isValid) {
        ref.current.classList.remove("border-red-500", "border-2");
      }
    }
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
    setIsSubmitting(true);
    const payload = buildApiPayload();

    dispatch(createProduct(payload) as any)
      .then((result: any) => {
        setIsSubmitting(false);
        if (!result.error) {
          // Navigate to the correct inventory page using the actual storeId
          navigate(`/store/${storeId}/inventory/dashboard`);
        }
      })
      .catch((error: any) => {
        setIsSubmitting(false);
        console.error("Error creating product:", error);
      });
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
        formData.itemCost,
        formData.itemSellingCost,
      ];

      const filledFields = requiredFields.filter(
        (field) => field && field.toString().trim() !== ""
      ).length;
      return Math.round((filledFields / requiredFields.length) * 100);
    }
  };

  const progress = calculateProgress();

  // Handle barcode data from navigation state
  useEffect(() => {
    if (location.state?.scannedPLU) {
      setFormData((prev) => ({
        ...prev,
        pluUpc: location.state.scannedPLU,
      }));
    }
  }, [location.state]);

  // Additional effect to handle state that might be lost on navigation
  useEffect(() => {
    // Check if we have scanned PLU in state and form is empty
    if (location.state?.scannedPLU && !formData.pluUpc) {
      setFormData((prev) => ({
        ...prev,
        pluUpc: location.state.scannedPLU,
      }));
    }

    // Fallback: Check localStorage if navigation state is not available
    if (!location.state?.scannedPLU && !formData.pluUpc) {
      const storedPLU = localStorage.getItem("scannedPLU");
      if (storedPLU) {
        setFormData((prev) => ({
          ...prev,
          pluUpc: storedPLU,
        }));
        // Clear localStorage after using it
        localStorage.removeItem("scannedPLU");
      }
    }
  }, [location.state, formData.pluUpc]);

  const scrollToFirstEmptyField = () => {
    type FieldRef = React.RefObject<
      HTMLInputElement | HTMLSelectElement | null
    >;
    type FieldOrderItem = { ref: FieldRef; value: any };

    const fieldOrder: FieldOrderItem[] = hasVariants
      ? [
          // For variant mode - only basic fields required
          { ref: productNameRef, value: formData.productName },
          { ref: categoryRef, value: formData.category },
          { ref: priceRef, value: formData.price },
        ]
      : [
          // For regular mode - all fields required
          { ref: productNameRef, value: formData.productName },
          { ref: categoryRef, value: formData.category },
          { ref: priceRef, value: formData.price },
          { ref: pluRef, value: formData.pluUpc },
          { ref: itemQuantityRef, value: formData.individualItemQuantity },
          { ref: minOrderValueRef, value: formData.minOrderValue },
          { ref: quantityRef, value: formData.quantity },
          { ref: itemCost, value: formData.itemCost },
          { ref: itemSellingCost, value: formData.itemSellingCost },
          { ref: minSellingQuantityRef, value: formData.minSellingQuantity },
        ];

    // First, highlight all empty fields
    let firstEmptyField: FieldRef | null = null;

    fieldOrder.forEach(({ ref, value }) => {
      // Special validation for minSellingQuantity - should be > 0
      const isEmpty =
        ref === minSellingQuantityRef
          ? !value ||
            value.toString().trim() === "" ||
            parseInt(value.toString()) <= 0
          : !value || value.toString().trim() === "" || value === "0";

      if (isEmpty) {
        ref.current?.classList.add("border-red-500", "border-2");
        if (!firstEmptyField) {
          firstEmptyField = ref;
        }
      } else {
        ref.current?.classList.remove("border-red-500", "border-2");
      }
    });

    // Scroll to the first empty field
    const firstField = firstEmptyField as FieldRef | null;
    if (firstField && firstField.current) {
      firstField.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      firstField.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl"
          style={{}}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
          style={{}}
        ></div>
      </div>
      {/* Enhanced Header with Milestone Progress */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-24 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <button
                onClick={() => (showVariations ? handleBack() : navigate(-1))}
                className="group p-2 sm:p-3 text-gray-600 hover:text-[#0f4d57] hover:bg-gray-100/80 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform duration-200"
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#0f4d57] to-[#16a085] bg-clip-text text-transparent transition-all duration-300">
                  {showVariations
                    ? "Configure Product Variations"
                    : "Create New Product"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                  {showVariations
                    ? "Set up different variations of your product with unique attributes"
                    : "Add a new product to your inventory with detailed information"}
                </p>
              </div>
            </div>{" "}
            {/* Enhanced Milestone Progress Indicator */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 w-full sm:w-auto">
              {/* Enhanced Step Indicator with Animation */}
              <div className="flex items-center space-x-3 sm:space-x-6 order-1 sm:order-2">
                <div
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 rounded-full transition-all duration-500 transform ${
                    !showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg scale-105 shadow-[#0f4d57]/20"
                      : "bg-green-100 text-green-700 border border-green-200 shadow-green-100/50 shadow-md"
                  }`}
                >
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      !showVariations ? "bg-white" : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-xs sm:text-sm font-semibold">
                    Product Details
                  </span>
                  {/* No animation */}
                </div>
                {/* Enhanced Connection Line with Animation */}
                <div
                  className={`w-4 sm:w-8 h-0.5 ${
                    showVariations
                      ? "bg-gradient-to-r from-[#0f4d57] to-green-500 shadow-md"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 rounded-full transition-all duration-500 transform ${
                    showVariations
                      ? "bg-[#0f4d57] text-white shadow-lg scale-105 shadow-[#0f4d57]/20"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      showVariations ? "bg-white" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs sm:text-sm font-semibold">
                    Variations
                  </span>
                  {/* No animation */}
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Product Variants
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {hasVariants
                        ? "Create multiple variations of this product with different attributes"
                        : "Enable this to create product variations (e.g., different sizes, colors, etc.)"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <span
                    className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${!hasVariants ? "text-gray-900" : "text-gray-500"}`}
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
                    <div className="w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 shadow-lg"></div>
                  </label>
                  <span
                    className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${hasVariants ? "text-gray-900" : "text-gray-500"}`}
                  >
                    With Variants
                  </span>
                </div>
              </div>

              {hasVariants && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
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

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6">
          <div>
            {!showVariations ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Product Basic Information */}
                <div className="">
                  <ProductBasicInfo
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onHandleNumericInput={handleNumericInput}
                    showOptionalFields={
                      hasVariants ? false : showOptionalFields
                    }
                    isVariantMode={hasVariants}
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    suppliersError={suppliersError}
                    categories={productCategories}
                    categoriesLoading={categoriesLoading}
                    fieldRefs={{
                      productName: productNameRef,
                      category: categoryRef,
                      price: priceRef,
                      pluUpc: pluRef,
                      quantity: quantityRef,
                      individualItemQuantity: itemQuantityRef,
                      minOrderValue: minOrderValueRef,
                      minSellingQuantity: minSellingQuantityRef,
                      itemCost: itemCost,
                      itemSellingCost: itemSellingCost,
                    }}
                  />
                </div>{" "}
                {/* Configuration Sections - Only show if optional fields are visible and not in variant mode */}
                {!hasVariants && showOptionalFields && (
                  <div className="grid grid-cols-1 gap-6 sm:gap-8">
                    {/* Pack Configuration */}
                    <div className="">
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
                {hasVariants && (
                  <div>
                    <AttributesConfiguration
                      hasAttributes={
                        hasVariants ? true : formData.hasAttributes
                      }
                      onToggle={
                        hasVariants
                          ? () => {} // no-op when variants are on
                          : (value) =>
                              handleFormDataChange("hasAttributes", value)
                      }
                      attributes={formData.attributes}
                      onAttributesChange={(attributes) =>
                        handleFormDataChange("attributes", attributes)
                      }
                      isVariantMode={hasVariants} // <-- Pass the prop
                    />
                  </div>
                )}
                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 space-y-4 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
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
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    {progress < 100 && (
                      <div
                        onClick={scrollToFirstEmptyField}
                        className="cursor-pointer flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 sm:px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium text-center sm:text-left">
                          {hasVariants
                            ? "Click to see missing fields"
                            : "Click to see missing fields"}
                        </span>
                      </div>
                    )}

                    {hasVariants ? (
                      // For variant mode, always show Next button
                      <button
                        type="button"
                        onClick={(e) => {
                          if (progress < 100) {
                            e.preventDefault();
                            scrollToFirstEmptyField();
                            return;
                          }
                          handleNext();
                        }}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <span className="text-sm sm:text-base">
                          Next: Configure Variations
                        </span>
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
                        onClick={(e) => {
                          if (progress < 100) {
                            e.preventDefault();
                            scrollToFirstEmptyField();
                            return;
                          }
                          handleNext();
                        }}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <span className="text-sm sm:text-base">
                          Next: Configure Variations
                        </span>
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
                      // For simple product mode - Always visible Create Product button
                      <button
                        type="button"
                        onClick={(e) => {
                          if (progress < 100) {
                            e.preventDefault();
                            scrollToFirstEmptyField();
                            return;
                          }
                          if (!isSubmitting) {
                            handleSubmit(e);
                          }
                        }}
                        disabled={isSubmitting}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                          isSubmitting
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90 shadow-md"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
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
                            <span className="text-sm sm:text-base">
                              Creating Product...
                            </span>
                          </>
                        ) : (
                          <>
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
                            <span className="text-sm sm:text-base">
                              Create Product
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Variations Configuration with enhanced styling */}
                <div className="">
                  <VariationsConfiguration
                    variations={formData.variations}
                    attributes={formData.attributes}
                    onVariationsChange={(variations) =>
                      handleFormDataChange("variations", variations)
                    }
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    suppliersError={suppliersError}
                    categories={productCategories}
                    categoriesLoading={categoriesLoading}
                    categoriesError={categoriesError}
                  />
                </div>
                {/* Enhanced Action Buttons for Variations */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 space-y-4 sm:space-y-0">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
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
                    <span className="text-sm sm:text-base">
                      Back to Product Details
                    </span>
                  </button>

                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                    >
                      <span className="text-sm sm:text-base">Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 ${
                        isSubmitting
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#0f4d57] text-white hover:bg-[#0f4d57]/90"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
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
                          <span className="text-sm sm:text-base">
                            Creating Product...
                          </span>
                        </>
                      ) : (
                        <>
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
                          <span className="text-sm sm:text-base">
                            Create Product with Variations
                          </span>
                        </>
                      )}
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
