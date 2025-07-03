import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { SpecialButton } from "../buttons";
import type { Product } from "../../data/inventoryData";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: EditProductFormData, productId: string) => void;
  product: Product | null;
}

export interface EditProductFormData {
  name: string;
  category: string;
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
  description?: string;
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
    description: "",
    packs: [],
    variants: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        ean: "",
        pluUpc: product.plu || "",
        productSuppliers: [
          {
            supplierId: "uuid-supplier-id", // This should be dynamic based on actual supplier
            costPrice: parseFloat(product.price.replace("$", "")) || 0,
            category: product.category || "",
            state: "primary",
          },
        ],
        sku: product.sku || "",
        singleItemCostPrice: parseFloat(product.price.replace("$", "")) || 0,
        itemQuantity: product.quantity || 0,
        msrpPrice: parseFloat(product.price.replace("$", "")) || 0,
        singleItemSellingPrice: parseFloat(product.price.replace("$", "")) || 0,
        discountAmount: 0,
        percentDiscount: 0,
        clientId: "uuid-client-id", // This should be dynamic
        storeId: "uuid-store-id", // This should be dynamic
        hasVariants: product.hasVariants || false,
        description: product.description || "",
        packs: [
          {
            minimumSellingQuantity: 10,
            totalPacksQuantity: 50,
            orderedPacksPrice:
              parseFloat(product.price.replace("$", "")) - 1 || 0,
            discountAmount: 0,
            percentDiscount: 5,
          },
        ],
        variants:
          product.variants?.map((variant) => ({
            name: variant.name || "",
            price: variant.price || 0,
            sku: variant.sku || "",
            packs: [
              {
                minimumSellingQuantity: 10,
                totalPacksQuantity: 50,
                orderedPacksPrice: (variant.price || 0) - 1,
                discountAmount: 0,
                percentDiscount: 5,
              },
            ],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 modal-overlay" onClick={handleClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0f4d57] rounded-lg">
              <FaEdit className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0f4d57]">Edit Product</h2>
              <p className="text-sm text-gray-600">
                Update product information
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.sku ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter SKU"
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
              )}
            </div>

            {/* PLU/UPC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PLU/UPC
              </label>
              <input
                type="text"
                name="pluUpc"
                value={formData.pluUpc}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter PLU/UPC"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Automotive">Automotive</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="itemQuantity"
                value={formData.itemQuantity}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.itemQuantity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter quantity"
              />
              {errors.itemQuantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.itemQuantity}
                </p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price ($) *
              </label>
              <input
                type="number"
                name="singleItemSellingPrice"
                value={formData.singleItemSellingPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] ${
                  errors.singleItemSellingPrice
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter selling price"
              />
              {errors.singleItemSellingPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.singleItemSellingPrice}
                </p>
              )}
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price ($)
              </label>
              <input
                type="number"
                name="singleItemCostPrice"
                value={formData.singleItemCostPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter cost price"
              />
            </div>

            {/* MSRP Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MSRP Price ($)
              </label>
              <input
                type="number"
                name="msrpPrice"
                value={formData.msrpPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter MSRP price"
              />
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Amount ($)
              </label>
              <input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter discount amount"
              />
            </div>

            {/* Percent Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percent Discount (%)
              </label>
              <input
                type="number"
                name="percentDiscount"
                value={formData.percentDiscount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
                placeholder="Enter percent discount"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57]"
              placeholder="Enter product description"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <SpecialButton variant="modal-cancel" onClick={handleClose}>
              Cancel
            </SpecialButton>
            <SpecialButton variant="modal-confirm" type="submit">
              Update Product
            </SpecialButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
