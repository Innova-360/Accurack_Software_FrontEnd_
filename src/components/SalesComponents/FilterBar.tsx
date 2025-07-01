import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface FilterBarProps {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  cashierFilter?: string;
  dateFilter?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onCashierChange?: (value: string) => void;
  onDateChange?: (value: string) => void;
  onClearFilters?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  statusFilter,
  paymentFilter,
  cashierFilter = "All",
  dateFilter = "Today",
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onCashierChange,
  onDateChange,
  onClearFilters
}) => {
  return (
    <div className="p-0">
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search sales by name, ID, phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div> 
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Partially Paid</option>
            <option>Refunded</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>All</option>
            <option>CASH</option>
            <option>CARD</option>
            <option>BANK_TRANSFER</option>
            <option>CHECK</option>
            <option>DIGITAL_WALLET</option>
          </select>
        </div>

        {/* Cashier Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Cashier:</span>
          <select
            value={cashierFilter}
            onChange={(e) => onCashierChange && onCashierChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>All</option>
            <option>John Doe</option>
            <option>Sarah Smith</option>
            <option>Mike Johnson</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => onDateChange && onDateChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <span className="text-teal-500">⊗</span>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
