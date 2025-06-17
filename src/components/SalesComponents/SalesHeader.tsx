import React from 'react';
import { FaPlus, FaFileAlt, FaChartLine } from 'react-icons/fa';

interface SalesHeaderProps {
  onNewSale?: () => void;
  onSalesReport?: () => void;
  onAnalytics?: () => void;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({
  onNewSale,
  onSalesReport,
  onAnalytics
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#03414C] mb-2">Sales Management</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onNewSale}
          className="flex items-center px-4 py-2 bg-[#03414C] text-white rounded-md hover:bg-[#025a6b] transition-colors"
        >
          <FaPlus size={14} className="mr-2" />
          New Sale
        </button>
        <button 
          onClick={onSalesReport}
          className="flex items-center px-4 py-2 bg-[#03414C] text-white rounded-md hover:bg-[#025a6b] transition-colors"
        >
          <FaFileAlt size={14} className="mr-2" />
          Sales Report
        </button>
        <button 
          onClick={onAnalytics}
          className="flex items-center px-4 py-2 bg-[#03414C] text-white rounded-md hover:bg-[#025a6b] transition-colors"
        >
          <FaChartLine size={14} className="mr-2" />
          Analytics
        </button>
      </div>
    </div>
  );
};

export default SalesHeader;
