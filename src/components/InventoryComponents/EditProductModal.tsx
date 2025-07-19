import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import type { Product } from "../../data/inventoryData";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: EditProductFormData, productId: string) => void;
  product: Product | null;
}

export interface EditProductFormData {
  purchaseOrders?: Array<{
    id: string;
    quantity: number;
    total?: number;
    status: string;
  }>;
  name: string;
  category: string;
  description?: string;
  brandName?: string;
  location?: string;
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  ean: string;
  pluUpc: string;
  productSuppliers: Array<{
    supplierId: string;
    costPrice: number;
    category: string;
    state: string;
  }>;
  sku: string;
  singleItemCostPrice: number;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  discountAmount: number;
  percentDiscount: number;
  clientId: string;
  storeId: string;
  hasVariants: boolean;
  packs: Array<{
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    discountAmount: number;
    percentDiscount: number;
  }>;
  variants: Array<{
    name: string;
    price: number;
    sku: string;
    packs: Array<{
      minimumSellingQuantity: number;
      totalPacksQuantity: number;
      orderedPacksPrice: number;
      discountAmount: number;
      percentDiscount: number;
    }>;
  }>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
}) => {
  const [formData, setFormData] = useState<EditProductFormData>({
    name: "",
    category: "",
    description: "",
    brandName: "",
    location: "",
    attributes: [],
    ean: "",
    pluUpc: "",
    productSuppliers: [],
    sku: "",
    singleItemCostPrice: 0,
    itemQuantity: 0,
    msrpPrice: 0,
    singleItemSellingPrice: 0,
    discountAmount: 0,
    percentDiscount: 0,
    clientId: "",
    storeId: "",
    hasVariants: false,
    packs: [],
    variants: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category:
          typeof product.category === "string"
            ? product.category
            : product.category?.name || "",
        description: product.description || "",
        brandName: product.brandName || "",
        location: product.location || "",
        attributes: product.attributes || [],
        ean: product.ean || "",
        pluUpc: product.pluUpc || product.plu || "",
        productSuppliers: product.productSuppliers?.map(supplier => ({
          supplierId: supplier.supplierId || supplier.supplier?.id || "uuid-supplier-id",
          costPrice: supplier.costPrice || product.singleItemCostPrice || 0,
          category: supplier.categoryId || 
            (typeof product.category === "string"
              ? product.category
              : product.category?.name || ""),
          state: supplier.state || "primary",
        })) || [{
          supplierId: "uuid-supplier-id",
          costPrice: product.singleItemCostPrice || 0,
          category: typeof product.category === "string"
            ? product.category
            : product.category?.name || "",
          state: "primary",
        }],
        sku: product.sku || "",
        singleItemCostPrice: product.singleItemCostPrice || 0,
        itemQuantity: product.itemQuantity || product.quantity || 0,
        msrpPrice: product.msrpPrice || 0,
        singleItemSellingPrice: product.singleItemSellingPrice || 0,
        discountAmount: product.discountAmount || 0,
        percentDiscount: product.percentDiscount || 0,
        clientId: product.clientId || "uuid-client-id",
        storeId: product.storeId || product.store?.id || "uuid-store-id",
        hasVariants: product.hasVariants || false,
        packs: product.packs?.map(pack => ({
          minimumSellingQuantity: pack.minimumSellingQuantity || 1,
          totalPacksQuantity: pack.totalPacksQuantity || 1,
          orderedPacksPrice: pack.orderedPacksPrice || 0,
          discountAmount: pack.discountAmount || 0,
          percentDiscount: pack.percentDiscount || 0,
        })) || [{
          minimumSellingQuantity: 1,
          totalPacksQuantity: 1,
          orderedPacksPrice: product.singleItemSellingPrice || 0,
          discountAmount: 0,
          percentDiscount: 0,
        }],
        variants:
          product.variants?.map((variant) => ({
            name: variant.name || "",
            price: variant.price || 0,
            sku: variant.sku || "",
            packs: variant.packs?.map(pack => ({
              minimumSellingQuantity: pack.minimumSellingQuantity || 1,
              totalPacksQuantity: pack.totalPacksQuantity || 1,
              orderedPacksPrice: pack.orderedPacksPrice || variant.price || 0,
              discountAmount: pack.discountAmount || 0,
              percentDiscount: pack.percentDiscount || 0,
            })) || [{
              minimumSellingQuantity: 1,
              totalPacksQuantity: 1,
              orderedPacksPrice: variant.price || 0,
              discountAmount: 0,
              percentDiscount: 0,
            }],
          })) || [],
      });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "itemQuantity" ||
        name === "singleItemSellingPrice" ||
        name === "msrpPrice" ||
        name === "singleItemCostPrice" ||
        name === "discountAmount" ||
        name === "percentDiscount"
          ? parseFloat(value) || 0
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (formData.itemQuantity < 0) {
      newErrors.itemQuantity = "Quantity must be 0 or greater";
    }
    if (formData.singleItemSellingPrice <= 0) {
      newErrors.singleItemSellingPrice = "Price must be greater than 0";
    }
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && product) {
      const productId = product.id || product.sku || product.plu || "";
      onSave(formData, productId);
      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 animate-modal-enter">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#0f4d57] to-[#1a6b7a] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaEdit className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <p className="text-white/80 text-sm">
                  Update product information and pricing
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-lg"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-[#0f4d57] to-[#1a6b7a] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200 ${
                        errors.name
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 mt-2 text-red-600">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">{errors.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200 appearance-none ${
                        errors.category
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="">Select a category</option>
                      <option value="Electronics">📱 Electronics</option>
                      <option value="Clothing">👕 Clothing</option>
                      <option value="Home & Garden">🏠 Home & Garden</option>
                      <option value="Sports">⚽ Sports</option>
                      <option value="Books">📚 Books</option>
                      <option value="BEVERAGES">🍕 Food & Beverages</option>
                      <option value="Health & Beauty">
                        💄 Health & Beauty
                      </option>
                      <option value="Automotive">🚗 Automotive</option>
                      <option value="Other">📦 Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {errors.category && (
                      <div className="flex items-center gap-2 mt-2 text-red-600">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">{errors.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200 ${
                      errors.sku
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">{errors.sku}</span>
                    </div>
                  )}
                </div>

                {/* PLU/UPC */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PLU/UPC
                  </label>
                  <input
                    type="text"
                    name="pluUpc"
                    value={formData.pluUpc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                    placeholder="Enter PLU/UPC"
                  />
                </div>

                {/* EAN */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    EAN/Barcode
                  </label>
                  <input
                    type="text"
                    name="ean"
                    value={formData.ean}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                    placeholder="Enter EAN/Barcode"
                  />
                </div>
              </div>
            </div>

            {/* Inventory & Pricing Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-[#0f4d57] to-[#1a6b7a] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Inventory & Pricing
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="itemQuantity"
                      value={formData.itemQuantity}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200 ${
                        errors.itemQuantity
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">units</span>
                    </div>
                    {errors.itemQuantity && (
                      <div className="flex items-center gap-2 mt-2 text-red-600">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">{errors.itemQuantity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      name="singleItemSellingPrice"
                      value={formData.singleItemSellingPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200 ${
                        errors.singleItemSellingPrice
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.singleItemSellingPrice && (
                      <div className="flex items-center gap-2 mt-2 text-red-600">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">
                          {errors.singleItemSellingPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      name="singleItemCostPrice"
                      value={formData.singleItemCostPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* MSRP Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MSRP Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      name="msrpPrice"
                      value={formData.msrpPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      name="discountAmount"
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Percent Discount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Percent Discount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="percentDiscount"
                      value={formData.percentDiscount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-[#0f4d57] to-[#1a6b7a] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Additional Details
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200 resize-none"
                  placeholder="Enter detailed product description..."
                />
              </div>

              {/* Brand Name and Location in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                    placeholder="Enter brand name (e.g., Nike, Apple, Samsung)"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                    placeholder="Enter storage location (e.g., Aisle 3, Shelf B)"
                  />
                </div>
              </div>

              {/* Attributes Display */}
              {formData.attributes && formData.attributes.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Attributes
                  </label>
                  <div className="space-y-2">
                    {formData.attributes.map((attribute, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Attribute Name
                            </label>
                            <input
                              type="text"
                              value={attribute.name}
                              onChange={(e) => {
                                const updatedAttributes = [...(formData.attributes || [])];
                                updatedAttributes[index] = { ...updatedAttributes[index], name: e.target.value };
                                setFormData(prev => ({ ...prev, attributes: updatedAttributes }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                              placeholder="e.g., Color, Size"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Attribute Value
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={attribute.value}
                                onChange={(e) => {
                                  const updatedAttributes = [...(formData.attributes || [])];
                                  updatedAttributes[index] = { ...updatedAttributes[index], value: e.target.value };
                                  setFormData(prev => ({ ...prev, attributes: updatedAttributes }));
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:border-[#0f4d57] transition-all duration-200"
                                placeholder="e.g., Red, Large"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedAttributes = formData.attributes?.filter((_, i) => i !== index) || [];
                                  setFormData(prev => ({ ...prev, attributes: updatedAttributes }));
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newAttribute = { name: "", value: "" };
                      setFormData(prev => ({ 
                        ...prev, 
                        attributes: [...(prev.attributes || []), newAttribute] 
                      }));
                    }}
                    disabled={formData.attributes && formData.attributes.length >= 1}
                    className={`mt-2 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                      formData.attributes && formData.attributes.length >= 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#0f4d57] text-white hover:bg-[#083540]"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {formData.attributes && formData.attributes.length >= 1 ? "Only one attribute allowed" : "Add Attribute"}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Attributes
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-3">No attributes added yet</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newAttribute = { name: "", value: "" };
                        setFormData(prev => ({ 
                          ...prev, 
                          attributes: [...(prev.attributes || []), newAttribute] 
                        }));
                      }}
                      className="px-4 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#083540] transition-colors duration-200 flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Attribute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Enhanced Footer with gradient border */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-[#0f4d57] to-[#1a6b7a] text-white rounded-xl font-medium hover:from-[#0d3f47] hover:to-[#155a66] focus:outline-none focus:ring-2 focus:ring-[#0f4d57]/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Update Product
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
