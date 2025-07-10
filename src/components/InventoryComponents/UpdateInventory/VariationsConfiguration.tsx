import React from "react";
import type { Variation, Attribute, PackDiscount, DiscountTier } from "./types";
import { generateId } from "./utils";
import { useSelector, useDispatch } from "react-redux";
import { fetchInventorySuppliers } from "../../../store/slices/inventorySupplierSlice";
import type { RootState } from "../../../store";
import type { Supplier } from "../../../services/supplierAPI";
import {
  type ProductCategory,
  createProductCategory,
} from "../../../store/slices/productCategoriesSlice";

interface VariationsConfigurationProps {
  variations: Variation[];
  attributes: Attribute[];
  onVariationsChange: (variations: Variation[]) => void;
  // Add suppliers as props to avoid duplicate API calls
  suppliers?: Supplier[];
  suppliersLoading?: boolean;
  suppliersError?: string | null;
  // Add categories as props to avoid duplicate API calls
  categories?: ProductCategory[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
}

const VariationsConfiguration: React.FC<VariationsConfigurationProps> = ({
  variations,
  attributes,
  onVariationsChange,
  suppliers: propSuppliers,
  suppliersLoading: propSuppliersLoading,
  suppliersError: propSuppliersError,
  categories: propCategories,
  categoriesLoading: propCategoriesLoading,
  categoriesError: propCategoriesError,
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

  // Use categories from props if available, otherwise fall back to Redux
  const {
    categories: reduxCategories,
    loading: reduxCategoriesLoading,
    error: reduxCategoriesError,
    creatingCategory,
  } = useSelector((state: RootState) => state.productCategories) as {
    categories: ProductCategory[];
    loading: boolean;
    error: string | null;
    creatingCategory: boolean;
  };

  // Use prop suppliers if available, otherwise use Redux suppliers
  const suppliers = propSuppliers || reduxSuppliers;
  const suppliersLoading = propSuppliersLoading ?? reduxSuppliersLoading;
  const suppliersError = propSuppliersError || reduxSuppliersError;

  // Use prop categories if available, otherwise use Redux categories
  const categories = propCategories || reduxCategories;
  const categoriesLoading = propCategoriesLoading ?? reduxCategoriesLoading;
  const categoriesError = propCategoriesError || reduxCategoriesError; // Only fetch suppliers if not provided as props and not already loading/loaded
  React.useEffect(() => {
    // Skip fetching if suppliers are provided as props
    if (propSuppliers || propSuppliersLoading !== undefined) {
      return;
    }

    // Extract storeId from URL (works for /store/:id/)
    const match = window.location.pathname.match(/store\/(.+?)(?:\/|$)/);
    const storeId = match ? match[1] : "";

    // Only fetch if we have a storeId and suppliers haven't been loaded yet
    if (
      storeId &&
      !suppliersLoading &&
      suppliers.length === 0 &&
      !suppliersError
    ) {
      console.log("📦 Fetching suppliers for store:", storeId);
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

  const addVariation = () => {
    const individualItemQuantity = 1;
    const minSellingQuantity = 1;
    const itemSellingCost = 0;

    const newVariation: Variation = {
      id: generateId(),
      attributeCombination: {},
      name: "",
      brandName: "",
      ean: "",
      individualItemQuantity,
      itemCost: 0,
      itemSellingCost,
      minSellingQuantity,
      msrpPrice: 0,
      minOrderValue: itemSellingCost * minSellingQuantity, // Auto-calculate
      orderValueDiscount: 0,
      description: "",
      quantity: Math.floor(individualItemQuantity / minSellingQuantity), // Auto-calculate
      price: 0,
      plu: "",
      discount: 0,
      customSku: "",
      supplierId: "",
      imageFile: null, // Added to match the interface
      imagePreview: "", // Added to match the interface
      hasPackSettings: false,
      packDiscounts: [],
      hasDiscountTiers: false,
      discountTiers: [],
    };
    onVariationsChange([...variations, newVariation]);
  };

  const updateVariation = (id: string, field: keyof Variation, value: any) => {
    onVariationsChange(
      variations.map((variation) => {
        if (variation.id === id) {
          const updatedVariation = { ...variation, [field]: value };

          // Auto-calculate Stock Quantity when Individual Item Quantity or Minimum Selling Quantity changes
          if (
            field === "individualItemQuantity" ||
            field === "minSellingQuantity"
          ) {
            const individualQty =
              field === "individualItemQuantity"
                ? value
                : variation.individualItemQuantity;
            const minSellingQty =
              field === "minSellingQuantity"
                ? value
                : variation.minSellingQuantity;

            if (individualQty && minSellingQty) {
              updatedVariation.quantity = Math.floor(
                individualQty / minSellingQty
              );
            }
          }

          // Auto-calculate Minimum Order Value when Individual Item Selling Price or Minimum Selling Quantity changes
          if (field === "itemSellingCost" || field === "minSellingQuantity") {
            const sellingPrice =
              field === "itemSellingCost" ? value : variation.itemSellingCost;
            const minSellingQty =
              field === "minSellingQuantity"
                ? value
                : variation.minSellingQuantity;

            if (sellingPrice && minSellingQty) {
              updatedVariation.minOrderValue = sellingPrice * minSellingQty;
            }
          }

          return updatedVariation;
        }
        return variation;
      })
    );
  };

  const updateVariationAttribute = (
    variationId: string,
    attributeName: string,
    value: string
  ) => {
    onVariationsChange(
      variations.map((variation) =>
        variation.id === variationId
          ? {
              ...variation,
              attributeCombination: {
                ...variation.attributeCombination,
                [attributeName]: value,
              },
            }
          : variation
      )
    );
  };

  const removeVariation = (id: string) => {
    onVariationsChange(variations.filter((variation) => variation.id !== id));
  };

  const addVariationPackDiscount = (variationId: string) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const newDiscount: PackDiscount = {
        id: generateId(),
        quantity: 1,
        discountType: "percentage",
        discountValue: 0,
        totalPacksQuantity: 0,
        orderedPacksPrice: 0,
      };
      updateVariation(variationId, "packDiscounts", [
        ...(variation.packDiscounts || []),
        newDiscount,
      ]);
    }
  };

  const updateVariationPackDiscount = (
    variationId: string,
    discountId: string,
    field: keyof PackDiscount,
    value: any
  ) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedDiscounts = (variation.packDiscounts || []).map((d) =>
        d.id === discountId ? { ...d, [field]: value } : d
      );
      updateVariation(variationId, "packDiscounts", updatedDiscounts);
    }
  };

  const removeVariationPackDiscount = (
    variationId: string,
    discountId: string
  ) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedDiscounts = (variation.packDiscounts || []).filter(
        (d) => d.id !== discountId
      );
      updateVariation(variationId, "packDiscounts", updatedDiscounts);
    }
  };

  const addVariationDiscountTier = (variationId: string) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const newTier: DiscountTier = {
        id: generateId(),
        minQuantity: 1,
        discountValue: 0,
        discountType: "percentage",
      };
      updateVariation(variationId, "discountTiers", [
        ...variation.discountTiers,
        newTier,
      ]);
    }
  };

  const updateVariationDiscountTier = (
    variationId: string,
    tierId: string,
    field: keyof DiscountTier,
    value: any
  ) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedTiers = variation.discountTiers.map((t) =>
        t.id === tierId ? { ...t, [field]: value } : t
      );
      updateVariation(variationId, "discountTiers", updatedTiers);
    }
  };

  const removeVariationDiscountTier = (variationId: string, tierId: string) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedTiers = variation.discountTiers.filter(
        (t) => t.id !== tierId
      );
      updateVariation(variationId, "discountTiers", updatedTiers);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-4 space-y-3 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Product Variations
        </h3>
        <button
          type="button"
          onClick={addVariation}
          className="w-full sm:w-auto px-4 py-2 bg-[#0f4d57] text-white rounded-md hover:bg-[#0f4d57]/90 transition-colors text-sm sm:text-base"
        >
          Add Variation
        </button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {variations.map((variation, index) => (
          <VariationCard
            key={variation.id}
            variation={variation}
            index={index}
            attributes={attributes}
            suppliers={suppliers}
            suppliersLoading={suppliersLoading}
            suppliersError={suppliersError}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            creatingCategory={creatingCategory}
            onUpdate={updateVariation}
            onUpdateAttribute={updateVariationAttribute}
            onRemove={removeVariation}
            onAddPackDiscount={addVariationPackDiscount}
            onUpdatePackDiscount={updateVariationPackDiscount}
            onRemovePackDiscount={removeVariationPackDiscount}
            onAddDiscountTier={addVariationDiscountTier}
            onUpdateDiscountTier={updateVariationDiscountTier}
            onRemoveDiscountTier={removeVariationDiscountTier}
          />
        ))}
      </div>
    </div>
  );
};

interface VariationCardProps {
  variation: Variation;
  index: number;
  attributes: Attribute[];
  suppliers: Supplier[];
  suppliersLoading: boolean;
  suppliersError: string | null;
  categories: ProductCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  creatingCategory: boolean;
  onUpdate: (id: string, field: keyof Variation, value: any) => void;
  onUpdateAttribute: (
    variationId: string,
    attributeName: string,
    value: string
  ) => void;
  onRemove: (id: string) => void;
  onAddPackDiscount: (variationId: string) => void;
  onUpdatePackDiscount: (
    variationId: string,
    discountId: string,
    field: keyof PackDiscount,
    value: any
  ) => void;
  onRemovePackDiscount: (variationId: string, discountId: string) => void;
  onAddDiscountTier: (variationId: string) => void;
  onUpdateDiscountTier: (
    variationId: string,
    tierId: string,
    field: keyof DiscountTier,
    value: any
  ) => void;
  onRemoveDiscountTier: (variationId: string, tierId: string) => void;
}

const VariationCard: React.FC<VariationCardProps> = ({
  variation,
  index,
  attributes,
  suppliers,
  suppliersLoading,
  suppliersError,
  categories,
  categoriesLoading,
  creatingCategory,
  onUpdate,
  onUpdateAttribute,
  onRemove,
  onAddPackDiscount,
  onUpdatePackDiscount,
  onRemovePackDiscount,
}) => {
  const dispatch = useDispatch();

  // State for managing category creation for this variation
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryData = {
      name: newCategoryName.trim(),
      code: newCategoryName.trim().toUpperCase().replace(/\s+/g, "_"),
      description: `Auto-created category: ${newCategoryName.trim()}`,
    };

    try {
      const result = await dispatch(createProductCategory(categoryData) as any);
      if (result.payload && result.payload.id) {
        // Successfully created category, select it and reset state
        onUpdate(variation.id, "category", result.payload.id);
        setIsCreatingCategory(false);
        setNewCategoryName("");
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
        <h4 className="text-sm sm:text-base font-medium text-gray-900">
          Variation {index + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(variation.id)}
          className="text-red-500 hover:text-red-700 transition-colors text-sm sm:text-base px-2 py-1 sm:px-0 sm:py-0"
        >
          Remove
        </button>
      </div>

      {/* Attribute Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {attributes.map((attribute) => (
          <div key={attribute.id}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              {attribute.name}
            </label>
            <select
              value={variation.attributeCombination[attribute.name] || ""}
              onChange={(e) =>
                onUpdateAttribute(variation.id, attribute.name, e.target.value)
              }
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            >
              <option value="">Select {attribute.name}</option>
              {attribute.options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Variation Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Variant Name
          </label>
          <input
            type="text"
            value={variation.name}
            onChange={(e) => onUpdate(variation.id, "name", e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="e.g. Dark Roast"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          {isCreatingCategory ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                placeholder="Enter new category name"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || creatingCategory}
                  className="px-3 py-1 bg-[#0f4d57] text-white text-sm rounded hover:bg-[#0a3b43] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingCategory ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setNewCategoryName("");
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <select
              value={variation.category || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "create_new") {
                  setIsCreatingCategory(true);
                  onUpdate(variation.id, "category", "");
                } else {
                  onUpdate(variation.id, "category", value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : !categories || categories.length === 0
                    ? "Select an option below"
                    : "Select Category"}
              </option>
              <option value="create_new">+ Create New Category</option>
              {categories && categories.length > 0 && (
                <>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          )}

          {/* Show helpful message when no categories exist */}
          {!categoriesLoading &&
            (!categories || categories.length === 0) &&
            !isCreatingCategory && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-800 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      No categories found. Create your first category.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="px-3 py-1 bg-[#0f4d57] text-white text-sm rounded hover:bg-[#0a3b43] transition-colors"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            )}

          {/* Helper text when categories exist */}
          {!categoriesLoading &&
            categories &&
            categories.length > 0 &&
            !isCreatingCategory && (
              <div className="mt-1 text-xs text-gray-500">
                Don't see your category? Select "+ Create New Category" from the
                dropdown above.
              </div>
            )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Brand Name (Optional)
          </label>
          <input
            type="text"
            value={variation.brandName || ""}
            onChange={(e) =>
              onUpdate(variation.id, "brandName", e.target.value)
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Brand Name"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            EAN (Optional)
          </label>
          <input
            type="text"
            value={variation.ean || ""}
            onChange={(e) => onUpdate(variation.id, "ean", e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="EAN"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Individual Item Quantity *
          </label>
          <input
            type="number"
            value={variation.individualItemQuantity || 1}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "individualItemQuantity",
                parseInt(e.target.value) || 1
              )
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Individual Item Quantity"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Individual Item Cost *
          </label>
          <input
            type="number"
            step="0.01"
            value={variation.itemCost || 0}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "itemCost",
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Individual Item Cost"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Individual Item Selling Price *
          </label>
          <input
            type="number"
            step="0.01"
            value={variation.itemSellingCost || 0}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "itemSellingCost",
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Individual Item Selling Price"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Minimum Selling Quantity *
          </label>
          <input
            type="number"
            value={variation.minSellingQuantity || 1}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "minSellingQuantity",
                parseInt(e.target.value) || 1
              )
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Minimum Selling Quantity"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            MSRP Price
          </label>
          <input
            type="number"
            step="0.01"
            value={variation.msrpPrice || 0}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "msrpPrice",
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="MSRP Price"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Minimum Order Value *
            <span
              className="text-xs text-gray-400 cursor-help"
              title="Auto-calculated: Individual Item Selling Price × Minimum Selling Quantity"
            >
              (calc)
            </span>
          </label>
          <input
            type="number"
            value={variation.minOrderValue || 0}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "minOrderValue",
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent bg-blue-50"
            placeholder="Minimum Order Value"
            title="This field is auto-calculated but can be manually edited"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Order Value Discount (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={variation.orderValueDiscount || 0}
            onChange={(e) =>
              onUpdate(
                variation.id,
                "orderValueDiscount",
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Order Value Discount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={variation.description || ""}
            onChange={(e) =>
              onUpdate(variation.id, "description", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Description"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor *
          </label>
          <select
            value={variation.supplierId}
            onChange={(e) => {
              const selectedSupplierId = e.target.value;
              onUpdate(variation.id, "supplierId", selectedSupplierId);
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent ${
              !suppliersLoading &&
              !suppliersError &&
              (!suppliers || suppliers.length === 0)
                ? "bg-gray-100 cursor-not-allowed text-gray-500"
                : ""
            }`}
            required={suppliers && suppliers.length > 0}
            disabled={
              !suppliersLoading &&
              !suppliersError &&
              (!suppliers || suppliers.length === 0)
            }
          >
            <option value="">
              {suppliersLoading
                ? "Loading suppliers..."
                : suppliersError
                  ? "Error loading suppliers"
                  : !suppliers || suppliers.length === 0
                    ? "No suppliers available"
                    : "Select Vendor"}
            </option>
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
            <div className="text-xs text-red-500 mt-1">{suppliersError}</div>
          )}
          {/* Show helpful message when no suppliers exist */}
          {!suppliersLoading &&
            !suppliersError &&
            (!suppliers || suppliers.length === 0) && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center space-x-2 text-yellow-800 text-xs">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No suppliers available</span>
                </div>
              </div>
            )}
        </div>{" "}
        <div>
          {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom SKU
          </label>
          <input
            type="text"
            value={variation.customSku}
            onChange={(e) =>
              onUpdate(variation.id, "customSku", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PLU
          </label>
          <input
            type="text"
            value={variation.plu || ""}
            onChange={(e) => onUpdate(variation.id, "plu", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="PLU"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Stock Quantity *
            <span
              className="text-xs text-gray-400 cursor-help"
              title="Auto-calculated: Individual Item Quantity ÷ Minimum Selling Quantity"
            >
              (calc)
            </span>
          </label>
          <input
            type="number"
            min="0"
            value={variation.quantity || 0}
            onChange={(e) =>
              onUpdate(variation.id, "quantity", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent bg-blue-50"
            placeholder="Stock quantity"
            required
            title="This field is auto-calculated but can be manually edited"
          />
        </div>
      </div>

      {/* Pack Settings Toggle */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={variation.hasPackSettings}
              onChange={(e) =>
                onUpdate(variation.id, "hasPackSettings", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0f4d57]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f4d57]"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">
            Pack Settings
          </span>
        </div>

        {variation.hasPackSettings && (
          <div className="ml-6 space-y-3">
            <div className="mb-2 border-b pb-2 flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800 flex items-center gap-1">
                Pack Discounts
                <span
                  className="text-xs text-gray-400 ml-1"
                  title="Offer discounts for buying in packs (e.g. 6-pack, 12-pack)"
                >
                  ?
                </span>
              </span>
            </div>
            {/* {variation.packDiscounts.length === 0 && (
              <div className="text-xs text-gray-500 mb-2">
                No pack discounts added yet.
              </div>
            )} */}
            <div className="space-y-2">
              {" "}
              {(variation.packDiscounts || []).map((discount) => (
                <div
                  key={discount.id}
                  className="grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded items-center border border-gray-200 relative group"
                >
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Pack Qty<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={discount.quantity}
                      onChange={(e) =>
                        onUpdatePackDiscount(
                          variation.id,
                          discount.id,
                          "quantity",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={discount.discountType}
                      onChange={(e) =>
                        onUpdatePackDiscount(
                          variation.id,
                          discount.id,
                          "discountType",
                          e.target.value
                        )
                      }
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                    >
                      <option value="percentage">% (Percent)</option>
                      <option value="fixed">₹ (Fixed)</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Discount Value<span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0.01}
                        step="0.01"
                        placeholder="Value"
                        value={discount.discountValue}
                        onChange={(e) =>
                          onUpdatePackDiscount(
                            variation.id,
                            discount.id,
                            "discountValue",
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded w-full focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent pr-8"
                        required
                      />
                      <span className="absolute right-2 text-gray-400 text-xs">
                        {discount.discountType === "percentage" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Total Packs
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Total"
                      value={discount.totalPacksQuantity || ""}
                      onChange={(e) =>
                        onUpdatePackDiscount(
                          variation.id,
                          discount.id,
                          "totalPacksQuantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Ordered Price
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price"
                      value={discount.orderedPacksPrice || ""}
                      onChange={(e) =>
                        onUpdatePackDiscount(
                          variation.id,
                          discount.id,
                          "orderedPacksPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        onRemovePackDiscount(variation.id, discount.id)
                      }
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"
                      title="Remove discount"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onAddPackDiscount(variation.id)}
                className="px-4 py-1.5 bg-[#0f4d57] text-white rounded shadow hover:bg-[#0f4d57]/90 transition-colors text-sm font-medium flex items-center gap-1"
              >
                + Add Pack Discount
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariationsConfiguration;
