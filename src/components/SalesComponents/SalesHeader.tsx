import React from 'react';
import { FaPlus, FaFileAlt, FaChartLine } from 'react-icons/fa';
import { Button } from '../buttons';

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
      </div>      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onNewSale}
          variant="primary"
          icon={<FaPlus size={14} />}
        >
          New Sale
        </Button>
        <Button 
          onClick={onSalesReport}
          variant="primary"
          icon={<FaFileAlt size={14} />}
        >
          Sales Report
        </Button>
        <Button 
          onClick={onAnalytics}
          variant="primary"
          icon={<FaChartLine size={14} />}
        >
          Analytics
        </Button>
      </div>
    </div>
  );
};

export default SalesHeader;
