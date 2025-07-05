import React from "react";
import { FaFileExport, FaChartBar } from "react-icons/fa";
import { Button } from "../buttons";

interface OrderTrackingHeaderProps {
  onExportData?: () => void;
  onViewAnalytics?: () => void;
}

const OrderTrackingHeader: React.FC<OrderTrackingHeaderProps> = ({ 
  onExportData,
  onViewAnalytics 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Tracking & Verification</h1>
        <p className="text-gray-600">
          Verify and track validated orders for payment processing
        </p>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-3">
        {onViewAnalytics && (
          <Button
            onClick={onViewAnalytics}
            variant="secondary"
            icon={<FaChartBar size={14} />}
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            Analytics
          </Button>
        )}
        {onExportData && (
          <Button
            onClick={onExportData}
            variant="secondary"
            icon={<FaFileExport size={14} />}
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            Export Data
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingHeader;
