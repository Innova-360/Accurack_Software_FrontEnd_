import React, { useState } from "react";
import type { Product } from "../../data/inventoryData";
import { productAPI } from "../../services/productAPI";
import VariantDeleteModal from "./VariantDeleteModal";
import ToastConfirmation, { showConfirmationToast } from "../reusablecomponents/ToastConfirmation";
import toast from "react-hot-toast";
// import { debugVariantQuantityUpdate } from "../../utils/variantQuantityUpdateTest";

interface InventoryTableProps {
  products: Product[];
  selectedItems: number[];
  startIndex: number;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (index: number, checked: boolean) => void;
  onSort: (key: string) => void;
  onProductDeleted?: () => void;
  onProductEdited?: (product: Product) => void;
  onProductViewed?: (product: Product) => void;
  isAnyQuantityEditing?: boolean;
  onEditingStateChange?: (isEditing: boolean) => void;
  showUpdateQuantity?: boolean; // Control update quantity icon visibility
  showDeleteButton?: boolean; // Control delete icon visibility
  showEditButton?: boolean; // Control edit icon visibility
  showActions?: boolean; // Control actions visibility
  showVariantDeleteButton?: boolean; // Control variant delete icon visibility
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  selectedItems,
  startIndex,
  sortConfig,
  onSelectAll,
  onSelectItem,
  onSort,
  onProductDeleted,
  onProductEdited,
  onProductViewed,
  isAnyQuantityEditing = false,
  onEditingStateChange,
  showUpdateQuantity = false, // Default to false
  showDeleteButton = true, // Default to true
  showEditButton = true, // Default to true
  showActions = false, // Default to false
  showVariantDeleteButton = false, // Default to false
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [editingQuantity, setEditingQuantity] = useState<{
    productId: string;
    variantIndex?: number;
    value: string;
  } | null>(null);
  const [updatingQuantity, setUpdatingQuantity] = useState<Set<string>>(
    new Set()
  );
  const [quantityError, setQuantityError] = useState<boolean>(false);
  const [variantDeleteModal, setVariantDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });
  const [isDeletingVariants, setIsDeletingVariants] = useState<boolean>(false);
  
  // Handle individual variant deletion with toast confirmation
  const handleVariantDelete = (variant: any, productName: string) => {
    const variantDisplayName = variant.name || `Variant ${variant.id?.slice(0, 8) || 'Unknown'}`;
    
    showConfirmationToast(
      `Are you sure to delete this variant "${variantDisplayName}" from "${productName}"?`,
      async () => {
        try {
          const pluUpc = variant.pluUpc;
          console.log('Deleting variant with PLU/UPC:', pluUpc);
          
          // Call the API to delete the variant
          await productAPI.deleteVariant(pluUpc);
          
          // Show success toast
          toast.success(`Variant "${variantDisplayName}" deleted successfully!`);
          
          // Call parent refresh callback to reload the data
          onProductDeleted?.();
          
        } catch (error) {
          console.error("Failed to delete variant:", error);
          // Show error toast
          toast.error("Failed to delete variant. Please try again.");
        }
      }
    );
  };
  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    showConfirmationToast(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      async () => {
        try {
          setDeletingProductId(productId);
          await productAPI.deleteProduct(productId);
          
          // Show success toast
          toast.success(`Product "${productName}" deleted successfully!`);
          
          onProductDeleted?.();
        } catch (error) {
          console.error("Failed to delete product:", error);
          // Show error toast
          toast.error("Failed to delete product. Please try again.");
        } finally {
          setDeletingProductId(null);
        }
      }
    );
  };

  const handleEditProduct = (product: Product) => {
    onProductEdited?.(product);
  };

  const handleViewProduct = (product: Product) => {
    onProductViewed?.(product);
  };

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };
  const getSortIcon = (key: string) => (
    <div className="flex flex-col">
      <span
        className={`text-xs ${sortConfig?.key === key && sortConfig.direction === "asc"
          ? "text-blue-600"
          : "text-gray-400"
          }`}
      >
        ▲
      </span>
      <span
        className={`text-xs ${sortConfig?.key === key && sortConfig.direction === "desc"
          ? "text-blue-600"
          : "text-gray-400"
          }`}
      >
        ▼
      </span>
    </div>
  );

  const handleEditQuantity = (
    productId: string,
    currentQuantity: number,
    variantIndex?: number
  ) => {
    if (isAnyQuantityEditing) return; // Prevent editing if already editing
    
    // Set global editing state
    onEditingStateChange?.(true);
    
    setEditingQuantity({
      productId,
      variantIndex,
      value: currentQuantity.toString(),
    });
  };

  const handleQuantityChange = (value: string) => {
    if (editingQuantity) {
      setEditingQuantity({
        ...editingQuantity,
        value: value,
      });
      // Only red border for invalid
      const newQuantity = parseInt(value, 10);
      if (value === "" || value === "0" || isNaN(newQuantity) || newQuantity < 0) {
        setQuantityError(true);
      } else {
        setQuantityError(false);
      }
    }
  };

  const handleQuantitySave = async () => {
    if (!editingQuantity) return;
    const newQuantity = parseInt(editingQuantity.value, 10);
    if (editingQuantity.value === "" || isNaN(newQuantity) || newQuantity < 0) {
      setQuantityError(true);
      return;
    }
    setQuantityError(false);

    const updateKey =
      editingQuantity.variantIndex !== undefined
        ? `${editingQuantity.productId}-variant-${editingQuantity.variantIndex}`
        : editingQuantity.productId;

    try {
      setUpdatingQuantity((prev) => new Set(prev).add(updateKey));

      // Check if we're updating a variant or main product
      if (editingQuantity.variantIndex !== undefined) {
        // Find the variant and its PLU/UPC
        const product = products.find(
          (p) => p.id === editingQuantity.productId
        );
        if (
          product?.variants &&
          product.variants[editingQuantity.variantIndex]
        ) {
          const variant = product.variants[editingQuantity.variantIndex];
          const pluUpc = variant.pluUpc;


          if (pluUpc) {
            // Update variant quantity using PLU/UPC
            console.log(`🔄 Updating variant quantity for PLU/UPC: ${pluUpc}`);
            await productAPI.updateVariantQuantityByPluUpc(pluUpc, newQuantity);
          } else {
            // Fallback to main product quantity update if no PLU/UPC found
            console.warn(
              "⚠️ No PLU/UPC found for variant, falling back to product quantity update"
            );

            await productAPI.updateProductQuantity(
              editingQuantity.productId,
              newQuantity
            );
          }
        } else {
          throw new Error("Variant not found in product");
        }
      } else {
        // Update main product quantity
        console.log(
          `🔄 Updating main product quantity for ID: ${editingQuantity.productId}`
        );
        await productAPI.updateProductQuantity(
          editingQuantity.productId,
          newQuantity
        );
      }

      // Refresh the product list to get updated data
      onProductDeleted?.(); // Reusing this callback to refresh the data

      setEditingQuantity(null);
      
      // Reset global editing state on success
      onEditingStateChange?.(false);
    } catch (error) {
      console.error("Failed to update quantity:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to update quantity. Please try again.";
      if (editingQuantity.variantIndex !== undefined) {
        errorMessage =
          "Failed to update variant quantity. Please check the PLU/UPC code and try again.";
      }

      // Check if it's a network error
      if (error instanceof Error && error.message.includes("Network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      console.log(errorMessage);
    } finally {
      setUpdatingQuantity((prev) => {
        const newSet = new Set(prev);
        newSet.delete(updateKey);
        return newSet;
      });
    }
  };

  const handleQuantityCancel = () => {
    setEditingQuantity(null);
    setQuantityError(false);
    
    // Reset global editing state
    onEditingStateChange?.(false);
  };

  const handleQuantityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQuantitySave();
    } else if (e.key === "Escape") {
      handleQuantityCancel();
    }
  };

  const handleVariantDeleteModalOpen = (product: Product) => {
    setVariantDeleteModal({
      isOpen: true,
      product: product,
    });
  };

  const handleVariantDeleteModalClose = () => {
    setVariantDeleteModal({
      isOpen: false,
      product: null,
    });
  };

  const handleVariantBulkDelete = async (selectedPluUpcs: string[]) => {
    if (selectedPluUpcs.length === 0) return;

    try {
      setIsDeletingVariants(true);
      
      console.log('🗑️ Bulk deleting variants with PLU/UPCs:', selectedPluUpcs);
      
      // Call the API to bulk delete variants
      await productAPI.bulkDeleteVariants(selectedPluUpcs);
      
      // Show success toast
      toast.success(`Successfully deleted ${selectedPluUpcs.length} variant${selectedPluUpcs.length !== 1 ? 's' : ''}!`);
      
      // Close modal and refresh data
      handleVariantDeleteModalClose();
      onProductDeleted?.(); // Refresh the product list
      
      console.log('✅ Successfully deleted variants');
    } catch (error) {
      console.error('❌ Failed to delete variants:', error);
      // Show error toast
      toast.error("Failed to delete variants. Please try again.");
    } finally {
      setIsDeletingVariants(false);
    }
  };

  console.log("Greate product", products);
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto w-full min-w-max bg-white">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={
                    products.length > 0 &&
                    selectedItems.length === products.length
                  }
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[150px]"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center justify-between">
                  Product Name
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("itemQuantity")}
              >
                <div className="flex items-center justify-between">
                  Qty
                  {getSortIcon("itemQuantity")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("pluUpc")}
              >
                <div className="flex items-center justify-between">
                  PLU
                  {getSortIcon("pluUpc")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[100px]"
                onClick={() => onSort("sku")}
              >
                <div className="flex items-center justify-between">
                  SKU
                  {getSortIcon("sku")}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[120px]">
                Description
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("singleItemSellingPrice")}
              >
                <div className="flex items-center justify-between">
                  Price
                  {getSortIcon("singleItemSellingPrice")}
                </div>
              </th>

              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("supplier")}
              >
                <div className="flex items-center justify-between">
                  Supplier
                  {getSortIcon("supplier")}
                </div>
              </th>

              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[100px]"
                onClick={() => onSort("category")}
              >
                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline">Category</span>
                  <span className="sm:hidden">Category</span>
                  {getSortIcon("category")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[90px]"
                onClick={() => onSort("minimumSellingQuantity")}
              >
                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline">Items/Pack</span>
                  <span className="sm:hidden">Items</span>
                  {getSortIcon("minimumSellingQuantity")}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[80px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product, index) => {
                const productKey = product.id || `product-${index}`;
                const isExpanded = expandedProducts.has(productKey);
                const hasVariantsToShow =
                  product.hasVariants &&
                  product.variants &&
                  product.variants.length > 0;

                // Get the first variant as base product data when product has variants
                const baseVariant = hasVariantsToShow && product.variants?.[0] ? product.variants[0] : null;
                
                return (
                  <React.Fragment key={productKey}>
                    {/* Main product row - shows first variant data if variants exist */}
                    <tr className="hover:bg-gray-50 group">
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(startIndex + index)}
                          onChange={(e) =>
                            onSelectItem(index, e.target.checked)
                          }
                          className="rounded"
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {hasVariantsToShow && (
                            <button
                              onClick={() => toggleProductExpansion(productKey)}
                              className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                            >
                              <svg
                                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? "rotate-90" : ""
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
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {hasVariantsToShow && baseVariant
                                ? (typeof baseVariant.name === "string"
                                    ? baseVariant.name
                                    : String(baseVariant.name || "Base Variant"))
                                : (typeof product.name === "string"
                                    ? product.name
                                    : String(product.name || "Unknown Product"))}
                            </div>
                            {hasVariantsToShow && (
                              <div className="text-xs text-gray-500">
                                Base Product • {(product.variants?.length || 0) - 1} additional variants
                              </div>
                            )}
                          </div>
                          {((hasVariantsToShow && baseVariant && (baseVariant.quantity || 0) < 10) || 
                            (!hasVariantsToShow && product.quantity < 10)) && (
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0"
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
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="flex items-center gap-2">
                          {editingQuantity?.productId === productKey &&
                            editingQuantity.variantIndex === (hasVariantsToShow ? 0 : undefined) ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={editingQuantity.value}
                                onChange={(e) =>
                                  handleQuantityChange(e.target.value)
                                }
                                onKeyDown={handleQuantityKeyPress}
                                onBlur={handleQuantitySave}
                                className={`w-16 px-1 py-1 text-xs border ${quantityError ? 'border-red-500' : 'border-blue-300 focus:ring-1 focus:ring-blue-500'} rounded focus:outline-none `}
                                autoFocus
                              />
                              <button
                                onClick={handleQuantitySave}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Save quantity"
                                disabled={updatingQuantity.has(hasVariantsToShow ? `${productKey}-variant-0` : productKey)}
                              >
                                {updatingQuantity.has(hasVariantsToShow ? `${productKey}-variant-0` : productKey) ? (
                                  <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg
                                    className="w-3 h-3"
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
                                )}
                              </button>
                              <button
                                onClick={handleQuantityCancel}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Cancel editing"
                              >
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  (hasVariantsToShow && baseVariant 
                                    ? (baseVariant.quantity || 0) 
                                    : (product.quantity || 0)) < 10
                                    ? "text-red-600 font-bold"
                                    : ""
                                }
                              >
                                {updatingQuantity.has(hasVariantsToShow ? `${productKey}-variant-0` : productKey) ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>{hasVariantsToShow && baseVariant ? baseVariant.quantity || 0 : product.quantity}</span>
                                  </div>
                                ) : (
                                  hasVariantsToShow && baseVariant ? baseVariant.quantity || 0 : product.quantity
                                )}
                              </span>
                              {!updatingQuantity.has(hasVariantsToShow ? `${productKey}-variant-0` : productKey) && showUpdateQuantity && (
                                <button
                                  onClick={() =>
                                    handleEditQuantity(
                                      productKey,
                                      hasVariantsToShow && baseVariant ? baseVariant.quantity || 0 : product.quantity,
                                      hasVariantsToShow ? 0 : undefined
                                    )
                                  }
                                  className={`text-gray-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                    isAnyQuantityEditing ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  title="Edit quantity"
                                  disabled={isAnyQuantityEditing}
                                >
                                  <svg
                                    className="w-3 h-3"
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
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                        <div className="truncate">
                          {hasVariantsToShow && baseVariant
                            ? (baseVariant.pluUpc ? baseVariant.pluUpc.split("/")[0] : "-")
                            : (typeof product.plu === "string"
                                ? product.plu.split("/")[0]
                                : String(product.plu || "N/A"))}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                        <div className="truncate">
                          {hasVariantsToShow && baseVariant
                            ? (baseVariant.sku || baseVariant.id?.slice(0, 8) || "-")
                            : (typeof product.sku === "string"
                                ? product.sku
                                : String(product.sku || "N/A"))}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div
                          className="truncate max-w-[120px] sm:max-w-none"
                          title={
                            hasVariantsToShow && baseVariant
                              ? `Base variant of ${typeof product.name === "string" ? product.name : String(product.name || "Product")}`
                              : (typeof product.description === "string" ? product.description : "")
                          }
                        >
                          {hasVariantsToShow && baseVariant
                            ? `Base variant of ${typeof product.name === "string" ? product.name : String(product.name || "Product")}`
                            : (typeof product.description === "string"
                                ? product.description
                                : String(product.description || "No description"))}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        {hasVariantsToShow && baseVariant
                          ? `$${baseVariant.price.toFixed(2)}`
                          : (typeof product.price === "string"
                              ? product.price
                              : typeof product.price === "number"
                                ? `$${(product.price as number).toFixed(2)}`
                                : "$0.00")}
                      </td>

                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="truncate">
                          {typeof product.supplier === "string"
                            ? product.supplier
                            : (product.supplier as any)?.name ||
                            (product.productSuppliers &&
                              product.productSuppliers.length > 0 &&
                              product.productSuppliers[0].supplier &&
                              product.productSuppliers[0].supplier.name) ||
                            "supplier not found"}
                        </div>
                      </td>

                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="truncate">
                          {typeof product.category === "string"
                            ? product.category
                            : (product.category as any)?.name ||
                            "Uncategorized"}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        {typeof product.minimumSellingQuantity === "number"
                          ? product.minimumSellingQuantity
                          : String(product.minimumSellingQuantity || "1")}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-green-500 hover:text-green-700 p-1 rounded transition-colors"
                            title="View product details"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          {/* Edit Button */}
                          {showEditButton && (
                          <button
                            onClick={() => handleEditProduct(product)}
                            disabled={false}
                            className="text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded transition-colors"
                            title="Edit product"
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
                          </button>
                          )}
                          {/* Delete Button */}
                          {showDeleteButton && (
                          <button
                            onClick={() => {
                              if (hasVariantsToShow && product.variants && product.variants.length > 0) {
                                // Open variant deletion modal for products with variants
                                handleVariantDeleteModalOpen(product);
                              } else {
                                // Delete entire product (no variants)
                                const id = product.id || product.sku || product.plu;
                                if (id) {
                                  handleDeleteProduct(id, product.name);
                                }
                              }
                            }}
                            disabled={
                              (hasVariantsToShow 
                                ? false // Always allow modal to open for variant products
                                : (!product.id && !product.sku && !product.plu)) ||
                              deletingProductId === (product.id || product.sku || product.plu)
                            }
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded transition-colors"
                            title={hasVariantsToShow ? "Delete variants" : "Delete product"}
                          >
                            {deletingProductId === product.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
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
                            )}
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Variant rows - skip first variant (index 0) as it's shown as base product */}
                    {hasVariantsToShow &&
                      isExpanded &&
                      product.variants?.slice(1).map((variant, variantIndex) => {
                        const actualVariantIndex = variantIndex + 1; // Adjust for skipped first variant
                        return (
                        <tr
                          key={`${productKey}-variant-${actualVariantIndex}`}
                          className="bg-gray-50 hover:bg-gray-100"
                        >
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            {/* Empty checkbox column for variants */}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <div className="pl-4 sm:pl-6 flex items-center gap-1 sm:gap-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                              <span className="text-gray-700 truncate">
                                {typeof variant.name === "string"
                                  ? variant.name
                                  : String(variant.name || "Variant")}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300 text-gray-600">
                            <div className="flex items-center gap-2">
                              {editingQuantity?.productId === productKey &&
                                editingQuantity.variantIndex === actualVariantIndex ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={editingQuantity.value}
                                    onChange={(e) =>
                                      handleQuantityChange(e.target.value)
                                    }
                                    onKeyDown={handleQuantityKeyPress}
                                    onBlur={handleQuantitySave}
                                    className={`w-16 px-1 py-1 text-xs border ${quantityError ? 'border-red-500' : 'border-blue-300'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                    autoFocus
                                  />
                                  {/* {quantityError && (
                                    <div className="text-xs text-red-600 mt-1">{quantityError}</div>
                                  )} */}
                                  <button
                                    onClick={handleQuantitySave}
                                    className="text-green-600 hover:text-green-800 p-1"
                                    title="Save quantity"
                                    disabled={updatingQuantity.has(`${productKey}-variant-${actualVariantIndex}`)}
                                  >
                                    {updatingQuantity.has(`${productKey}-variant-${actualVariantIndex}`) ? (
                                      <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <svg
                                        className="w-3 h-3"
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
                                    )}
                                  </button>
                                  <button
                                    onClick={handleQuantityCancel}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Cancel editing"
                                  >
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
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={
                                      (variant.quantity || 0) < 10
                                        ? "text-red-600 font-bold"
                                        : ""
                                    }
                                  >
                                    {updatingQuantity.has(
                                      `${productKey}-variant-${actualVariantIndex}`
                                    ) ? (
                                      <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>{variant.quantity || 0}</span>
                                      </div>
                                    ) : (
                                      variant.quantity || 0
                                    )}
                                  </span>
                                  {!updatingQuantity.has(
                                    `${productKey}-variant-${actualVariantIndex}`
                                  ) && showUpdateQuantity && (
                                      <button
                                        onClick={() =>
                                          handleEditQuantity(
                                            productKey,
                                            variant.quantity || 0,
                                            actualVariantIndex
                                          )
                                        }
                                        className={`text-gray-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                          isAnyQuantityEditing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        title="Edit quantity"
                                        disabled={isAnyQuantityEditing}
                                      >
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                            <div className="truncate">
                              {variant.pluUpc
                                ? variant.pluUpc.split("/")[0]
                                : "-"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                            <div className="truncate">
                              {variant.sku || variant.id?.slice(0, 8) || "-"}
                            </div>
                          </td>

                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300 text-gray-600">
                            <div className="truncate max-w-[120px] sm:max-w-none">
                              Variant of{" "}
                              {typeof product.name === "string"
                                ? product.name
                                : String(product.name || "Product")}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <span>${variant.price.toFixed(2)}</span>
                          </td>

                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            {/* <div className="truncate">
                              {typeof product.supplier === "string"
                                ? product.supplier
                                : (product.supplier as any)?.name ||
                                  "No supplier"}
                            </div> */}

                            <div className="truncate">
                              {typeof product.supplier === "string"
                                ? product.supplier
                                : (product.supplier as any)?.name ||
                                (product.productSuppliers &&
                                  product.productSuppliers.length > 0 &&
                                  product.productSuppliers[0].supplier &&
                                  product.productSuppliers[0].supplier
                                    .name) ||
                                "supplier not found"}
                            </div>
                          </td>

                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <div className="truncate">
                              {typeof product.category === "string"
                                ? product.category
                                : (product.category as any)?.name ||
                                "Uncategorized"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <span>
                              {typeof product.minimumSellingQuantity ===
                              "number"
                                ? product.minimumSellingQuantity
                                : String(product.minimumSellingQuantity || "1")}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <div className="flex items-center gap-2">
                              {/* Delete Variant Button only if showVariantDeleteButton is true */}
                              {showVariantDeleteButton && (
                                <button
                                  onClick={() => {
                                    const productName = typeof product.name === "string"
                                      ? product.name
                                      : String(product.name || "Product");
                                    handleVariantDelete(variant, productName);
                                  }}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete variant"
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
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="px-2 sm:px-4 py-8 text-center text-gray-500 border-b border-gray-300 text-xs sm:text-sm"
                >
                  No products found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Variant Delete Modal */}
    <VariantDeleteModal
      isOpen={variantDeleteModal.isOpen}
      onClose={handleVariantDeleteModalClose}
      product={variantDeleteModal.product}
      onConfirmDelete={handleVariantBulkDelete}
      isDeleting={isDeletingVariants}
    />
  </>
  );

};
export default InventoryTable;

