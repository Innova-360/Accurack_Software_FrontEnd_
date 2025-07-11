import React from "react";
import { FaSearch } from "react-icons/fa";

interface OrderFilterBarProps {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  driverFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onDriverChange: (value: string) => void;
  onClearFilters?: () => void;
}

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  searchTerm,
  statusFilter,
  paymentFilter,
  driverFilter,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onDriverChange,
  onClearFilters,
}) => {
  const statusOptions: Array<{ value: string; label: string }> = [
    { value: "All", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentOptions: Array<{ value: string; label: string }> = [
    { value: "All", label: "All Payment Types" },
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHECK", label: "Check" },
    { value: "DIGITAL_WALLET", label: "Digital Wallet" },
  ];

  return (
    <div className="p-0">
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search orders by customer name, driver, order ID..."
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
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
            {paymentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Driver Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Driver:</span>
          <input
            type="text"
            placeholder="Filter by driver"
            value={driverFilter}
            onChange={(e) => onDriverChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-40"
          />
        </div>

        {/* Clear Filters Button */}
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderFilterBar;
