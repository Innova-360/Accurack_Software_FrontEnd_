import React from "react";
import type { DiscountTier } from "./types";
import { generateId } from "./utils";

interface DiscountConfigurationProps {
  hasDiscountSettings: boolean;
  onToggle: (value: boolean) => void;
  discountTiers: DiscountTier[];
  onDiscountTiersChange: (tiers: DiscountTier[]) => void;
}

const DiscountConfiguration: React.FC<DiscountConfigurationProps> = ({
  hasDiscountSettings,
  onToggle,
  discountTiers,
  onDiscountTiersChange,
}) => {
  const addDiscountTier = () => {
    const newTier: DiscountTier = {
      id: generateId(),
      minQuantity: 1,
      discountValue: 0,
      discountType: "percentage",
    };
    onDiscountTiersChange([...discountTiers, newTier]);
  };

  const updateDiscountTier = (
    id: string,
    field: keyof DiscountTier,
    value: any
  ) => {
    onDiscountTiersChange(
      discountTiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  const removeDiscountTier = (id: string) => {
    onDiscountTiersChange(discountTiers.filter((tier) => tier.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Discount Configuration
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasDiscountSettings}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0f4d57]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f4d57]"></div>
        </label>
      </div>

      {hasDiscountSettings && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Discount Tiers</h4>
            <button
              type="button"
              onClick={addDiscountTier}
              className="px-3 py-1 bg-[#0f4d57] text-white rounded-md text-sm hover:bg-[#0f4d57]/90 transition-colors"
            >
              Add Tier
            </button>
          </div>

          {discountTiers.map((tier) => (
            <div
              key={tier.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-md"
            >
              <input
                type="number"
                placeholder="Minimum Quantity"
                value={tier.minQuantity}
                onChange={(e) =>
                  updateDiscountTier(
                    tier.id,
                    "minQuantity",
                    parseInt(e.target.value) || 0
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
              <select
                value={tier.discountType}
                onChange={(e) =>
                  updateDiscountTier(
                    tier.id,
                    "discountType",
                    e.target.value as "percentage" | "fixed"
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder={
                  tier.discountType === "percentage" ? "Percentage" : "Amount"
                }
                value={tier.discountValue}
                onChange={(e) =>
                  updateDiscountTier(
                    tier.id,
                    "discountValue",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeDiscountTier(tier.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountConfiguration;
