import React, { useState, useEffect } from 'react';
import { FaTimes, FaBox, FaSearch, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import apiClient from '../../services/api';
import toast from 'react-hot-toast';
import type { Supplier } from './types';

interface AssignedProduct {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  costPrice?: number;
  sellingPrice?: number;
  quantity?: number;
  status?: string;
  assignedAt?: string;
  categoryId?: string;
  ean?: string;
  pluUpc?: string;
  itemQuantity?: number;
  msrpPrice?: number;
  singleItemSellingPrice?: number;
}

interface ViewAssignedProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const ViewAssignedProductsModal: React.FC<ViewAssignedProductsModalProps> = ({
  isOpen,
  onClose,
  supplier,
}) => {
  const [products, setProducts] = useState<AssignedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch assigned products when modal opens
  useEffect(() => {
    if (isOpen && supplier) {
      fetchAssignedProducts();
    }
  }, [isOpen, supplier]);

  const fetchAssignedProducts = async () => {
    if (!supplier) return;

    try {
      setLoading(true);
      const supplierId = supplier.id || supplier.supplier_id;
      
      console.log('Fetching assigned products for supplier:', supplierId);
      
      // Using the exact API endpoint you specified
      const response = await apiClient.get(`/supplier/${supplierId}/products`);
      
      console.log('Assigned products response:', response.data);
      
      // Handle the API response structure based on your actual response format
      let assignedProducts = [];
      
      if (response.data?.success && response.data?.data?.data && Array.isArray(response.data.data.data)) {
        // Handle the actual API response structure
         assignedProducts = response.data.data.data.map((assignment: any) => {
          const product = assignment.product || {};
          return {
            id: product.id || assignment.productId || assignment.id,
            name: product.name || 'N/A',
            sku: product.pluUpc || product.sku || 'N/A',
            categoryId: product.categoryId,
            category: product.category?.name || 'Uncategorized',
            costPrice: assignment.costPrice ?? product.msrpPrice ?? 0,
            sellingPrice: product.singleItemSellingPrice ?? 0,
            quantity: product.itemQuantity ?? 0,
            status: 'active',
            supplierType: assignment.state || 'primary',
            assignedAt: assignment.createdAt || assignment.updatedAt || new Date().toISOString(),
            ean: product.ean,
            pluUpc: product.pluUpc,
            itemQuantity: product.itemQuantity,
            msrpPrice: product.msrpPrice,
            singleItemSellingPrice: product.singleItemSellingPrice
          };
        });
      } else if (response.data?.success && response.data?.data && Array.isArray(response.data.data)) {
        // Handle the case where data is directly in response.data.data
        assignedProducts = response.data.data.map((product: { id: any; name: any; pluUpc: any; sku: any; categoryId: any; msrpPrice: any; singleItemSellingPrice: any; itemQuantity: any; createdAt: any; updatedAt: any; }) => ({
          id: product.id,
          name: product.name,
          sku: product.pluUpc || product.sku,
          category: product.categoryId || 'Uncategorized',
          costPrice: product.msrpPrice || product.singleItemSellingPrice,
          sellingPrice: product.singleItemSellingPrice,
          quantity: product.itemQuantity,
          status: 'active',
          assignedAt: product.createdAt || product.updatedAt || new Date().toISOString()
        }));
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Fallback for direct data array
        assignedProducts = response.data.data.map((product: { id: any; name: any; pluUpc: any; sku: any; categoryId: any; msrpPrice: any; singleItemSellingPrice: any; itemQuantity: any; createdAt: any; updatedAt: any; }) => ({
          id: product.id,
          name: product.name,
          sku: product.pluUpc || product.sku,
          category: product.categoryId || 'Uncategorized',
          costPrice: product.msrpPrice || product.singleItemSellingPrice,
          sellingPrice: product.singleItemSellingPrice,
          quantity: product.itemQuantity,
          status: 'active',
          assignedAt: product.createdAt || product.updatedAt || new Date().toISOString()
        }));
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        assignedProducts = response.data.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.pluUpc || product.sku,
          category: product.categoryId || 'Uncategorized',
          costPrice: product.msrpPrice || product.singleItemSellingPrice,
          sellingPrice: product.singleItemSellingPrice,
          quantity: product.itemQuantity,
          status: 'active',
          assignedAt: product.createdAt || product.updatedAt || new Date().toISOString()
        }));
      }

      setProducts(assignedProducts);
      
      if (assignedProducts.length === 0) {
        toast.success(`No products assigned to ${supplier.name}`);
      } else {
        toast.success(`Found ${assignedProducts.length} assigned products`);
      }
    } catch (error: any) {
      console.error('Error fetching assigned products:', error);
      if (error.response?.status === 404) {
        setProducts([]);
        toast.error('No products found for this supplier');
      } 
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#043E49] to-[#0a5d5c] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center border-2 border-gray-300">
                <FaBox className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Assigned Products
                </h2>
                <p className="text-white text-opacity-80 text-sm">
                  Products assigned to {supplier?.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaTimes className="text-white w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent hover:border-gray-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <FaSpinner className="animate-spin text-[#043E49] w-6 h-6" />
                <span className="text-gray-600">Loading assigned products...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
                <FaExclamationCircle className="text-gray-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {products.length === 0 ? 'No Products Assigned' : 'No Products Found'}
              </h3>
              <p className="text-gray-600">
                {products.length === 0 
                  ? 'This supplier has no products assigned yet.'
                  : 'No products match your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Selling Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {product.category || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {product.quantity || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium border ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : product.status === 'inactive'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {product.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(product.assignedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products shown
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#043E49] text-white rounded-lg hover:bg-[#032e36] transition-colors font-medium border-2 border-gray-300 hover:border-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssignedProductsModal;
