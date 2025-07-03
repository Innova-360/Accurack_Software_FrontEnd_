import React from "react";
import type { ProductFormData } from "./types";
import { useSelector, useDispatch } from "react-redux";
import { fetchInventorySuppliers } from "../../../store/slices/inventorySupplierSlice";
import type { RootState } from "../../../store";
import type { Supplier } from "../../../services/supplierAPI";
import {
  type ProductCategory,
  createProductCategory,
} from "../../../store/slices/productCategoriesSlice";

interface ProductBasicInfoProps {
  formData: ProductFormData;
  onFormDataChange: (field: keyof ProductFormData, value: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  showOptionalFields: boolean;
  isVariantMode?: boolean;
  // Add suppliers as props to avoid duplicate API calls
  suppliers?: Supplier[];
  suppliersLoading?: boolean;
  suppliersError?: string | null;
  // Add categories as props
  categories?: ProductCategory[];
  categoriesLoading?: boolean;
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  formData,
  onFormDataChange,
  fileInputRef,
  showOptionalFields,
  isVariantMode = false,
  suppliers: propSuppliers,
  suppliersLoading: propSuppliersLoading,
  suppliersError: propSuppliersError,
  categories: propCategories,
  categoriesLoading: propCategoriesLoading,
}) => {
  const dispatch = useDispatch();
  // Use suppliers from props if available, otherwise fall back to Redux
  const {
    suppliers: reduxSuppliers,
    loading: reduxSuppliersLoading,
    error: reduxSuppliersError,
  } = useSelector((state: RootState) => state.inventorySuppliers) as {
    suppliers: Supplier[];
    loading: boolean;
    error: string | null;
  };

  // Get categories from Redux store
  const {
    categories: reduxCategories,
    loading: reduxCategoriesLoading,
    creatingCategory,
  } = useSelector((state: RootState) => state.productCategories);

  // State for managing create category
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  // Use prop suppliers if available, otherwise use Redux suppliers
  const suppliers = propSuppliers || reduxSuppliers;
  const suppliersLoading = propSuppliersLoading ?? reduxSuppliersLoading;
  const suppliersError = propSuppliersError || reduxSuppliersError;

  // Use prop categories if available, otherwise use Redux categories
  const categories = propCategories || reduxCategories;
  const categoriesLoading = propCategoriesLoading ?? reduxCategoriesLoading;

  // Debug logging to see supplier state
  React.useEffect(() => {
    console.log("🔍 ProductBasicInfo - Suppliers data:", {
      propSuppliers: propSuppliers?.length || 0,
      reduxSuppliers: reduxSuppliers?.length || 0,
      finalSuppliers: suppliers?.length || 0,
      loading: suppliersLoading,
      error: suppliersError,
      isVariantMode,
      propSuppliersData: propSuppliers?.slice(0, 2),
      reduxSuppliersData: reduxSuppliers?.slice(0, 2),
      finalSuppliersData: suppliers?.slice(0, 2),
    });
  }, [
    propSuppliers,
    reduxSuppliers,
    suppliers,
    suppliersLoading,
    suppliersError,
    isVariantMode,
  ]);

  // Only fetch suppliers if not provided as props and not already loading/loaded
  React.useEffect(() => {
    // Skip fetching if suppliers are provided as props
    if (propSuppliers || propSuppliersLoading !== undefined) {
      return;
    }

    // Extract storeId from URL - try multiple patterns
    const pathname = window.location.pathname;
    let storeId = "";

    // Try different URL patterns
    const storeMatch = pathname.match(/store\/([^\/]+)/);
    const inventoryMatch = pathname.match(/inventory.*store[\/=]([^\/&]+)/);

    if (storeMatch) {
      storeId = storeMatch[1];
    } else if (inventoryMatch) {
      storeId = inventoryMatch[1];
    }

    console.log("🔍 Current pathname:", pathname);
    console.log("📦 Extracted storeId:", storeId);

    // Only fetch if we have a storeId and suppliers haven't been loaded yet
    if (
      storeId &&
      !suppliersLoading &&
      suppliers.length === 0 &&
      !suppliersError
    ) {
      console.log(
        "📦 Fetching suppliers for store (ProductBasicInfo):",
        storeId
      );
      dispatch(fetchInventorySuppliers({ storeId, page: 1, limit: 50 }) as any);
    }
  }, [
    dispatch,
    suppliers.length,
    suppliersLoading,
    suppliersError,
    propSuppliers,
    propSuppliersLoading,
  ]);

  // Calculate minimum order value when itemSellingCost or minSellingQuantity changes
  React.useEffect(() => {
    const sellingCost = parseFloat(formData.itemSellingCost) || 0;
    const minQuantity = parseInt(formData.minSellingQuantity) || 1;
    const calculatedMinOrder = sellingCost * minQuantity;

    if (calculatedMinOrder > 0) {
      const currentMinOrder = parseFloat(formData.minOrderValue) || 0;
      if (currentMinOrder < calculatedMinOrder) {
        onFormDataChange("minOrderValue", calculatedMinOrder.toFixed(2));
      }
    }
  }, [
    formData.itemSellingCost,
    formData.minSellingQuantity,
    formData.minOrderValue,
    onFormDataChange,
  ]);

  // Calculate discounted order value
  const calculateDiscountedValue = () => {
    const baseValue = parseFloat(formData.minOrderValue) || 0;
    const discountValue = parseFloat(formData.orderValueDiscountValue) || 0;

    if (formData.orderValueDiscountType === "percentage") {
      return baseValue - (baseValue * discountValue) / 100;
    } else if (formData.orderValueDiscountType === "fixed") {
      return baseValue - discountValue;
    }
    return baseValue;
  };

  const discountedOrderValue = calculateDiscountedValue();

  // Validation functions
  const isSellingCostValid = () => {
    const cost = parseFloat(formData.itemCost) || 0;
    const selling = parseFloat(formData.itemSellingCost) || 0;
    return selling >= cost;
  };

  const isMinOrderValueValid = () => {
    const sellingCost = parseFloat(formData.itemSellingCost) || 0;
    const minQuantity = parseInt(formData.minSellingQuantity) || 1;
    const minRequired = sellingCost * minQuantity;
    const currentValue = parseFloat(formData.minOrderValue) || 0;
    return currentValue >= minRequired;
  };

  // Prefill quantity if empty
  React.useEffect(() => {
    if (
      (!formData.quantity || formData.quantity === "") &&
      formData.individualItemQuantity &&
      formData.minSellingQuantity
    ) {
      const iiq = parseInt(formData.individualItemQuantity) || 0;
      const msq = parseInt(formData.minSellingQuantity) || 1;
      if (iiq && msq) {
        const prefill = Math.floor(iiq / msq);
        if (!isNaN(prefill) && prefill > 0) {
          onFormDataChange("quantity", prefill.toString());
        }
      }
    }
  }, [
    formData.individualItemQuantity,
    formData.minSellingQuantity,
    formData.quantity,
    onFormDataChange,
  ]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFormDataChange("imageFile", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        onFormDataChange("imagePreview", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryData = {
      name: newCategoryName.trim(),
      code: newCategoryName.trim().toUpperCase().replace(/\s+/g, "_"),
    };

    try {
      const result = await dispatch(createProductCategory(categoryData) as any);
      if (!result.error) {
        // Successfully created category, select it and reset state
        onFormDataChange("category", result.payload.id);
        setIsCreatingCategory(false);
        setNewCategoryName("");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  // Handle cancel create category
  const handleCancelCreateCategory = () => {
    setIsCreatingCategory(false);
    setNewCategoryName("");
    onFormDataChange("category", "");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-[#0f4d57] rounded-lg">
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Product Information
          </h2>
          <p className="text-gray-600">
            Enter the basic details of your product
          </p>
        </div>
      </div>{" "}
      {/* Primary Fields - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => onFormDataChange("productName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Category *
          </label>
          <select
            value={isCreatingCategory ? "create_new" : formData.category}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "create_new") {
                setIsCreatingCategory(true);
                onFormDataChange("category", "");
              } else {
                setIsCreatingCategory(false);
                onFormDataChange("category", value);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
            required
            disabled={categoriesLoading || isCreatingCategory}
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : "Select Category"}
            </option>
            <option value="create_new">+ Create New Category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {isCreatingCategory && (
            <div className="mt-2 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 30) {
                      setNewCategoryName(value);
                    }
                  }}
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter new category name (max 30 chars)"
                  disabled={creatingCategory}
                  maxLength={30}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                    if (e.key === "Escape") {
                      handleCancelCreateCategory();
                    }
                  }}
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  {/* Cancel/Cross Icon */}
                  <button
                    type="button"
                    onClick={handleCancelCreateCategory}
                    disabled={creatingCategory}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 disabled:opacity-50"
                    title="Cancel"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Submit/Tick Icon */}
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Create Category"
                  >
                    {creatingCategory ? (
                      <svg
                        className="w-4 h-4 animate-spin"
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
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
              </div>

              {/* Character count and preview */}
              <div className="flex justify-between text-xs">
                <div className="text-gray-500">
                  {newCategoryName.length}/30 characters
                </div>
                {newCategoryName.trim() && (
                  <div className="text-gray-500">
                    Code: {" "}
                    <span className="font-mono text-gray-700">
                      {newCategoryName.trim().toUpperCase().replace(/\s+/g, "_")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Brand Name{" "}
            <span className="text-gray-400 text-xs font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="text"
            value={formData.brandName || ""}
            onChange={(e) => onFormDataChange("brandName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
            placeholder="Enter brand name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Price *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onFormDataChange("price", e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
              placeholder="0.00"
              required
            />
          </div>
        </div>{" "}
      </div>{" "}
      {!isVariantMode && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Vendor *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => {
                  const selectedSupplierId = e.target.value;
                  onFormDataChange("supplierId", selectedSupplierId);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                required
              >
                <option value="">Select Vendor</option>
                {suppliersLoading && (
                  <option disabled>Loading suppliers...</option>
                )}
                {suppliersError && (
                  <option disabled>Error loading suppliers</option>
                )}
                {suppliers &&
                  suppliers.length > 0 &&
                  suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
              </select>
              {suppliersLoading && (
                <div className="text-xs text-gray-500 mt-1">
                  Loading suppliers...
                </div>
              )}
              {suppliersError && (
                <div className="text-xs text-red-500 mt-1">
                  {suppliersError}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Custom SKU{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                value={formData.customSku}
                onChange={(e) => onFormDataChange("customSku", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Optional custom SKU"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                EAN{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                value={formData.ean}
                onChange={(e) => onFormDataChange("ean", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="EAN barcode"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                PLU/UPC *
              </label>
              <input
                type="text"
                value={formData.pluUpc}
                onChange={(e) => onFormDataChange("pluUpc", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="PLU or UPC code"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Individual Item Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.individualItemQuantity}
                onChange={(e) =>
                  onFormDataChange("individualItemQuantity", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="1"
                required
              />
            </div>
          </div>
        </div>
      )}
      {/* Cost and Pricing Information - Hidden in variant mode */}
      {!isVariantMode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-[#0f4d57]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Cost & Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Individual Item Cost *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.itemCost}
                  onChange={(e) => onFormDataChange("itemCost", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Individual Item Selling Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.itemSellingCost}
                  onChange={(e) =>
                    onFormDataChange("itemSellingCost", e.target.value)
                  }
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                    !isSellingCostValid() &&
                    formData.itemCost &&
                    formData.itemSellingCost
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {!isSellingCostValid() &&
                formData.itemCost &&
                formData.itemSellingCost && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Selling cost must be ≥ item cost
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Minimum Selling Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.minSellingQuantity}
                onChange={(e) =>
                  onFormDataChange("minSellingQuantity", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                MSRP Price
              </label>
              <input
                type="number"
                value={formData.msrpPrice}
                onChange={(e) => onFormDataChange("msrpPrice", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. 29.99"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Minimum Order Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minOrderValue}
                  onChange={(e) =>
                    onFormDataChange("minOrderValue", e.target.value)
                  }
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                    !isMinOrderValueValid() && formData.minOrderValue
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {!isMinOrderValueValid() && formData.minOrderValue && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Min: $
                  {(
                    (parseFloat(formData.itemSellingCost) || 0) *
                    (parseInt(formData.minSellingQuantity) || 1)
                  ).toFixed(2)}
                </p>
              )}{" "}
            </div>
          </div>
        </div>
      )}
      {/* Order Value Discount - Hidden in variant mode */}
      {!isVariantMode && (
        <div className="bg-green-50 rounded-lg p-6 mb-8 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Order Value Discount (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Discount Type & Value
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.orderValueDiscountType}
                  onChange={(e) =>
                    onFormDataChange("orderValueDiscountType", e.target.value)
                  }
                  className="w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">No Discount</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <div className="flex-1 relative">
                  {formData.orderValueDiscountType === "fixed" && (
                    <span className="absolute left-3 top-3 text-gray-500">
                      $
                    </span>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={formData.orderValueDiscountValue}
                    onChange={(e) =>
                      onFormDataChange(
                        "orderValueDiscountValue",
                        e.target.value
                      )
                    }
                    disabled={!formData.orderValueDiscountType}
                    placeholder={
                      formData.orderValueDiscountType === "percentage"
                        ? "0-100"
                        : "0.00"
                    }
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-500 ${
                      formData.orderValueDiscountType === "fixed" ? "pl-8" : ""
                    }`}
                  />
                  {formData.orderValueDiscountType === "percentage" && (
                    <span className="absolute right-3 top-3 text-gray-500">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
            {formData.orderValueDiscountType &&
              formData.orderValueDiscountValue && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Discounted Value
                  </label>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Original:</span>
                      <span className="font-medium">
                        ${parseFloat(formData.minOrderValue || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-green-600 font-bold text-lg">
                      <span>Final Price:</span>
                      <span>${discountedOrderValue.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      You save: $
                      {(
                        parseFloat(formData.minOrderValue || "0") -
                        discountedOrderValue
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}{" "}
          </div>
        </div>
      )}
      {/* Secondary Fields - Conditionally Hidden */}
      {showOptionalFields && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-[#0f4d57]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Additional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => onFormDataChange("quantity", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Stock quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Product Image (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0f4d57] transition-all duration-200 text-sm text-gray-600 hover:text-[#0f4d57] hover:bg-gray-50"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
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
                  <span>
                    {formData.imageFile ? "Change Image" : "Upload Image"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {formData.imagePreview && (
            <div className="mb-6">
              <div className="w-32 h-32 relative">
                <img
                  src={formData.imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    onFormDataChange("imageFile", null);
                    onFormDataChange("imagePreview", "");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
              placeholder="Enter product description..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBasicInfo;
