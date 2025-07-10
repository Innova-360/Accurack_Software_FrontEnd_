import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface MSAInventoryData {
  product: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  msaCategoryCode: string;
  itemsPerSellingUnit: number;
}

interface MSAInventoryTableProps {
  data: MSAInventoryData[];
}

type SortKey = keyof MSAInventoryData;
type SortDirection = 'asc' | 'desc';

const MSAInventoryTable: React.FC<MSAInventoryTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<SortKey>('msaCategoryCode');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-[#0f4d57]" />
      : <FaSortDown className="w-3 h-3 text-[#0f4d57]" />;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            i === currentPage
              ? 'bg-[#0f4d57] text-white border border-[#0f4d57]'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      );
    }

    return pages;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <p className="text-lg">No MSA inventory data available</p>
          <p className="text-sm mt-2">Add some products to your inventory to see the MSA report</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      {/* MSA Standard Golden Triangle - Bigger size */}
      <div className="absolute top-0 right-0 z-10 overflow-hidden rounded-tr-lg">
        <div className="relative w-36 h-36">
          {/* Golden Triangle Background */}
          <div 
            className="absolute top-0 right-0"
            style={{
              borderLeft: '144px solid transparent',
              borderTop: '144px solid #fbbf24',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
            }}
          ></div>
          {/* MSA Standard Text */}
          <div className="absolute top-5 right-5 transform rotate-45 origin-center">
            <span className="text-[13px] font-bold text-white whitespace-nowrap tracking-wider select-none">
              MSA
            </span>
            <br />
            <span className="text-[12px] font-bold text-white whitespace-nowrap tracking-wider select-none -mt-1 block">
              STANDARD
            </span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 pr-40">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} products
          </span>
          {/* Moved Show dropdown here to avoid triangle overlap */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Space for the triangle - keeps layout balanced */}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('product')}
              >
                <div className="flex items-center space-x-1">
                  <span>Product</span>
                  {getSortIcon('product')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center space-x-1">
                  <span>Description</span>
                  {getSortIcon('description')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  {getSortIcon('category')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  {getSortIcon('price')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center space-x-1">
                  <span>Quantity in hand</span>
                  {getSortIcon('stock')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('msaCategoryCode')}
              >
                <div className="flex items-center space-x-1">
                  <span>MSA Category Code</span>
                  {getSortIcon('msaCategoryCode')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('itemsPerSellingUnit')}
              >
                <div className="flex items-center space-x-1">
                  <span>Items Per Selling Unit</span>
                  {getSortIcon('itemsPerSellingUnit')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.product}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate" title={item.description}>
                    {item.description}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-medium ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.stock.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.msaCategoryCode}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.itemsPerSellingUnit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200">
          {paginatedData.map((item, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.product}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-1 text-gray-900">{item.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Quantity in hand</span>
                  <span className={`ml-1 font-medium ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.stock.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">MSA Category Code:</span>
                  <span className="ml-1 font-mono text-gray-900">{item.msaCategoryCode}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Items Per Unit:</span>
                  <span className="ml-1 text-gray-900">{item.itemsPerSellingUnit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {renderPagination()}
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default MSAInventoryTable;
