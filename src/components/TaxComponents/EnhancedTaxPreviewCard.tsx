import React, { useState, useEffect } from "react";
import type { TaxPreview } from "../../types/tax";
import { taxAPI } from "../../services/taxAPI";

interface EnhancedTaxPreviewCardProps {
  className?: string;
  showTestControls?: boolean;
  onContextChange?: (context: any) => void;
}

const EnhancedTaxPreviewCard: React.FC<EnhancedTaxPreviewCardProps> = ({
  className = "",
  showTestControls = true,
  onContextChange,
}) => {
  const [preview, setPreview] = useState<TaxPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced test context with more options
  const [testContext, setTestContext] = useState({
    basePrice: 1200,
    productName: "iPhone 15 Pro",
    productId: "iphone15",
    categoryId: "electronics",
    customerId: "premium_customer",
    storeId: "store_001",
    supplierId: "apple_inc",
    region: "US",
    customerType: "premium",
    quantity: 1,
    productCategory: "luxury",
    storeLocation: "NY",
    totalAmount: 1200,
  });

  // Sample product options for testing
  const sampleProducts = [
    {
      id: "iphone15",
      name: "iPhone 15 Pro",
      price: 1200,
      category: "electronics",
    },
    {
      id: "macbook",
      name: "MacBook Pro",
      price: 2500,
      category: "electronics",
    },
    { id: "coffee", name: "Premium Coffee", price: 25, category: "beverages" },
    { id: "milk", name: "Organic Milk", price: 5, category: "dairy" },
    { id: "jewelry", name: "Gold Necklace", price: 3500, category: "luxury" },
  ];

  // Sample regions for testing
  const regions = ["US", "CA", "UK", "EU", "PK", "IN"];
  const customerTypes = ["regular", "premium", "wholesale", "corporate"];

  useEffect(() => {
    calculatePreview();
  }, [testContext]);

  useEffect(() => {
    if (onContextChange) {
      onContextChange(testContext);
    }
  }, [testContext, onContextChange]);

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
        productCategory: testContext.productCategory,
        storeLocation: testContext.storeLocation,
        totalAmount: testContext.totalAmount,
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

  const handleProductChange = (productId: string) => {
    const product = sampleProducts.find((p) => p.id === productId);
    if (product) {
      setTestContext((prev) => ({
        ...prev,
        productId: product.id,
        productName: product.name,
        basePrice: product.price,
        categoryId: product.category,
        totalAmount: product.price * prev.quantity,
      }));
    }
  };

  const handleQuantityChange = (quantity: number) => {
    setTestContext((prev) => ({
      ...prev,
      quantity,
      totalAmount: prev.basePrice * quantity,
    }));
  };

  const handleRefresh = () => {
    calculatePreview();
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-[#0f4d57] hover:text-[#0d3f47] disabled:opacity-50 transition-colors"
            title="Refresh calculation"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Test Controls */}
      {showTestControls && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Test Scenario
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product
              </label>
              <select
                value={testContext.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                {sampleProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={testContext.quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={testContext.region}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    region: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Type
              </label>
              <select
                value={testContext.customerType}
                onChange={(e) =>
                  setTestContext((prev) => ({
                    ...prev,
                    customerType: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
              >
                {customerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
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
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {preview.productName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {testContext.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Base Price:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(preview.basePrice)}
                  </p>
                </div>
              </div>

              {/* Context Info */}
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div>
                  Region: {testContext.region} | Customer:{" "}
                  {testContext.customerType}
                </div>
                <div>
                  Category: {testContext.categoryId} | Store:{" "}
                  {testContext.storeLocation}
                </div>
              </div>
            </div>

            {/* Applied Taxes */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Applied Taxes:
              </h4>

              {preview.appliedTaxes.length > 0 ? (
                <div className="space-y-2">
                  {preview.appliedTaxes.map((tax, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center">
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
                        <div>
                          <span className="font-medium text-gray-900">
                            {tax.taxName}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({formatRate(tax.rate, tax.taxType)})
                          </span>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(tax.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <svg
                    className="w-8 h-8 text-gray-300 mx-auto mb-2"
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
                  <p className="text-sm">No taxes applied</p>
                  <p className="text-xs mt-1">
                    No tax rules match the current context
                  </p>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="bg-[#0f4d57] text-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">Total Amount</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(preview.finalPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Tax Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(preview.totalTax)}
                    </p>
                  </div>
                </div>
                {preview.totalTax > 0 && (
                  <div className="text-xs opacity-75 text-center mt-2">
                    Tax Rate:{" "}
                    {((preview.totalTax / preview.basePrice) * 100).toFixed(2)}%
                    of base price
                  </div>
                )}
              </div>
            </div>

            {/* Calculation Details */}
            {preview.appliedTaxes.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  View Calculation Details
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                  <div>Base Price: {formatCurrency(preview.basePrice)}</div>
                  {preview.appliedTaxes.map((tax, index) => (
                    <div key={index} className="flex justify-between">
                      <span>+ {tax.taxName}:</span>
                      <span>
                        {tax.taxType === "percentage"
                          ? `${formatCurrency(preview.basePrice)} × ${tax.rate}% = ${formatCurrency(tax.amount)}`
                          : formatCurrency(tax.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-1 font-medium">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{formatCurrency(preview.finalPrice)}</span>
                    </div>
                  </div>
                </div>
              </details>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EnhancedTaxPreviewCard;
