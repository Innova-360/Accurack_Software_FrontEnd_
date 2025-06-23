import React, { useRef } from "react";
import type { Variation, Attribute, PackDiscount, DiscountTier } from "./types";
import { generateId } from "./utils";

interface VariationsConfigurationProps {
  variations: Variation[];
  attributes: Attribute[];
  onVariationsChange: (variations: Variation[]) => void;
}

const VariationsConfiguration: React.FC<VariationsConfigurationProps> = ({
  variations,
  attributes,
  onVariationsChange,
}) => {
  const addVariation = () => {
    const newVariation: Variation = {
      id: generateId(),
      attributeCombination: {},
      name: "",
      brandName: "",
      ean: "",
      individualItemQuantity: 1,
      itemCost: 0,
      itemSellingCost: 0,
      minSellingQuantity: 1,
      msrpPrice: 0,
      minOrderValue: 0,
      orderValueDiscount: 0,
      description: "",
      quantity: 0,
      price: 0,
      plu: "",
      discount: 0,
      vendor: "",
      customSku: "",
      imageFile: null,
      imagePreview: "",
      hasPackSettings: false,
      packDiscounts: [],
      hasDiscountTiers: false,
      discountTiers: [],
    };
    onVariationsChange([...variations, newVariation]);
  };

  const updateVariation = (id: string, field: keyof Variation, value: any) => {
    onVariationsChange(
      variations.map((variation) =>
        variation.id === id ? { ...variation, [field]: value } : variation
      )
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

  const handleVariationImageUpload = (
    variationId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      updateVariation(variationId, "imageFile", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        updateVariation(
          variationId,
          "imagePreview",
          e.target?.result as string
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariationPackDiscount = (variationId: string) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const newDiscount: PackDiscount = {
        id: generateId(),
        quantity: 1,
        discountType: "percentage",
        discountValue: 0,
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
      const updatedDiscounts = variation.packDiscounts.map((d) =>
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
      const updatedDiscounts = variation.packDiscounts.filter(
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Product Variations
        </h3>
        <button
          type="button"
          onClick={addVariation}
          className="px-4 py-2 bg-[#0f4d57] text-white rounded-md hover:bg-[#0f4d57]/90 transition-colors"
        >
          Add Variation
        </button>
      </div>

      <div className="space-y-6">
        {variations.map((variation, index) => (
          <VariationCard
            key={variation.id}
            variation={variation}
            index={index}
            attributes={attributes}
            onUpdate={updateVariation}
            onUpdateAttribute={updateVariationAttribute}
            onRemove={removeVariation}
            onImageUpload={handleVariationImageUpload}
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
  onUpdate: (id: string, field: keyof Variation, value: any) => void;
  onUpdateAttribute: (
    variationId: string,
    attributeName: string,
    value: string
  ) => void;
  onRemove: (id: string) => void;
  onImageUpload: (
    variationId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
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
  onUpdate,
  onUpdateAttribute,
  onRemove,
  onImageUpload,
  onAddPackDiscount,
  onUpdatePackDiscount,
  onRemovePackDiscount,
  onAddDiscountTier,
  onUpdateDiscountTier,
  onRemoveDiscountTier,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Variation {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(variation.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Attribute Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {attributes.map((attribute) => (
          <div key={attribute.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {attribute.name}
            </label>
            <select
              value={variation.attributeCombination[attribute.name] || ""}
              onChange={(e) =>
                onUpdateAttribute(variation.id, attribute.name, e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variant Name
          </label>
          <input
            type="text"
            value={variation.name}
            onChange={(e) => onUpdate(variation.id, "name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="e.g. Dark Roast"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={variation.category || ""}
            onChange={(e) => onUpdate(variation.id, "category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Category"
            list={`category-list-${variation.id}`}
          />
          {/* Optionally, you can provide a datalist for suggestions */}
          <datalist id={`category-list-${variation.id}`}>
            <option value="Beverages" />
            <option value="Snacks" />
            <option value="Dairy" />
            <option value="Produce" />
            {/* Add more default categories as needed */}
          </datalist>
          <span className="text-xs text-gray-500">
            Type to add a custom category.
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name (Optional)
          </label>
          <input
            type="text"
            value={variation.brandName || ""}
            onChange={(e) =>
              onUpdate(variation.id, "brandName", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Brand Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EAN (Optional)
          </label>
          <input
            type="text"
            value={variation.ean || ""}
            onChange={(e) => onUpdate(variation.id, "ean", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="EAN"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Individual Item Quantity"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Individual Item Cost"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Individual Item Selling Price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Minimum Selling Quantity"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="MSRP Price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Order Value *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            placeholder="Minimum Order Value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            Vendor
          </label>
          <input
            type="text"
            value={variation.vendor}
            onChange={(e) => onUpdate(variation.id, "vendor", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
          />
        </div>
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
            Description
          </label>
          <input
            type="text"
            value={variation.description}
            onChange={(e) =>
              onUpdate(variation.id, "description", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onImageUpload(variation.id, e)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-[#0f4d57] transition-colors text-sm text-gray-600 hover:text-[#0f4d57]"
          >
            {variation.imageFile ? "Change Image" : "Upload Image"}
          </button>
        </div>
      </div>

      {variation.imagePreview && (
        <div className="mb-4">
          <img
            src={variation.imagePreview}
            alt="Variation preview"
            className="w-24 h-24 object-cover rounded-md border"
          />
        </div>
      )}

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
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Pack Discounts
              </span>
              <button
                type="button"
                onClick={() => onAddPackDiscount(variation.id)}
                className="px-2 py-1 bg-[#0f4d57] text-white rounded text-xs hover:bg-[#0f4d57]/90 transition-colors"
              >
                Add
              </button>
            </div>
            {variation.packDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded"
              >
                <input
                  type="number"
                  placeholder="Qty"
                  value={discount.quantity}
                  onChange={(e) =>
                    onUpdatePackDiscount(
                      variation.id,
                      discount.id,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
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
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">$</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Value"
                  value={discount.discountValue}
                  onChange={(e) =>
                    onUpdatePackDiscount(
                      variation.id,
                      discount.id,
                      "discountValue",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    onRemovePackDiscount(variation.id, discount.id)
                  }
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount Tiers Toggle */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={variation.hasDiscountTiers}
              onChange={(e) =>
                onUpdate(variation.id, "hasDiscountTiers", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0f4d57]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f4d57]"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">
            Discount Tiers
          </span>
        </div>

        {variation.hasDiscountTiers && (
          <div className="ml-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Discount Tiers
              </span>
              <button
                type="button"
                onClick={() => onAddDiscountTier(variation.id)}
                className="px-2 py-1 bg-[#0f4d57] text-white rounded text-xs hover:bg-[#0f4d57]/90 transition-colors"
              >
                Add
              </button>
            </div>
            {variation.discountTiers.map((tier) => (
              <div
                key={tier.id}
                className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded"
              >
                <input
                  type="number"
                  placeholder="Min Qty"
                  value={tier.minQuantity}
                  onChange={(e) =>
                    onUpdateDiscountTier(
                      variation.id,
                      tier.id,
                      "minQuantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <select
                  value={tier.discountType}
                  onChange={(e) =>
                    onUpdateDiscountTier(
                      variation.id,
                      tier.id,
                      "discountType",
                      e.target.value
                    )
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">$</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Value"
                  value={tier.discountValue}
                  onChange={(e) =>
                    onUpdateDiscountTier(
                      variation.id,
                      tier.id,
                      "discountValue",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => onRemoveDiscountTier(variation.id, tier.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariationsConfiguration;
