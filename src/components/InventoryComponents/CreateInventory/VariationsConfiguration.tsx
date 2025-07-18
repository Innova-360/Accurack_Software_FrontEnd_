import React from "react";
import type { Variation, Attribute, PackDiscount } from "./types";
import { generateId } from "./utils";
import { useSelector, useDispatch } from "react-redux";
import { fetchInventorySuppliers } from "../../../store/slices/inventorySupplierSlice";
import type { RootState } from "../../../store";
import type { Supplier } from "../../../services/supplierAPI";

interface VariationsConfigurationProps {
  variations: Variation[];
  attributes: Attribute[];
  onVariationsChange: (variations: Variation[]) => void;
  // Add suppliers as props to avoid duplicate API calls
  suppliers?: Supplier[];
  suppliersLoading?: boolean;
  suppliersError?: string | null;
  // Validation callback
  onValidationChange?: (validation: {
    isValid: boolean;
    errors: Record<string, string>;
    hasVariations: boolean;
  }) => void;
}

const VariationsConfiguration: React.FC<VariationsConfigurationProps> = ({
  variations,
  attributes,
  onVariationsChange,
  suppliers: propSuppliers,
  suppliersLoading: propSuppliersLoading,
  suppliersError: propSuppliersError,
  onValidationChange,
}) => {
  const dispatch = useDispatch();

  // State for validation errors
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  const {
    suppliers: reduxSuppliers,
    loading: reduxSuppliersLoading,
    error: reduxSuppliersError,
  } = useSelector((state: RootState) => state.inventorySuppliers) as {
    suppliers: Supplier[];
    loading: boolean;
    error: string | null;
  };

  const suppliers = propSuppliers || reduxSuppliers;
  const suppliersLoading = propSuppliersLoading ?? reduxSuppliersLoading;
  const suppliersError = propSuppliersError || reduxSuppliersError; // Only fetch suppliers if not provided as props and not already loading/loaded
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
      hasPackSettings: false,
      packDiscounts: [],
      hasDiscountTiers: false,
      discountTiers: [],
      imageFile: null,
      imagePreview: "",
      category: "",
    };
    onVariationsChange([...variations, newVariation]);
  };

  // Validation functions
  const validateRequiredField = (value: any, fieldName: string): string => {
    if (
      !value ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "number" && value <= 0)
    ) {
      return `${fieldName} is required`;
    }
    return "";
  };

  const validateVariation = (variation: Variation): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Required fields with * indicator - these match the UI labels
    const nameError = validateRequiredField(variation.name, "Variant Name");
    if (nameError) errors[`${variation.id}.name`] = nameError;

    const individualItemQuantityError = validateRequiredField(
      variation.individualItemQuantity,
      "Individual Item Quantity"
    );
    if (individualItemQuantityError)
      errors[`${variation.id}.individualItemQuantity`] =
        individualItemQuantityError;

    const itemCostError = validateRequiredField(
      variation.itemCost,
      "Individual Item Cost"
    );
    if (itemCostError) errors[`${variation.id}.itemCost`] = itemCostError;

    const itemSellingCostError = validateRequiredField(
      variation.itemSellingCost,
      "Individual Item Selling Price"
    );
    if (itemSellingCostError)
      errors[`${variation.id}.itemSellingCost`] = itemSellingCostError;

    const minSellingQuantityError = validateRequiredField(
      variation.minSellingQuantity,
      "Minimum Selling Quantity"
    );
    if (minSellingQuantityError)
      errors[`${variation.id}.minSellingQuantity`] = minSellingQuantityError;

    const minOrderValueError = validateRequiredField(
      variation.minOrderValue,
      "Minimum Order Value"
    );
    if (minOrderValueError)
      errors[`${variation.id}.minOrderValue`] = minOrderValueError;

    const quantityError = validateRequiredField(
      variation.quantity,
      "Stock Quantity"
    );
    if (quantityError) errors[`${variation.id}.quantity`] = quantityError;

    // PLU is now required
    const pluError = validateRequiredField(variation.plu, "PLU");
    if (pluError) errors[`${variation.id}.plu`] = pluError;

    // Business logic validations
    if (
      variation.itemSellingCost &&
      variation.itemCost &&
      parseFloat(variation.itemSellingCost.toString()) <
        parseFloat(variation.itemCost.toString())
    ) {
      errors[`${variation.id}.itemSellingCost`] =
        "Selling price must be greater than or equal to cost price";
    }

    return errors;
  };

  const validateAllVariations = (): Record<string, string> => {
    let allErrors: Record<string, string> = {};

    // Check if at least one variant exists
    if (variations.length === 0) {
      allErrors["variations.empty"] = "At least one variant is required";
    }

    // Validate each variation
    variations.forEach((variation) => {
      const variationErrors = validateVariation(variation);
      allErrors = { ...allErrors, ...variationErrors };
    });

    return allErrors;
  };

  const updateVariation = (id: string, field: keyof Variation, value: any) => {
    // Clear validation error for this field when user starts typing
    const errorKey = `${id}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

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

  // Calculate ordered box price based on quantity and item selling price
  const calculateOrderedBoxPrice = (
    quantity: number,
    itemSellingPrice: number
  ) => {
    return quantity * itemSellingPrice;
  };

  const addVariationPackDiscount = (variationId: string) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      // Auto-calculate the ordered box price based on quantity and item selling price
      const orderedPacksPrice = calculateOrderedBoxPrice(
        1,
        variation.itemSellingCost || 0
      );

      const newDiscount: PackDiscount = {
        id: generateId(),
        quantity: 1,
        discountType: "percentage",
        discountValue: 0,
        totalPacksQuantity: 0,
        orderedPacksPrice,
      };
      updateVariation(variationId, "packDiscounts", [
        ...variation.packDiscounts,
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
      const updatedDiscounts = variation.packDiscounts.map((d) => {
        if (d.id === discountId) {
          const updatedDiscount = { ...d, [field]: value };

          // Auto-calculate ordered box price when quantity changes
          if (field === "quantity" && variation.itemSellingCost) {
            updatedDiscount.orderedPacksPrice = calculateOrderedBoxPrice(
              value,
              variation.itemSellingCost
            );
          }

          return updatedDiscount;
        }
        return d;
      });

      updateVariation(variationId, "packDiscounts", updatedDiscounts);
    }
  };

  const removeVariationPackDiscount = (
    variationId: string,
    discountId: string
  ) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedDiscounts = variation.packDiscounts.filter(
        (d) => d.id !== discountId
      );
      updateVariation(variationId, "packDiscounts", updatedDiscounts);
    }
  };

  // Expose validation function to parent component
  React.useEffect(() => {
    const errors = validateAllVariations();
    setValidationErrors(errors);

    // Pass validation results to parent if onValidationChange prop is provided
    if (typeof onValidationChange === "function") {
      const hasErrors = Object.keys(errors).length > 0;
      onValidationChange({
        isValid: !hasErrors,
        errors: errors,
        hasVariations: variations.length > 0,
      });
    }
  }, [variations, onValidationChange]);

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

      {/* Show message when no variations exist */}
      {variations.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-yellow-800">
              At least one variant is required. Click "Add Variation" to get
              started.
            </span>
          </div>
        </div>
      )}

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
            validationErrors={validationErrors}
            onUpdate={updateVariation}
            onUpdateAttribute={updateVariationAttribute}
            onRemove={removeVariation}
            onAddPackDiscount={addVariationPackDiscount}
            onUpdatePackDiscount={updateVariationPackDiscount}
            onRemovePackDiscount={removeVariationPackDiscount}
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
  validationErrors: Record<string, string>;
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
}

const VariationCard: React.FC<VariationCardProps> = ({
  variation,
  index,
  attributes,
  suppliers,
  suppliersLoading,
  suppliersError,
  validationErrors,
  onUpdate,
  onUpdateAttribute,
  onRemove,
  onAddPackDiscount,
  onUpdatePackDiscount,
  onRemovePackDiscount,
}) => {
  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string): string => {
    return validationErrors[`${variation.id}.${fieldName}`] || "";
  };

  // Helper function to get input class with error styling
  const getInputClassName = (fieldName: string, baseClass: string): string => {
    const hasError = getFieldError(fieldName);
    return hasError
      ? `${baseClass} border-red-300 focus:ring-red-500 focus:border-red-500`
      : baseClass;
  };

  return (
    <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:mb-4 space-y-2 sm:space-y-0">
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
            Variant Name *
          </label>
          <input
            type="text"
            value={variation.name}
            onChange={(e) => onUpdate(variation.id, "name", e.target.value)}
            className={getInputClassName(
              "name",
              "w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            )}
            placeholder="e.g. Dark Roast"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PLU *
          </label>
          <input
            type="text"
            value={variation.plu || ""}
            onChange={(e) => onUpdate(variation.id, "plu", e.target.value)}
            className={getInputClassName(
              "plu",
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            )}
            placeholder="PLU"
            required
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
            className={getInputClassName(
              "minOrderValue",
              "w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent bg-blue-50"
            )}
            placeholder="Minimum Order Value"
            title="This field is auto-calculated but can be manually edited"
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
            className={getInputClassName(
              "individualItemQuantity",
              "w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            )}
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
            className={getInputClassName(
              "itemCost",
              "w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            )}
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
            className={getInputClassName(
              "itemSellingCost",
              "w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            )}
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
            className={getInputClassName(
              "minSellingQuantity",
              "w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            )}
            placeholder="Minimum Selling Quantity"
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
          {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom SKU (Optional)
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
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            MSRP Price (Optional)
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
          {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor <span className="text-gray-400 text-xs">(Optional)</span>
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
                    : "Select Vendor (Optional)"}
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
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
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
            {variation.packDiscounts.length === 0 && (
              <div className="text-xs text-gray-500 mb-2">
                No pack discounts added yet.
              </div>
            )}
            <div className="space-y-2">
              {" "}
              {variation.packDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2 bg-gray-50 rounded items-center border border-gray-200 relative group"
                >
                  {/* Pack Qty */}
                  <div className="flex flex-col">
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
                  {/* Discount Type */}
                  <div className="flex flex-col">
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
                  {/* Discount Value */}
                  <div className="flex flex-col">
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
                  {/* Total Packs */}
                  <div className="flex flex-col">
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
                  {/* Ordered Price */}
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      Ordered Price
                      <span
                        className="text-xs text-blue-600"
                        title="Auto-calculated: Items in Box × Item Price"
                      >
                        (auto)
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price"
                      value={discount.orderedPacksPrice?.toFixed(2) || "0.00"}
                      readOnly
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 text-blue-800 font-medium cursor-not-allowed"
                      title="Auto-calculated based on items in box and item selling price"
                    />
                  </div>
                  {/* Remove Button */}
                  <div className="flex items-center justify-end">
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
