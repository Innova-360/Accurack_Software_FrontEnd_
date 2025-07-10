import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export interface MSASalesData {
  sNo: number;
  clientName: string;
  companyName: string;
  phoneNumber: string;
  shippedFrom: string;
  businessStreet1: string;
  businessStreet2: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  shippedTo: string;
  shippedToStreet1: string;
  shippedToStreet2: string;
  shippedToCity: string;
  shippedToState: string;
  shippedToPostalCode: string;
  shipmentDate: string;
  totalValue: number;
  transactionId: string;
  paymentMethod: string;
  cashierName: string;
  status: string;
}

interface MSASalesTableProps {
  data: MSASalesData[];
}

type SortKey = keyof MSASalesData;
type SortDirection = 'asc' | 'desc';

const MSASalesTable: React.FC<MSASalesTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<SortKey>('sNo');
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
          <p className="text-lg">No MSA sales data available</p>
          <p className="text-sm mt-2">Complete some sales to see the MSA report</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      {/* MSA Standard Golden Triangle */}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} sales
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
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sNo')}
              >
                <div className="flex items-center space-x-1">
                  <span>S.No</span>
                  {getSortIcon('sNo')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Client Name</span>
                  {getSortIcon('clientName')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('companyName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Company Name</span>
                  {getSortIcon('companyName')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('phoneNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span>Phone Number</span>
                  {getSortIcon('phoneNumber')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedFrom')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped From</span>
                  {getSortIcon('shippedFrom')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('businessStreet1')}
              >
                <div className="flex items-center space-x-1">
                  <span>Business Street 1</span>
                  {getSortIcon('businessStreet1')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('businessStreet2')}
              >
                <div className="flex items-center space-x-1">
                  <span>Business Street 2</span>
                  {getSortIcon('businessStreet2')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('businessCity')}
              >
                <div className="flex items-center space-x-1">
                  <span>Business City</span>
                  {getSortIcon('businessCity')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('businessState')}
              >
                <div className="flex items-center space-x-1">
                  <span>Business State</span>
                  {getSortIcon('businessState')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('businessPostalCode')}
              >
                <div className="flex items-center space-x-1">
                  <span>Business Postal Code</span>
                  {getSortIcon('businessPostalCode')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedTo')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped To</span>
                  {getSortIcon('shippedTo')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedToStreet1')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped To Street 1</span>
                  {getSortIcon('shippedToStreet1')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedToStreet2')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped To Street 2</span>
                  {getSortIcon('shippedToStreet2')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedToCity')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped To City</span>
                  {getSortIcon('shippedToCity')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedToState')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped To State</span>
                  {getSortIcon('shippedToState')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shippedToPostalCode')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipped To Postal Code</span>
                  {getSortIcon('shippedToPostalCode')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shipmentDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipment Date</span>
                  {getSortIcon('shipmentDate')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalValue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Value</span>
                  {getSortIcon('totalValue')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('transactionId')}
              >
                <div className="flex items-center space-x-1">
                  <span>Transaction ID</span>
                  {getSortIcon('transactionId')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('paymentMethod')}
              >
                <div className="flex items-center space-x-1">
                  <span>Payment Method</span>
                  {getSortIcon('paymentMethod')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cashierName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cashier Name</span>
                  {getSortIcon('cashierName')}
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.sNo}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.clientName}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.companyName}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.phoneNumber}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedFrom}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.businessStreet1}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.businessStreet2}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.businessCity}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.businessState}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.businessPostalCode}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedTo}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedToStreet1}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedToStreet2}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedToCity}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedToState}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shippedToPostalCode}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shipmentDate}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.totalValue.toFixed(2)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.transactionId}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.paymentMethod}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.cashierName}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {paginatedData.map((item, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.clientName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.companyName}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">${item.totalValue.toFixed(2)}</span>
                  <p className="text-xs text-gray-500 mt-1">{item.shipmentDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-1 text-gray-900">{item.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="ml-1 text-gray-900">{item.transactionId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Payment:</span>
                  <span className="ml-1 text-gray-900">{item.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-1 text-gray-900">{item.status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Shipped From:</span>
                  <span className="ml-1 text-gray-900">{item.shippedFrom}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Shipped To:</span>
                  <span className="ml-1 text-gray-900">{item.shippedTo}</span>
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

export default MSASalesTable;
