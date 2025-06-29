import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../services/api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  sku?: string;
  msrpPrice: number;
  singleItemSellingPrice: number;
  itemQuantity: number;
}

interface ProductAssignment {
  productId: string;
  costPrice: number;
  category: 'primary' | 'secondary';
}

const AssignProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: storeId } = useParams();
  const location = useLocation();
  const { currentStore } = useAppSelector((state) => state.stores);
  
  // Get supplier info from navigation state
  const supplierInfo = location.state?.supplier;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [costPrices, setCostPrices] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Record<string, 'primary' | 'secondary'>>({});
  const [assigning, setAssigning] = useState(false);

  // Fetch products from inventory
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products for storeId:', currentStore?.id || storeId);
        
        const response = await apiClient.get('/product/list', {
          params: { storeId: currentStore?.id || storeId }
        });
        
        console.log('API Response:', response.data);
        
        let productList = [];
        
        // Based on your API response structure
        if (response.data?.data?.products) {
          productList = response.data.data.products;
        } else {
          console.log('Unexpected response structure:', response.data);
        }
        
        console.log('Extracted products:', productList);
        setProducts(productList || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (currentStore?.id || storeId) {
      fetchProducts();
    }
  }, [currentStore?.id, storeId]);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      const newCostPrices = { ...costPrices };
      const newCategories = { ...categories };
      delete newCostPrices[productId];
      delete newCategories[productId];
      setCostPrices(newCostPrices);
      setCategories(newCategories);
    } else {
      newSelected.add(productId);
      setCategories(prev => ({ ...prev, [productId]: 'secondary' })); // Default to secondary
    }
    setSelectedProducts(newSelected);
  };

  const handleCostPriceChange = (productId: string, price: number) => {
    setCostPrices(prev => ({
      ...prev,
      [productId]: price
    }));
  };

  const handleCategoryChange = (productId: string, category: 'primary' | 'secondary') => {
    setCategories(prev => ({
      ...prev,
      [productId]: category
    }));
  };

  const handleAssignProducts = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Validate all selected products have cost prices
    const missingPrices = Array.from(selectedProducts).filter(id => !costPrices[id] || costPrices[id] <= 0);
    if (missingPrices.length > 0) {
      toast.error('Please enter valid cost prices for all selected products');
      return;
    }

    try {
      setAssigning(true);
      
      const assignments: ProductAssignment[] = Array.from(selectedProducts).map(productId => ({
        productId,
        costPrice: costPrices[productId],
        category: categories[productId] || 'secondary'
      }));

      // API call to assign products to supplier
      await apiClient.post('/supplier/assign-products', {
        supplierId: supplierInfo?.id || supplierInfo?.supplier_id,
        storeId: currentStore?.id || storeId,
        products: assignments
      });

      toast.success(`Successfully assigned ${assignments.length} products to supplier`);
      navigate(`/store/${storeId}/supplier`);
    } catch (error: any) {
      console.error('Error assigning products:', error);
      toast.error(error.response?.data?.message || 'Failed to assign products');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03414C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/store/${storeId}/supplier`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-gray-600" size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Assign Products to Supplier
                </h1>
                <p className="text-sm text-gray-600">
                  {supplierInfo?.name || 'Unknown Supplier'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedProducts.size} products selected
              </span>
              <button
                onClick={handleAssignProducts}
                disabled={selectedProducts.size === 0 || assigning}
                className="bg-[#03414C] text-white px-4 py-2 rounded-lg hover:bg-[#025a6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaCheck size={16} />
                {assigning ? 'Assigning...' : 'Assign Products'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No products found matching your search' : 'No products available'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                          className="h-4 w-4 text-[#03414C] focus:ring-[#03414C] border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.singleItemSellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.itemQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {selectedProducts.has(product.id) ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter cost price"
                            value={costPrices[product.id] || ''}
                            onChange={(e) => handleCostPriceChange(product.id, parseFloat(e.target.value) || 0)}
                            className="w-32 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent text-sm"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">Select product first</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {selectedProducts.has(product.id) ? (
                          <select
                            value={categories[product.id] || 'secondary'}
                            onChange={(e) => handleCategoryChange(product.id, e.target.value as 'primary' | 'secondary')}
                            className="w-28 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent text-sm"
                          >
                            <option value="secondary">Secondary</option>
                            <option value="primary">Primary</option>
                          </select>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {selectedProducts.size > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedProducts.size}</div>
                <div className="text-sm text-blue-600">Products Selected</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${Object.values(costPrices).reduce((sum, price) => sum + (price || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Total Cost Value</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(costPrices).filter(id => costPrices[id] > 0).length}
                </div>
                <div className="text-sm text-purple-600">Ready to Assign</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignProductsPage;