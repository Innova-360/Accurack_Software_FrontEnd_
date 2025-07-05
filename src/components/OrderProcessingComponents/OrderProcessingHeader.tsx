import React from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "../buttons";

interface OrderProcessingHeaderProps {
  onCreateOrder?: () => void;
  onExportOrders?: () => void;
  onOrderAnalytics?: () => void;
}

const OrderProcessingHeader: React.FC<OrderProcessingHeaderProps> = ({ 
  onCreateOrder,
//   onExportOrders,
//   onOrderAnalytics 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Processing</h1>
        <p className="text-gray-600">
          Manage and track all your order deliveries and processing
        </p>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-3">
        {/* {onOrderAnalytics && (
          <Button
            onClick={onOrderAnalytics}
            variant="secondary"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            Analytics
          </Button>
        )}
        {onExportOrders && (
          <Button
            onClick={onExportOrders}
            variant="secondary"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            Export
          </Button>
        )} */}
        <Button
          onClick={onCreateOrder}
          variant="primary"
          icon={<FaPlus size={14} />}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Add Order
        </Button>
      </div>
    </div>
  );
};

export default OrderProcessingHeader;
