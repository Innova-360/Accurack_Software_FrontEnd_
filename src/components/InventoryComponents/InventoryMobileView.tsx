import React, { useState } from "react";
import type { Product } from "../../data/inventoryData";

interface InventoryMobileViewProps {
  products: Product[];
  groupedProducts: { [key: string]: Product[] } | null;
  groupBy: string;
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
}

const InventoryMobileView: React.FC<InventoryMobileViewProps> = ({
  products,
  groupedProducts,
  groupBy,
  expandedCategories,
  onToggleCategory,
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  if (groupBy === "category" && groupedProducts) {
    return (
      <div className="space-y-4">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div
            key={category}
            className="border border-gray-300 rounded-lg overflow-hidden"
          >
            {/* Category Header */}
            <div
              className="bg-blue-50 px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors"
              onClick={() => onToggleCategory(category)}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedCategories.includes(category) ? "rotate-90" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">
                  {category}
                </h3>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                  {categoryProducts.length}
                </span>
              </div>
            </div>

            {/* Category Products Cards */}
            {expandedCategories.includes(category) && (
              <div className="p-4 space-y-4">
                {categoryProducts.map((product, index) => {
                  const productKey = product.id || `product-${index}`;
                  const isProductExpanded = expandedProducts.has(productKey);
                  const hasVariantsToShow =
                    product.hasVariants &&
                    product.variants &&
                    product.variants.length > 0;

                  return (
                    <div key={productKey} className="space-y-2">
                      {/* Main Product Card */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            {hasVariantsToShow && (
                              <button
                                onClick={() =>
                                  toggleProductExpansion(productKey)
                                }
                                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${
                                    isProductExpanded ? "rotate-90" : ""
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            )}
                            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              {product.name}
                              {product.quantity < 10 && (
                                <svg
                                  className="w-4 h-4 text-yellow-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </h3>
                          </div>
                          {hasVariantsToShow && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                              {product.variants?.length || 0} variants
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Quantity:</span>{" "}
                            <span
                              className={
                                product.quantity < 10
                                  ? "text-red-600 font-bold"
                                  : ""
                              }
                            >
                              {product.quantity}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>{" "}
                            {product.price}
                          </div>
                          <div>
                            <span className="font-medium">PLU:</span>{" "}
                            {product.plu}
                          </div>
                          <div>
                            <span className="font-medium">SKU:</span>{" "}
                            {product.sku}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Items/Unit:</span>{" "}
                            {product.itemsPerUnit}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Supplier:</span>{" "}
                            {product.supplier}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Description:</span>{" "}
                          {product.description}
                        </div>
                      </div>

                      {/* Variant Cards */}
                      {hasVariantsToShow && isProductExpanded && (
                        <div className="ml-6 space-y-2">
                          {product.variants?.map((variant, variantIndex) => (
                            <div
                              key={`${productKey}-variant-${variantIndex}`}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <h4 className="font-medium text-gray-800 text-sm">
                                  {variant.name}
                                </h4>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Price:</span> $
                                  {variant.price.toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">SKU:</span>{" "}
                                  {variant.sku}
                                </div>
                                {variant.msrpPrice && (
                                  <div>
                                    <span className="font-medium">MSRP:</span> $
                                    {variant.msrpPrice.toFixed(2)}
                                  </div>
                                )}
                                {variant.discountAmount &&
                                  variant.discountAmount > 0 && (
                                    <div>
                                      <span className="font-medium">
                                        Discount Amount:
                                      </span>{" "}
                                      ${variant.discountAmount.toFixed(2)}
                                    </div>
                                  )}
                                {variant.percentDiscount &&
                                  variant.percentDiscount > 0 && (
                                    <div>
                                      <span className="font-medium">
                                        Percent Discount:
                                      </span>{" "}
                                      {variant.percentDiscount}%
                                    </div>
                                  )}
                              </div>
                              {/* Pack Information */}
                              {variant.packs && variant.packs.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                  <h5 className="font-medium text-gray-700 text-xs mb-2">
                                    Pack Options:
                                  </h5>
                                  <div className="space-y-2">
                                    {variant.packs.map((pack, packIndex) => (
                                      <div
                                        key={packIndex}
                                        className="bg-white rounded-md p-2 border border-gray-200"
                                      >
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                          <div>
                                            <span className="font-medium">
                                              Min Qty:
                                            </span>{" "}
                                            {pack.minimumSellingQuantity}
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Total Packs:
                                            </span>{" "}
                                            {pack.totalPacksQuantity}
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Pack Price:
                                            </span>{" "}
                                            $
                                            {pack.orderedPacksPrice?.toFixed(
                                              2
                                            ) || "0.00"}
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Pack Discount:
                                            </span>{" "}
                                            {pack.percentDiscount}%
                                          </div>
                                          {pack.discountAmount &&
                                            pack.discountAmount > 0 && (
                                              <div className="col-span-2">
                                                <span className="font-medium">
                                                  Discount Amount:
                                                </span>{" "}
                                                $
                                                {pack.discountAmount.toFixed(2)}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Regular Mobile View
  if (products.length > 0) {
    return (
      <div className="space-y-4">
        {products.map((product, index) => {
          const productKey = product.id || `product-${index}`;
          const isProductExpanded = expandedProducts.has(productKey);
          const hasVariantsToShow =
            product.hasVariants &&
            product.variants &&
            product.variants.length > 0;

          return (
            <div key={productKey} className="space-y-2">
              {/* Main Product Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {hasVariantsToShow && (
                      <button
                        onClick={() => toggleProductExpansion(productKey)}
                        className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isProductExpanded ? "rotate-90" : ""
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {product.name}{" "}
                      {product.quantity < 10 && (
                        <svg
                          className="w-4 h-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasVariantsToShow && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.variants?.length || 0} variants
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Quantity:</span>{" "}
                    <span
                      className={
                        product.quantity < 10 ? "text-red-600 font-bold" : ""
                      }
                    >
                      {product.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> {product.price}
                  </div>
                  <div>
                    <span className="font-medium">PLU:</span> {product.plu}
                  </div>
                  <div>
                    <span className="font-medium">SKU:</span> {product.sku}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Items/Unit:</span>{" "}
                    {product.itemsPerUnit}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Supplier:</span>{" "}
                    {product.supplier}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Description:</span>{" "}
                  {product.description}
                </div>
              </div>

              {/* Variant Cards */}
              {hasVariantsToShow && isProductExpanded && (
                <div className="ml-6 space-y-2">
                  {product.variants?.map((variant, variantIndex) => (
                    <div
                      key={`${productKey}-variant-${variantIndex}`}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <h4 className="font-medium text-gray-800 text-sm">
                          {variant.name}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Price:</span> $
                          {variant.price.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">SKU:</span>{" "}
                          {variant.sku}
                        </div>
                        {variant.msrpPrice && (
                          <div>
                            <span className="font-medium">MSRP:</span> $
                            {variant.msrpPrice.toFixed(2)}
                          </div>
                        )}
                        {variant.discountAmount &&
                          variant.discountAmount > 0 && (
                            <div>
                              <span className="font-medium">
                                Discount Amount:
                              </span>{" "}
                              ${variant.discountAmount.toFixed(2)}
                            </div>
                          )}
                        {variant.percentDiscount &&
                          variant.percentDiscount > 0 && (
                            <div>
                              <span className="font-medium">
                                Percent Discount:
                              </span>{" "}
                              {variant.percentDiscount}%
                            </div>
                          )}
                      </div>
                      {/* Pack Information */}
                      {variant.packs && variant.packs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <h5 className="font-medium text-gray-700 text-xs mb-2">
                            Pack Options:
                          </h5>
                          <div className="space-y-2">
                            {variant.packs.map((pack, packIndex) => (
                              <div
                                key={packIndex}
                                className="bg-white rounded-md p-2 border border-gray-200"
                              >
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  <div>
                                    <span className="font-medium">
                                      Min Qty:
                                    </span>{" "}
                                    {pack.minimumSellingQuantity}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Total Packs:
                                    </span>{" "}
                                    {pack.totalPacksQuantity}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Pack Price:
                                    </span>{" "}
                                    $
                                    {pack.orderedPacksPrice?.toFixed(2) ||
                                      "0.00"}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Pack Discount:
                                    </span>{" "}
                                    {pack.percentDiscount}%
                                  </div>
                                  {pack.discountAmount &&
                                    pack.discountAmount > 0 && (
                                      <div className="col-span-2">
                                        <span className="font-medium">
                                          Discount Amount:
                                        </span>{" "}
                                        ${pack.discountAmount.toFixed(2)}
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-gray-500">
      No products found matching your search criteria.
    </div>
  );
};

export default InventoryMobileView;
