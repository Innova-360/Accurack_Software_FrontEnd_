import React from "react";
import type { PackDiscount } from "./types";
import { generateId } from "./utils";

interface PackConfigurationProps {
  hasPackSettings: boolean;
  onToggle: (value: boolean) => void;
  packDiscounts: PackDiscount[];
  onPackDiscountsChange: (discounts: PackDiscount[]) => void;
  itemSellingPrice?: number; // Add item selling price for auto-calculation
}

const PackConfiguration: React.FC<PackConfigurationProps> = ({
  hasPackSettings,
  onToggle,
  packDiscounts,
  onPackDiscountsChange,
  itemSellingPrice = 0,
}) => {
  // Update all pack discounts when itemSellingPrice changes
  const updateAllPrices = React.useCallback(() => {
    if (packDiscounts.length > 0) {
      const updatedDiscounts = packDiscounts.map(discount => ({
        ...discount,
        orderedPacksPrice: discount.quantity * itemSellingPrice
      }));
      onPackDiscountsChange(updatedDiscounts);
    }
  }, [packDiscounts, itemSellingPrice, onPackDiscountsChange]);

  React.useEffect(() => {
    updateAllPrices();
  }, [itemSellingPrice]);
  // Auto-calculate ordered box price
  const calculateOrderedBoxPrice = (quantity: number, sellingPrice: number) => {
    return quantity * sellingPrice;
  };
  
  // Debug log to check values
  React.useEffect(() => {
    console.log("Current itemSellingPrice:", itemSellingPrice);
    console.log("Current packDiscounts:", packDiscounts);
    // For testing: if itemSellingPrice is 0, use a default value of 10
    if (itemSellingPrice === 0) {
      console.log("Using test value of 10 for demonstration");
    }
  }, [itemSellingPrice, packDiscounts]);
  const addPackDiscount = () => {
    const newDiscount: PackDiscount = {
      id: generateId(),
      quantity: 1,
      discountType: "percentage",
      discountValue: 0,
      totalPacksQuantity: 0,
      orderedPacksPrice: calculateOrderedBoxPrice(1, itemSellingPrice), // Auto-calculate initial price
    };
    onPackDiscountsChange([...packDiscounts, newDiscount]);
  };

  const updatePackDiscount = (
    id: string,
    field: keyof PackDiscount,
    value: any
  ) => {
    const updatedDiscounts = packDiscounts.map((discount) => {
      if (discount.id === id) {
        const updatedDiscount = { ...discount, [field]: value };
        
        // Always update the ordered box price whenever any field changes
        updatedDiscount.orderedPacksPrice = calculateOrderedBoxPrice(
          field === 'quantity' ? value : discount.quantity, 
          itemSellingPrice
        );
        
        return updatedDiscount;
      }
      return discount;
    });
    
    onPackDiscountsChange(updatedDiscounts);
  };

  const removePackDiscount = (id: string) => {
    onPackDiscountsChange(
      packDiscounts.filter((discount) => discount.id !== id)
    );
  };
  return (
    <div className="w-full border-b border-gray-200/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-bold text-gray-900">
              Box Sale Settings
            </h3>
            <p className="text-gray-600 text-sm">Set up bulk purchases</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasPackSettings}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {hasPackSettings && (
        <div className="space-y-6 border-t pt-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Boxes
            </h4>
            <button
              type="button"
              onClick={addPackDiscount}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
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
              <span>Add Box</span>
            </button>
          </div>{" "}
          {packDiscounts.map((discount) => (
            <div
              key={discount.id}
              className="flex flex-col md:flex-row gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-1 w-full md:w-1/6">
                <label className="block text-xs font-medium text-gray-700">
                  Items in Box
                </label>
                <input
                  type="number"
                  placeholder="Min quantity"
                  value={discount.quantity}
                  onChange={(e) =>
                    updatePackDiscount(
                      discount.id,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="space-y-1 w-full md:w-1/6">
                <label className="block text-xs font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={discount.discountType}
                  onChange={(e) =>
                    updatePackDiscount(
                      discount.id,
                      "discountType",
                      e.target.value as "percentage" | "fixed"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-1 w-full md:w-1/5">
                <label className="block text-xs font-medium text-gray-700">
                  {discount.discountType === "percentage"
                    ? "Percentage %"
                    : "Discount Amount $"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={
                    discount.discountType === "percentage" ? "0-100" : "0.00"
                  }
                  value={discount.discountValue}
                  onChange={(e) =>
                    updatePackDiscount(
                      discount.id,
                      "discountValue",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="space-y-1 w-full md:w-1/5">
                <label className="block text-xs font-medium text-gray-700">
                  Total Box Quantity
                </label>
                <input
                  type="number"
                  placeholder="Total Boxes"
                  value={discount.totalPacksQuantity || ""}
                  onChange={(e) =>
                    updatePackDiscount(
                      discount.id,
                      "totalPacksQuantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>{" "}
              {/* <div className="space-y-1 w-full md:w-1/6">
                <label className="block text-xs font-medium text-gray-700 flex items-center gap-1">
                  Ordered Box Price
                  <span className="text-xs text-blue-600" title="Auto-calculated: Items in Box × Item Price">
                    (auto)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={itemSellingPrice > 0 ? (discount.quantity * itemSellingPrice).toFixed(2) : "0.00"}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-800 font-medium cursor-not-allowed"
                  />
                  <div className="mt-1 flex items-center text-xs text-blue-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {itemSellingPrice > 0 
                      ? `Auto-calculated: ${discount.quantity} × ${itemSellingPrice} = ${(discount.quantity * itemSellingPrice).toFixed(2)}`
                      : "Please set Individual Item Selling Price above to enable auto-calculation"
                    }
                  </div>
                </div>
              </div> */}
              {/* <div className="space-y-1 w-full md:w-1/6">
                <label className="block text-xs font-medium text-gray-700 flex items-center gap-1">
                  Final Price
                  <span className="text-xs text-green-600" title="After discount">
                    (after discount)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={(() => {
                      const basePrice = discount.quantity * itemSellingPrice;
                      if (discount.discountType === "percentage") {
                        const discountAmount = (basePrice * discount.discountValue) / 100;
                        return (basePrice - discountAmount).toFixed(2);
                      } else {
                        return (basePrice - discount.discountValue).toFixed(2);
                      }
                    })()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-800 font-medium cursor-not-allowed"
                  />
                  <div className="mt-1 flex items-center text-xs text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {discount.discountType === "percentage" 
                      ? `${discount.discountValue}% discount applied`
                      : `$${discount.discountValue} discount applied`
                    }
                  </div>
                </div>
              </div> */}
              <div className="space-y-1 w-full md:w-1/6">
                <label className="block text-xs font-medium text-gray-700 flex items-center gap-1">
                  Final Price
                  <span className="text-xs text-green-600" title="After discount">
                    (after discount)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={(() => {
                      const basePrice = discount.quantity * itemSellingPrice;
                      if (discount.discountType === "percentage") {
                        const discountAmount = (basePrice * discount.discountValue) / 100;
                        return (basePrice - discountAmount).toFixed(2);
                      } else {
                        return (basePrice - discount.discountValue).toFixed(2);
                      }
                    })()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-800 font-medium cursor-not-allowed"
                  />
                  <div className="mt-1 flex items-center text-xs text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {discount.discountType === "percentage" 
                      ? `${discount.discountValue}% discount applied`
                      : `$${discount.discountValue} discount applied`
                    }
                  </div>
                </div>
              </div>
              <div className="flex items-end w-full md:w-1/6">
                <button
                  type="button"
                  onClick={() => removePackDiscount(discount.id)}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackConfiguration;
