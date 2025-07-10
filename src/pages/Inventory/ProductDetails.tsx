import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import type { Product } from "../../data/inventoryData";
import { productAPI } from "../../services/productAPI";
import Barcode from "react-barcode";

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch product from API
        const productData = await productAPI.getProductById(productId!);
        setProduct(productData);
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/inventory/product/${productId}/update`);
  };

  const handlePrintBarcode = () => {
    if (product) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Barcode - ${product.name}</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                .barcode { font-size: 24px; font-family: 'Courier New', monospace; margin: 20px 0; }
                .product-info { margin: 10px 0; }
              </style>
            </head>
            <body>
              <h2>${product.name}</h2>
              <div class="product-info">SKU: ${product.sku}</div>
              <div class="product-info">PLU: ${product.pluUpc}</div>
              ${product.ean ? `<div class="product-info">EAN: ${product.ean}</div>` : ""}
              <div class="barcode">${product.ean || product.pluUpc || product.sku}</div>
              <div class="product-info">Price: $${product.price || "0.00"}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleUpdateInventory = () => {
    // TODO: Implement update inventory functionality
    console.log("Update inventory clicked");
  };

  const handleCreatePurchaseOrder = () => {
    // TODO: Implement create purchase order functionality
    console.log("Create purchase order clicked");
  };

  const handleViewSalesReport = () => {
    // TODO: Implement view sales report functionality
    console.log("View sales report clicked");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist.
            </p>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  console.log("greate product", product);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f9fafb] pb-6">
        <div className="max-w-full mx-auto px-4 py-6">
          {/* Product Header */}
          <div className="mb-6">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 12H5m0 0l7 7m-7-7l7-7"
                  />
                </svg>
              </button>
              <div className="text-sm text-gray-600 ml-1">
                Product /{" "}
                {typeof product.category === "string"
                  ? product.category
                  : product.category?.name || "Uncategorized"}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
            {/* Left Column - 40% width (2/5) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Product Information */}
              <div className="bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
                  Basic Product Information
                </h2>

                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        SKU
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {product.sku}
                      </div>
                    </div>
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        PLU / UPC
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {product.plu || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-md font-medium text-gray-500 mb-2">
                      Barcode
                    </label>
                    <div className="relative bg-[#f9fafb] flex flex-row items-center justify-between p-4 rounded-lg">
                      <span>
                        {/* Render barcode visually using react-barcode */}
                        {product.plu ? (
                          <Barcode
                            value={product.plu}
                            height={40}
                            width={1.5}
                            fontSize={14}
                            displayValue={true}
                          />
                        ) : (
                          <span className="text-gray-400">
                            No PLU available
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            // Download barcode functionality
                            const link = document.createElement("a");
                            link.href =
                              "data:text/plain;charset=utf-8,Barcode: " +
                              (product.ean || product.pluUpc || product.sku);
                            link.download = `barcode-${product.sku}.txt`;
                            link.click();
                          }}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="#003f4a"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </button>
                        <button onClick={handlePrintBarcode}>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="#003f4a"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        Category
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {typeof product.category === "string"
                          ? product.category
                          : product.category?.name || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Product Description
                    </label>
                    <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                      {product.description || "No description available"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Variants
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {product.hasVariants &&
                      product.variants &&
                      product.variants.length > 0 ? (
                        product.variants.map((variant, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-small bg-gray-100 text-gray-700"
                            title={`Price: $${variant.price} | Quantity: ${variant.quantity} | ${variant.color ? `Color: ${variant.color}` : ""} ${variant.origin ? `| Origin: ${variant.origin}` : ""}`}
                          >
                            {variant.name}
                            {variant.color && ` - ${variant.color}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          {product.hasVariants
                            ? "No variants configured"
                            : "Single product (no variants)"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Product Packs
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {product.packs && product.packs.length > 0 ? (
                        product.packs.map((_, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-small bg-blue-100 text-blue-700"
                          >
                            Pack {index + 1}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          No packs configured
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Product Status
                    </label>
                    <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Cost */}
              <div className="bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
                  Pricing & Cost
                </h2>

                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        Cost Price
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        ${product.costPrice?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        Selling Price
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {product.price || "0.00"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        MSRP Price
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        ${product.msrpPrice?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        Tax Rate
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        7.5%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        Profit Margin
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {product.profitMargin
                          ? `${product.profitMargin.toFixed(2)}%`
                          : "0%"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        Profit Amount
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        ${product.profitAmount?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        {product.percentDiscount
                          ? `Discount (${product.percentDiscount}%)`
                          : "Discount"}
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {product.percentDiscount
                          ? `Yes - ${product.percentDiscount}% discount (Save $${product.discountAmount || 0})`
                          : "No active discounts"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-md font-medium text-gray-500 mb-2">
                        EAN/Barcode
                      </label>
                      <div className="text-md text-gray-800 font-semibold">
                        {product.ean || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 60% width (3/5) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Inventory & Restocking */}
              <div className="bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
                  Inventory & Restocking
                </h2>

                <div className="p-6">
                  {/* Summary Row */}
                  <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Current Stock
                      </label>
                      <div className="text-lg text-gray-900 font-semibold">
                        {product.quantity || 0} units
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Minimum Stock
                      </label>
                      <div className="text-lg text-gray-900 font-semibold">
                        10 units
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Created Date
                      </label>
                      <div className="text-lg text-gray-900 font-semibold">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Updated Date
                      </label>
                      <div className="text-lg text-gray-900 font-semibold">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleDateString()
                          : new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Store-wise Stock Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Store-wise Stock
                    </h3>
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200">
                      <div>Location</div>
                      <div>Stock</div>
                      <div>Min. Level</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                    {/* Table Rows */}
                    <div className="space-y-2 mt-2">
                      {/* Main Store Row */}{" "}
                      <div className="grid grid-cols-5 gap-4 py-3 items-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {product.store?.name || "Main Store"}
                        </div>
                        <div className="text-sm text-gray-900 font-semibold">
                          {product.quantity || 0} units
                        </div>
                        <div className="text-sm text-gray-900">10 units</div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              (product.itemQuantity || 0) > 50
                                ? "bg-green-100 text-green-800"
                                : (product.itemQuantity || 0) > 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {(product.itemQuantity || 0) > 50
                              ? "Normal"
                              : (product.itemQuantity || 0) > 20
                                ? "Low"
                                : "Critical"}
                          </span>
                        </div>
                        <div>
                          <button className="text-gray-400 hover:text-gray-600">
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Section */}
              <div className="bg-white rounded-lg">
                <div className="flex justify-between items-center border-b border-gray-200 pb-5 p-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    History
                  </h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto p-6">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Always show product creation entry */}
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(product.createdAt).toLocaleDateString()}{" "}
                          {new Date(product.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Product Created
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                          +{product.itemQuantity || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                          $
                          {(
                            (product.singleItemCostPrice || 0) *
                            (product.itemQuantity || 0)
                          ).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                          PROD-{product.id?.substring(0, 8)}
                        </td>
                      </tr>

                      {/* Purchase Orders */}
                      {product.purchaseOrders &&
                      product.purchaseOrders.length > 0 ? (
                        product.purchaseOrders.map((po, index) => (
                          <tr
                            key={po.id || index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {po.createdAt
                                ? new Date(po.createdAt).toLocaleDateString()
                                : new Date(
                                    product.createdAt
                                  ).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Purchase Order
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                              +{po.quantity || 0}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                              ${po.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  po.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {po.status || "Unknown"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                              PO-{po.id?.substring(0, 8) || `${index + 1}`}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            Today 10:21 AM
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              Sale (Sample)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                            -1
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                            ${product.singleItemSellingPrice || "0.00"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                            SAMPLE-001
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Suppliers */}
              <div className="bg-white rounded-lg">
                <div className="flex justify-between items-center border-b border-gray-200 pb-5 p-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Suppliers
                  </h2>
                </div>

                <div className="p-6">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 pb-3 mb-4 text-sm font-medium text-gray-500 border-b border-gray-200">
                    <div>Supplier Name</div>
                    <div>Contact Info</div>
                    <div>Address</div>
                    <div>Cost Price</div>
                    <div>Status</div>
                  </div>

                  {/* Table Rows */}
                  <div className="space-y-4">
                    {product.productSuppliers &&
                    product.productSuppliers.length > 0 ? (
                      product.productSuppliers.map((productSupplier, index) => (
                        <div
                          key={productSupplier.id || index}
                          className="grid grid-cols-5 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg px-2"
                        >
                          <div className="text-sm text-gray-900 font-medium">
                            <div className="font-medium">
                              {productSupplier.supplier?.name ||
                                "Unknown Supplier"}
                            </div>
                            {/* <div className="font-mono text-xs text-gray-500 mt-1">
                              ID:{" "}
                              {productSupplier.supplier?.id?.substring(0, 8) ||
                                "N/A"}
                            </div> */}
                          </div>
                          <div className="text-sm">
                            <div className="space-y-1">
                              {productSupplier.supplier?.email && (
                                <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
                                  {productSupplier.supplier.email}
                                </div>
                              )}
                              {productSupplier.supplier?.phone && (
                                <div className="text-gray-700">
                                  {productSupplier.supplier.phone}
                                </div>
                              )}
                              {!productSupplier.supplier?.email &&
                                !productSupplier.supplier?.phone && (
                                  <span className="text-gray-400">
                                    No contact info
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div
                              className="max-w-xs truncate"
                              title={productSupplier.supplier?.address}
                            >
                              {productSupplier.supplier?.address ||
                                "No address"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-900 font-semibold">
                            ${productSupplier.costPrice?.toFixed(2) || "0.00"}
                          </div>

                          <div className="text-sm">
                            <span
                              className={`text-md ${productSupplier.state === "primary" ? "text-black-900 font-bold" : "text-black-700"}`}
                              title={
                                productSupplier.state === "primary"
                                  ? "Primary Supplier"
                                  : "Secondary Supplier"
                              }
                            >
                              {productSupplier.state === "primary"
                                ? "Primary"
                                : "Secondary"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No vendors found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50">
          <div className="max-w-full mx-auto px-4 py-3">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleEdit}
                className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Product
              </button>

              {/* <button
                onClick={handleUpdateInventory}
                className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Update Inventory
              </button> */}

              {/* <button
                onClick={handleCreatePurchaseOrder}
                className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Create Purchase Order
              </button> */}

              {/* <button
                onClick={handleViewSalesReport}
                className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                View Sales Report
              </button> */}

              <button
                onClick={handlePrintBarcode}
                className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Barcode
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;











// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Header from "../../components/Header";
// import type { Product, Variant } from "../../data/inventoryData";
// import { productAPI } from "../../services/productAPI";
// import Barcode from "react-barcode";

// const ProductDetails: React.FC = () => {
//   const { productId } = useParams<{ productId: string }>();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isVariantProduct, setIsVariantProduct] = useState(false);
//   const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Try to fetch product from API
//         const productData = await productAPI.getProductById(productId!);
//         setProduct(productData);
        
//         // Detect if product has variants
//         const hasVariants = !!(productData.hasVariants && 
//                               productData.variants && 
//                               productData.variants.length > 0);
//         setIsVariantProduct(hasVariants);
        
//         // Set first variant as selected if product has variants
//         if (hasVariants && productData.variants) {
//           setSelectedVariant(productData.variants[0]);
//         }
//       } catch (err) {
//         setError("Product not found");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (productId) {
//       fetchProduct();
//     }
//   }, [productId]);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   const handleEdit = () => {
//     navigate(`/inventory/edit/${productId}`);
//   };

//   const handlePrintBarcode = () => {
//     if (product) {
//       const currentVariant = isVariantProduct ? selectedVariant : null;
//       const printWindow = window.open("", "_blank");
//       if (printWindow) {
//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Barcode - ${product.name}${currentVariant ? ` (${currentVariant.name})` : ''}</title>
//               <style>
//                 body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
//                 .barcode { font-size: 24px; font-family: 'Courier New', monospace; margin: 20px 0; }
//                 .product-info { margin: 10px 0; }
//                 .variant-info { color: #0066cc; font-weight: bold; }
//               </style>
//             </head>
//             <body>
//               <h2>${product.name}</h2>
//               ${currentVariant ? `<div class="variant-info">Variant: ${currentVariant.name}</div>` : ''}
//               <div class="product-info">SKU: ${currentVariant?.sku || product.sku}</div>
//               <div class="product-info">PLU: ${currentVariant?.pluUpc || product.pluUpc}</div>
//               ${product.ean ? `<div class="product-info">EAN: ${product.ean}</div>` : ""}
//               <div class="barcode">${product.ean || (currentVariant?.pluUpc || product.pluUpc) || (currentVariant?.sku || product.sku)}</div>
//               <div class="product-info">Price: $${currentVariant ? currentVariant.price?.toFixed(2) || '0.00' : product.price || "0.00"}</div>
//               ${currentVariant?.color ? `<div class="product-info">Color: ${currentVariant.color}</div>` : ''}
//               ${currentVariant ? `<div class="product-info">Stock: ${currentVariant.quantity || 0} units</div>` : ''}
//             </body>
//           </html>
//         `);
//         printWindow.document.close();
//         printWindow.print();
//       }
//     }
//   };

//   const handleUpdateInventory = () => {
//     // TODO: Implement update inventory functionality
//     console.log("Update inventory clicked");
//   };

//   const handleCreatePurchaseOrder = () => {
//     // TODO: Implement create purchase order functionality
//     console.log("Create purchase order clicked");
//   };

//   const handleViewSalesReport = () => {
//     // TODO: Implement view sales report functionality
//     console.log("View sales report clicked");
//   };

//   // Helper function to get display data based on variant selection
//   const getDisplayData = () => {
//     if (isVariantProduct && selectedVariant) {
//       return {
//         sku: selectedVariant.sku || product?.sku || 'N/A',
//         plu: selectedVariant.pluUpc || product?.plu || 'Not specified',
//         price: selectedVariant.price || 0,
//         quantity: selectedVariant.quantity || 0,
//         costPrice: (selectedVariant as any)?.costPrice || product?.costPrice || 0,
//         msrpPrice: selectedVariant.msrpPrice || product?.msrpPrice || 0,
//         percentDiscount: selectedVariant.percentDiscount || product?.percentDiscount || 0,
//         discountAmount: selectedVariant.discountAmount || product?.discountAmount || 0,
//         color: selectedVariant.color,
//         origin: selectedVariant.origin,
//         supplierName: selectedVariant.supplierName,
//         isVariantView: true
//       };
//     }
    
//     return {
//       sku: product?.sku || 'N/A',
//       plu: product?.plu || 'Not specified',
//       price: parseFloat(product?.price?.replace?.('$', '') || '0') || 0,
//       quantity: product?.quantity || 0,
//       costPrice: product?.costPrice || 0,
//       msrpPrice: product?.msrpPrice || 0,
//       percentDiscount: product?.percentDiscount || 0,
//       discountAmount: product?.discountAmount || 0,
//       color: null,
//       origin: null,
//       supplierName: null,
//       isVariantView: false
//     };
//   };

//   const displayData = getDisplayData();

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </>
//     );
//   }

//   if (error || !product) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               Product Not Found
//             </h2>
//             <p className="text-gray-600 mb-6">
//               The product you're looking for doesn't exist.
//             </p>
//             <button
//               onClick={handleBack}
//               className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Go Back
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   console.log("greate product", product);

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-[#f9fafb] pb-6">
//         <div className="max-w-full mx-auto px-4 py-6">
//           {/* Product Header */}
//           <div className="mb-6">
//             <div className="flex items-center">
//               <button
//                 onClick={handleBack}
//                 className="hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <svg
//                   className="w-5 h-5 text-gray-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 12H5m0 0l7 7m-7-7l7-7"
//                   />
//                 </svg>
//               </button>
//               <div className="text-sm text-gray-600 ml-1">
//                 Product /{" "}
//                 {typeof product.category === "string"
//                   ? product.category
//                   : product.category?.name || "Uncategorized"}
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mt-2">
//               {product.name}
//             </h1>
            
//             {/* Variant Detection Badge */}
//             <div className="mt-3 flex items-center gap-3">
//               <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                 isVariantProduct 
//                   ? 'bg-blue-100 text-blue-800 border border-blue-200' 
//                   : 'bg-gray-100 text-gray-700 border border-gray-200'
//               }`}>
//                 {isVariantProduct ? 'Variant Product' : 'Single Product'}
//               </span>
//               {isVariantProduct && (
//                 <span className="text-sm text-gray-600">
//                   {product.variants?.length} variant{product.variants?.length !== 1 ? 's' : ''} available
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Variant Selector - Show only for variant products */}
//           {isVariantProduct && product.variants && (
//             <div className="mb-6">
//               <div className="bg-white rounded-lg border border-gray-200 p-4">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                   Select Variant
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                   {product.variants.map((variant, index) => (
//                     <button
//                       key={variant.id || index}
//                       onClick={() => setSelectedVariant(variant)}
//                       className={`p-3 rounded-lg border transition-all duration-200 text-left ${
//                         selectedVariant?.id === variant.id || 
//                         (selectedVariant?.name === variant.name && index === 0)
//                           ? 'border-blue-500 bg-blue-50 shadow-md'
//                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="font-medium text-gray-900">
//                         {variant.name}
//                       </div>
//                       <div className="text-sm text-gray-600 mt-1">
//                         ${variant.price || '0.00'}
//                       </div>
//                       {variant.color && (
//                         <div className="text-xs text-gray-500 mt-1">
//                           {variant.color}
//                         </div>
//                       )}
//                       <div className="text-xs text-gray-500 mt-1">
//                         Stock: {variant.quantity || 0}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Main Content Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
//             {/* Left Column - 40% width (2/5) */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Basic Product Information */}
//               <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Basic Product Information
//                   {isVariantProduct && selectedVariant && (
//                     <span className="text-sm font-normal text-blue-600 ml-2">
//                       (Showing: {selectedVariant.name})
//                     </span>
//                   )}
//                 </h2>

//                 <div className="space-y-6 p-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         SKU
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {displayData.sku}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         PLU / UPC
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {displayData.plu}
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-md font-medium text-gray-500 mb-2">
//                       Barcode
//                     </label>
//                     <div className="relative bg-[#f9fafb] flex flex-row items-center justify-between p-4 rounded-lg">
//                       <span>
//                         {/* Render barcode visually using react-barcode */}
//                         {displayData.plu && displayData.plu !== 'Not specified' ? (
//                           <Barcode
//                             value={displayData.plu}
//                             height={40}
//                             width={1.5}
//                             fontSize={14}
//                             displayValue={true}
//                           />
//                         ) : (
//                           <span className="text-gray-400">
//                             No PLU available
//                           </span>
//                         )}
//                       </span>
//                       <div className="flex items-center gap-3">
//                         <button
//                           onClick={() => {
//                             // Download barcode functionality
//                             const link = document.createElement("a");
//                             link.href =
//                               "data:text/plain;charset=utf-8,Barcode: " +
//                               (product?.ean || displayData.plu || displayData.sku);
//                             link.download = `barcode-${displayData.sku}.txt`;
//                             link.click();
//                           }}
//                         >
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             stroke="#003f4a"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                             />
//                           </svg>
//                         </button>
//                         <button onClick={handlePrintBarcode}>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             stroke="#003f4a"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//                             />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Category
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {typeof product.category === "string"
//                           ? product.category
//                           : product.category?.name || "Not specified"}
//                       </div>
//                     </div>
//                     {/* Show variant-specific attributes if available */}
//                     {displayData.isVariantView && displayData.color && (
//                       <div>
//                         <label className="block text-md font-medium text-gray-500 mb-2">
//                           Color
//                         </label>
//                         <div className="text-md text-gray-800 font-semibold">
//                           {displayData.color}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Show origin if it's a variant view */}
//                   {displayData.isVariantView && displayData.origin && (
//                     <div className="grid grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-md font-medium text-gray-500 mb-2">
//                           Origin
//                         </label>
//                         <div className="text-md text-gray-800 font-semibold">
//                           {displayData.origin}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Product Description
//                     </label>
//                     <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
//                       {product.description || "No description available"}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Variants
//                     </label>
//                     <div className="flex gap-2 flex-wrap">
//                       {isVariantProduct && product.variants && product.variants.length > 0 ? (
//                         product.variants.map((variant, index) => (
//                           <button
//                             key={variant.id || index}
//                             onClick={() => setSelectedVariant(variant)}
//                             className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all ${
//                               selectedVariant?.id === variant.id || 
//                               (selectedVariant?.name === variant.name && index === 0)
//                                 ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
//                             }`}
//                             title={`Price: $${variant.price || '0.00'} | Stock: ${variant.quantity || 0} | ${variant.color ? `Color: ${variant.color}` : ''} ${variant.origin ? `| Origin: ${variant.origin}` : ''}`}
//                           >
//                             {variant.name}
//                             {variant.color && ` - ${variant.color}`}
//                             <span className="ml-2 text-xs">
//                               ({variant.quantity || 0} in stock)
//                             </span>
//                           </button>
//                         ))
//                       ) : (
//                         <span className="text-sm text-gray-500">
//                           Single product (no variants)
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Product Packs
//                     </label>
//                     <div className="flex gap-2 flex-wrap">
//                       {product.packs && product.packs.length > 0 ? (
//                         product.packs.map((_, index) => (
//                           <span
//                             key={index}
//                             className="inline-flex items-center px-3 py-1 rounded-full text-sm font-small bg-blue-100 text-blue-700"
//                           >
//                             Pack {index + 1}
//                           </span>
//                         ))
//                       ) : (
//                         <span className="text-sm text-gray-500">
//                           No packs configured
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Product Status
//                     </label>
//                     <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700">
//                       <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
//                       Active
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Pricing & Cost */}
//               <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Pricing & Cost
//                   {isVariantProduct && selectedVariant && (
//                     <span className="text-sm font-normal text-blue-600 ml-2">
//                       (Showing: {selectedVariant.name})
//                     </span>
//                   )}
//                 </h2>

//                 <div className="space-y-6 p-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Cost Price
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         ${displayData.costPrice.toFixed(2)}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Selling Price
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         ${displayData.price.toFixed(2)}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         MSRP Price
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         ${displayData.msrpPrice.toFixed(2)}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Tax Rate
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         7.5%
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Profit Margin
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {displayData.costPrice > 0 
//                           ? `${(((displayData.price - displayData.costPrice) / displayData.price) * 100).toFixed(2)}%`
//                           : "0%"}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         Profit Amount
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         ${Math.max(0, displayData.price - displayData.costPrice).toFixed(2)}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         {displayData.percentDiscount
//                           ? `Discount (${displayData.percentDiscount}%)`
//                           : "Discount"}
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {displayData.percentDiscount
//                           ? `Yes - ${displayData.percentDiscount}% discount (Save $${displayData.discountAmount || 0})`
//                           : "No active discounts"}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-500 mb-2">
//                         EAN/Barcode
//                       </label>
//                       <div className="text-md text-gray-800 font-semibold">
//                         {product.ean || "Not specified"}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Show variant-specific supplier info if available */}
//                   {displayData.isVariantView && displayData.supplierName && (
//                     <div className="grid grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-md font-medium text-gray-500 mb-2">
//                           Variant Supplier
//                         </label>
//                         <div className="text-md text-gray-800 font-semibold">
//                           {displayData.supplierName}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - 60% width (3/5) */}
//             <div className="lg:col-span-3 space-y-6">
//               {/* Inventory & Restocking */}
//               <div className="bg-white rounded-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-5 p-5">
//                   Inventory & Restocking
//                   {isVariantProduct && selectedVariant && (
//                     <span className="text-sm font-normal text-blue-600 ml-2">
//                       (Showing: {selectedVariant.name})
//                     </span>
//                   )}
//                 </h2>

//                 <div className="p-6">
//                   {/* Summary Row */}
//                   <div className="grid grid-cols-4 gap-6 mb-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Current Stock
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         {displayData.quantity} units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Minimum Stock
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         10 units
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Created Date
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         {new Date(product.createdAt).toLocaleDateString()}
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Updated Date
//                       </label>
//                       <div className="text-lg text-gray-900 font-semibold">
//                         {product.updatedAt
//                           ? new Date(product.updatedAt).toLocaleDateString()
//                           : new Date(product.createdAt).toLocaleDateString()}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Store-wise Stock Section */}
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-900 mb-4">
//                       {isVariantProduct ? 'Variant Stock by Location' : 'Store-wise Stock'}
//                     </h3>
//                     {/* Table Header */}
//                     <div className="grid grid-cols-5 gap-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200">
//                       <div>Location</div>
//                       <div>Stock</div>
//                       <div>Min. Level</div>
//                       <div>Status</div>
//                       <div>Actions</div>
//                     </div>
//                     {/* Table Rows */}
//                     <div className="space-y-2 mt-2">
//                       {isVariantProduct ? (
//                         /* Variant-specific stock display */
//                         <div className="grid grid-cols-5 gap-4 py-3 items-center">
//                           <div className="text-sm text-gray-900 font-medium">
//                             {product.store?.name || "Main Store"}
//                             {selectedVariant && (
//                               <div className="text-xs text-blue-600 mt-1">
//                                 {selectedVariant.name}
//                               </div>
//                             )}
//                           </div>
//                           <div className="text-sm text-gray-900 font-semibold">
//                             {displayData.quantity} units
//                           </div>
//                           <div className="text-sm text-gray-900">10 units</div>
//                           <div>
//                             <span
//                               className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                 displayData.quantity > 50
//                                   ? "bg-green-100 text-green-800"
//                                   : displayData.quantity > 20
//                                     ? "bg-yellow-100 text-yellow-800"
//                                     : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {displayData.quantity > 50
//                                 ? "Normal"
//                                 : displayData.quantity > 20
//                                   ? "Low"
//                                   : "Critical"}
//                             </span>
//                           </div>
//                           <div>
//                             <button className="text-gray-400 hover:text-gray-600">
//                               <svg
//                                 className="w-4 h-4"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth={2}
//                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                 />
//                               </svg>
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         /* Single product stock display */
//                         <div className="grid grid-cols-5 gap-4 py-3 items-center">
//                           <div className="text-sm text-gray-900 font-medium">
//                             {product.store?.name || "Main Store"}
//                           </div>
//                           <div className="text-sm text-gray-900 font-semibold">
//                             {displayData.quantity} units
//                           </div>
//                           <div className="text-sm text-gray-900">10 units</div>
//                           <div>
//                             <span
//                               className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                 displayData.quantity > 50
//                                   ? "bg-green-100 text-green-800"
//                                   : displayData.quantity > 20
//                                     ? "bg-yellow-100 text-yellow-800"
//                                     : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {displayData.quantity > 50
//                                 ? "Normal"
//                                 : displayData.quantity > 20
//                                   ? "Low"
//                                   : "Critical"}
//                             </span>
//                           </div>
//                           <div>
//                             <button className="text-gray-400 hover:text-gray-600">
//                               <svg
//                                 className="w-4 h-4"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth={2}
//                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                 />
//                               </svg>
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* All Variants Overview - Show only for variant products */}
//                   {isVariantProduct && product.variants && (
//                     <div className="mt-8 border-t pt-6">
//                       <h3 className="text-sm font-medium text-gray-900 mb-4">
//                         All Variants Stock Overview
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {product.variants.map((variant, index) => (
//                           <div 
//                             key={variant.id || index}
//                             className={`p-4 rounded-lg border transition-all ${
//                               selectedVariant?.id === variant.id || 
//                               (selectedVariant?.name === variant.name && index === 0)
//                                 ? 'border-blue-500 bg-blue-50'
//                                 : 'border-gray-200 bg-gray-50'
//                             }`}
//                           >
//                             <div className="flex justify-between items-start mb-2">
//                               <div className="font-medium text-gray-900">
//                                 {variant.name}
//                               </div>
//                               <span
//                                 className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                   (variant.quantity || 0) > 50
//                                     ? "bg-green-100 text-green-800"
//                                     : (variant.quantity || 0) > 20
//                                       ? "bg-yellow-100 text-yellow-800"
//                                       : "bg-red-100 text-red-800"
//                                 }`}
//                               >
//                                 {variant.quantity || 0} units
//                               </span>
//                             </div>
//                             <div className="text-sm text-gray-600">
//                               Price: ${variant.price || '0.00'}
//                             </div>
//                             {variant.color && (
//                               <div className="text-sm text-gray-600">
//                                 Color: {variant.color}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* History Section */}
//               <div className="bg-white rounded-lg">
//                 <div className="flex justify-between items-center border-b border-gray-200 pb-5 p-5">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     History
//                   </h2>
//                   <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
//                     View All
//                   </button>
//                 </div>

//                 <div className="overflow-x-auto p-6">
//                   <table className="min-w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Date & Time
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Type
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Quantity
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Amount
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Status
//                         </th>
//                         <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
//                           Reference
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {/* Always show product creation entry */}
//                       <tr className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm text-gray-900">
//                           {new Date(product.createdAt).toLocaleDateString()}{" "}
//                           {new Date(product.createdAt).toLocaleTimeString()}
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
//                             Product Created
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           +{product.itemQuantity || 0}
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                           $
//                           {(
//                             (product.singleItemCostPrice || 0) *
//                             (product.itemQuantity || 0)
//                           ).toFixed(2)}
//                         </td>
//                         <td className="py-3 px-4 text-sm">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             Active
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                           PROD-{product.id?.substring(0, 8)}
//                         </td>
//                       </tr>

//                       {/* Purchase Orders */}
//                       {product.purchaseOrders &&
//                       product.purchaseOrders.length > 0 ? (
//                         product.purchaseOrders.map((po, index) => (
//                           <tr
//                             key={po.id || index}
//                             className="border-b border-gray-100 hover:bg-gray-50"
//                           >
//                             <td className="py-3 px-4 text-sm text-gray-900">
//                               {po.createdAt
//                                 ? new Date(po.createdAt).toLocaleDateString()
//                                 : new Date(
//                                     product.createdAt
//                                   ).toLocaleDateString()}
//                             </td>
//                             <td className="py-3 px-4 text-sm">
//                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                                 Purchase Order
//                               </span>
//                             </td>
//                             <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                               +{po.quantity || 0}
//                             </td>
//                             <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                               ${po.total?.toFixed(2) || "0.00"}
//                             </td>
//                             <td className="py-3 px-4 text-sm">
//                               <span
//                                 className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                   po.status === "active"
//                                     ? "bg-green-100 text-green-800"
//                                     : "bg-gray-100 text-gray-800"
//                                 }`}
//                               >
//                                 {po.status || "Unknown"}
//                               </span>
//                             </td>
//                             <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                               PO-{po.id?.substring(0, 8) || `${index + 1}`}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr className="border-b border-gray-100 hover:bg-gray-50">
//                           <td className="py-3 px-4 text-sm text-gray-900">
//                             Today 10:21 AM
//                           </td>
//                           <td className="py-3 px-4 text-sm">
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                               {isVariantProduct ? 'Variant Sale (Sample)' : 'Sale (Sample)'}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                             -1
//                           </td>
//                           <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
//                             ${isVariantProduct && selectedVariant 
//                               ? selectedVariant.price?.toFixed(2) || '0.00'
//                               : product.singleItemSellingPrice || "0.00"}
//                           </td>
//                           <td className="py-3 px-4 text-sm">
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                               Completed
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-sm text-gray-900 font-mono">
//                             {isVariantProduct && selectedVariant 
//                               ? `VAR-${selectedVariant.name.substring(0, 3).toUpperCase()}-001`
//                               : 'SAMPLE-001'}
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Suppliers */}
//               <div className="bg-white rounded-lg">
//                 <div className="flex justify-between items-center border-b border-gray-200 pb-5 p-5">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     Suppliers
//                   </h2>
//                 </div>

//                 <div className="p-6">
//                   {/* Table Header */}
//                   <div className="grid grid-cols-5 gap-4 pb-3 mb-4 text-sm font-medium text-gray-500 border-b border-gray-200">
//                     <div>Supplier Name</div>
//                     <div>Contact Info</div>
//                     <div>Address</div>
//                     <div>Cost Price</div>
//                     <div>Status</div>
//                   </div>

//                   {/* Table Rows */}
//                   <div className="space-y-4">
//                     {product.productSuppliers &&
//                     product.productSuppliers.length > 0 ? (
//                       product.productSuppliers.map((productSupplier, index) => (
//                         <div
//                           key={productSupplier.id || index}
//                           className="grid grid-cols-5 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg px-2"
//                         >
//                           <div className="text-sm text-gray-900 font-medium">
//                             <div className="font-medium">
//                               {productSupplier.supplier?.name ||
//                                 "Unknown Supplier"}
//                             </div>
//                             {/* <div className="font-mono text-xs text-gray-500 mt-1">
//                               ID:{" "}
//                               {productSupplier.supplier?.id?.substring(0, 8) ||
//                                 "N/A"}
//                             </div> */}
//                           </div>
//                           <div className="text-sm">
//                             <div className="space-y-1">
//                               {productSupplier.supplier?.email && (
//                                 <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
//                                   {productSupplier.supplier.email}
//                                 </div>
//                               )}
//                               {productSupplier.supplier?.phone && (
//                                 <div className="text-gray-700">
//                                   {productSupplier.supplier.phone}
//                                 </div>
//                               )}
//                               {!productSupplier.supplier?.email &&
//                                 !productSupplier.supplier?.phone && (
//                                   <span className="text-gray-400">
//                                     No contact info
//                                   </span>
//                                 )}
//                             </div>
//                           </div>
//                           <div className="text-sm text-gray-600">
//                             <div
//                               className="max-w-xs truncate"
//                               title={productSupplier.supplier?.address}
//                             >
//                               {productSupplier.supplier?.address ||
//                                 "No address"}
//                             </div>
//                           </div>
//                           <div className="text-sm text-gray-900 font-semibold">
//                             ${productSupplier.costPrice?.toFixed(2) || "0.00"}
//                           </div>

//                           <div className="text-sm">
//                             <span
//                               className={`text-md ${productSupplier.state === "primary" ? "text-black-900 font-bold" : "text-black-700"}`}
//                               title={
//                                 productSupplier.state === "primary"
//                                   ? "Primary Supplier"
//                                   : "Secondary Supplier"
//                               }
//                             >
//                               {productSupplier.state === "primary"
//                                 ? "Primary"
//                                 : "Secondary"}
//                             </span>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-6 text-gray-500">
//                         No suppliers found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Fixed Action Footer */}
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50">
//           <div className="max-w-full mx-auto px-4 py-3">
//             <div className="flex flex-wrap gap-2 justify-center">
//               <button
//                 onClick={handleEdit}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                   />
//                 </svg>
//                 Edit Product
//               </button>

//               <button
//                 onClick={handleUpdateInventory}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//                 Update Inventory
//               </button>

//               <button
//                 onClick={handleCreatePurchaseOrder}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                   />
//                 </svg>
//                 Create Purchase Order
//               </button>

//               <button
//                 onClick={handleViewSalesReport}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                   />
//                 </svg>
//                 View Sales Report
//               </button>

//               <button
//                 onClick={handlePrintBarcode}
//                 className="bg-[#003f4a] text-white px-4 py-2 rounded hover:bg-[#002a32] transition-colors flex items-center gap-2 text-sm font-medium border border-[#003f4a]"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//                   />
//                 </svg>
//                 Print Barcode
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProductDetails;
