import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface FilterBarProps {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  rowsPerPage: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onRowsPerPageChange: (value: number) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  statusFilter,
  paymentFilter,
  rowsPerPage,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onRowsPerPageChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
          />
        </div>
      </div>
      <div className="flex gap-2">        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
        >
          <option>All Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Refunded</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => onPaymentChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
        >
          <option>All Payments</option>
          <option>Cash</option>
          <option>Card</option>
          <option>Digital</option>
        </select>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
