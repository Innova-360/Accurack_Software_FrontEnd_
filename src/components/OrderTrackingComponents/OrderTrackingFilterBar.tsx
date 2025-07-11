import React from "react";
import { FaSearch } from "react-icons/fa";

interface OrderTrackingFilterBarProps {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  verificationFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onVerificationChange: (value: string) => void;
  onClearFilters?: () => void;
}

const OrderTrackingFilterBar: React.FC<OrderTrackingFilterBarProps> = ({
  searchTerm,
  statusFilter,
  paymentFilter,
  verificationFilter,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onVerificationChange,
  onClearFilters,
}) => {
  const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "pending_verification", label: "Pending Verification" },
    { value: "under_review", label: "Under Review" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
  ];

  const paymentOptions = [
    { value: "All", label: "All Payment Types" },
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHECK", label: "Check" },
    { value: "DIGITAL_WALLET", label: "Digital Wallet" },
  ];

  const verificationOptions = [
    { value: "All", label: "All" },
    { value: "verified", label: "Verified Only" },
    { value: "unverified", label: "Unverified Only" },
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
            placeholder="Search by customer name, driver, order ID..."
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

        {/* Verification Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Verification:</span>
          <select
            value={verificationFilter}
            onChange={(e) => onVerificationChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {verificationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

export default OrderTrackingFilterBar;
