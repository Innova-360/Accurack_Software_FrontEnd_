import React, { useState, useEffect } from "react";
import type { TaxPreview } from "../../types/tax";
import { taxAPI } from "../../services/taxAPI";

interface TaxPreviewCardProps {
  basePrice?: number;
  productName?: string;
  context?: {
    productId?: string;
    categoryId?: string;
    customerId?: string;
    storeId?: string;
    supplierId?: string;
    region?: string;
    customerType?: string;
    quantity?: number;
  };
  className?: string;
}

const TaxPreviewCard: React.FC<TaxPreviewCardProps> = ({
  basePrice = 1200,
  productName = "iPhone 15 Pro",
  context = {
    region: "US",
    categoryId: "electronics",
    customerId: "premium_customer",
    quantity: 1,
  },
  className = "",
}) => {
  const [preview, setPreview] = useState<TaxPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample context options for user to test different scenarios
  const [testContext, setTestContext] = useState({
    basePrice,
    productName,
    ...context,
  });

  useEffect(() => {
    calculatePreview();
  }, [testContext]);

  const calculatePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const taxResults = await taxAPI.calculateTaxes({
        basePrice: testContext.basePrice,
        productId: testContext.productId,
        categoryId: testContext.categoryId,
        customerId: testContext.customerId,
        storeId: testContext.storeId,
        supplierId: testContext.supplierId,
        region: testContext.region,
        customerType: testContext.customerType,
        quantity: testContext.quantity,
      });

      const appliedTaxes = taxResults.filter((tax) => tax.applied);
      const totalTax = appliedTaxes.reduce((sum, tax) => sum + tax.amount, 0);
      const finalPrice = testContext.basePrice + totalTax;

      setPreview({
        basePrice: testContext.basePrice,
        productName: testContext.productName,
        appliedTaxes,
        totalTax,
        finalPrice,
      });
    } catch (err) {
      setError("Failed to calculate tax preview");
      console.error("Tax calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatRate = (rate: number, type: "percentage" | "fixed") => {
    return type === "percentage" ? `${rate}%` : formatCurrency(rate);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Tax Preview
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Preview how taxes will be calculated for a sample transaction
        </p>
      </div>

      <div className="p-6">
        {/* Test Context Controls */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={testContext.productName}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    productName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price
              </label>
              <input
                type="number"
                value={testContext.basePrice}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    basePrice: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={testContext.region || ""}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    region: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                <option value="">Select Region</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="EU">European Union</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Type
              </label>
              <select
                value={testContext.customerType || ""}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    customerType: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={testContext.quantity || 1}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={calculatePreview}
            disabled={loading}
            className="px-4 py-2 bg-[#0f4d57] text-white rounded-md hover:bg-[#0d3f47] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Calculating..." : "Recalculate"}
          </button>
        </div>

        {/* Preview Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-[#0f4d57] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating taxes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-red-600">{error}</p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {/* Invoice Style Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Tax Calculation Preview
                </h4>
                <p className="text-sm text-gray-600">Sample Invoice</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Product:</span>
                  <span>{preview.productName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Base Price:</span>
                  <span>{formatCurrency(preview.basePrice)}</span>
                </div>

                {preview.appliedTaxes.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Applied Taxes:
                    </div>
                    {preview.appliedTaxes.map((tax, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 text-green-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {tax.taxName} ({formatRate(tax.rate, tax.taxType)})
                        </span>
                        <span>{formatCurrency(tax.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-3 mt-3 flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(preview.finalPrice)}</span>
                </div>

                {preview.totalTax > 0 && (
                  <div className="text-xs text-gray-500 text-center">
                    (Includes {formatCurrency(preview.totalTax)} in taxes)
                  </div>
                )}
              </div>
            </div>

            {/* Tax Breakdown */}
            {preview.appliedTaxes.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
                <p className="font-medium">No taxes applied</p>
                <p className="text-sm mt-1">
                  No tax rules match the current context or all taxes are
                  inactive
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TaxPreviewCard;
