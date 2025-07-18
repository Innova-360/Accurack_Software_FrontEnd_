import React, { useState, useEffect } from "react";
import type { Product } from "../../data/inventoryData";

interface VariantDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirmDelete: (selectedPluUpcs: string[]) => void;
  isDeleting?: boolean;
}

const VariantDeleteModal: React.FC<VariantDeleteModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirmDelete,
  isDeleting = false,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());

  // Reset selected variants when modal opens/closes or product changes
  useEffect(() => {
    if (!isOpen || !product) {
      setSelectedVariants(new Set());
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  
  // Debug logging
  console.log('VariantDeleteModal - Product:', product);
  console.log('VariantDeleteModal - All Variants:', variants);
  console.log('VariantDeleteModal - HasValidVariants:', variants.some(v => v.pluUpc));

  const handleVariantToggle = (pluUpc: string) => {
    const newSelected = new Set(selectedVariants);
    if (newSelected.has(pluUpc)) {
      newSelected.delete(pluUpc);
    } else {
      newSelected.add(pluUpc);
    }
    setSelectedVariants(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPluUpcs = variants
        .filter(variant => variant.pluUpc)
        .map(variant => variant.pluUpc!);
      setSelectedVariants(new Set(allPluUpcs));
    } else {
      setSelectedVariants(new Set());
    }
  };

  const handleConfirm = () => {
    const selectedPluUpcs = Array.from(selectedVariants);
    onConfirmDelete(selectedPluUpcs);
  };

  const allVariantsSelected = variants.length > 0 && 
    variants.filter(v => v.pluUpc).every(v => selectedVariants.has(v.pluUpc!));

  const hasValidVariants = variants.some(v => v.pluUpc);

  return (
    <div className="fixed inset-0 z-50 flex items-center 
justify-center overflow-y-auto  backdrop-blur-md ">
      {/* Background overlay */}
      <div 
       className="fixed "
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Product Variants
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Select the variants you want to delete for "{product.name}". This action cannot be undone.
                  </p>

                  {!hasValidVariants ? (
                    <div className="text-sm text-gray-600 py-4">
                      No variants with valid PLU/UPC codes found for deletion.
                    </div>
                  ) : (
                    <>
                      {/* Select All Checkbox */}
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={allVariantsSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Select All Variants
                          </span>
                        </label>
                      </div>

                      {/* Variants List - Show all variants including base product */}
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {variants.map((variant, index) => {
                          const variantPluUpc = variant.pluUpc;
                          const isDisabled = !variantPluUpc;
                          
                          return (
                            <div
                              key={`${variant.id || index}-${variantPluUpc}`}
                              className={`flex items-center p-3 rounded-lg border ${
                                isDisabled 
                                  ? 'bg-gray-50 border-gray-200' 
                                  : 'bg-white border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                disabled={isDisabled}
                                checked={variantPluUpc ? selectedVariants.has(variantPluUpc) : false}
                                onChange={() => variantPluUpc && handleVariantToggle(variantPluUpc)}
                                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 disabled:opacity-50"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className={`text-sm font-medium ${
                                      isDisabled ? 'text-gray-400' : 'text-gray-900'
                                    }`}>
                                      {variant.name || `Variant ${index + 1}`}
                                      {index === 0 && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">
                                          Base Product
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>PLU: {variantPluUpc || 'N/A'}</span>
                                      {variant.sku && <span>SKU: {variant.sku}</span>}
                                      <span>Qty: {variant.quantity || 0}</span>
                                      <span>${variant.price.toFixed(2)}</span>
                                    </div>
                                  </div>
                                  {isDisabled && (
                                    <span className="text-xs text-gray-400 font-medium">
                                      No PLU/UPC
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Selection Summary */}
                      {selectedVariants.size > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded-md">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">{selectedVariants.size}</span> variant{selectedVariants.size !== 1 ? 's' : ''} selected for deletion
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={selectedVariants.size === 0 || isDeleting}
              onClick={handleConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                `Delete ${selectedVariants.size} Variant${selectedVariants.size !== 1 ? 's' : ''}`
              )}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
 
  );
};

export default VariantDeleteModal;
