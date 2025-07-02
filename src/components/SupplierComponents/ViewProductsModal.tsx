import React from "react";
import { FaBox, FaTimes, FaDollarSign, FaBarcode, FaTag } from "react-icons/fa";
import { SpecialButton } from "../buttons";
import type { Supplier } from "./AddSupplierModal";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  supplierId: string;
}

interface ViewProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  products: Product[];
}

const ViewProductsModal: React.FC<ViewProductsModalProps> = ({
  isOpen,
  onClose,
  supplier,
  products,
}) => {
  if (!isOpen || !supplier) return null;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const supplierProducts = products.filter(
    (product) => product.supplierId === supplier.id
  );
  const totalProducts = supplierProducts.length;
  const totalValue = supplierProducts.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#03414C] rounded-lg">
              <FaBox className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#03414C]">
                Products Supplied
              </h2>
              <p className="text-sm text-gray-600">
                Products from {supplier.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaBox className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaDollarSign className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaTag className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalProducts > 0
                      ? formatCurrency(totalValue / totalProducts)
                      : "$0.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="p-6">
          {supplierProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaBox className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600">
                This supplier hasn't provided any products yet.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product List ({totalProducts})
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FaBarcode className="text-gray-400" size={12} />
                            <span className="text-sm font-mono text-gray-900">
                              {product.sku}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#03414C] bg-opacity-10 text-[#03414C]">
                            {typeof product.category === "string"
                              ? product.category
                              : product.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(product.price * product.stock)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <SpecialButton variant="modal-cancel" onClick={onClose} fullWidth>
            Close
          </SpecialButton>
        </div>
      </div>
    </div>
  );
};

export default ViewProductsModal;