import React from "react";
import { FaPlus } from "react-icons/fa";

interface OrderProcessingDashboardHeaderProps {
  onCreateOrder?: () => void;
  onExportOrders?: () => void;
}

const OrderProcessingDashboardHeader: React.FC<OrderProcessingDashboardHeaderProps> = ({ 
  onCreateOrder,
  onExportOrders,
}) => {

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Processing Dashboard</h1>
          <p className="text-gray-600">
            Manage and track all your order deliveries and processing
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {onExportOrders && (
            <button
              onClick={onExportOrders}
              className="px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors"
            >
              Export Orders
            </button>
          )}
          {onCreateOrder && (
            <button
              onClick={onCreateOrder}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus size={14} />
              <span>Add Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderProcessingDashboardHeader;
