import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { Button } from "../buttons";

interface SalesHeaderProps {
  onSalesReport?: () => void;
  onAnalytics?: () => void;
  onCreateSale?: () => void;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({ onCreateSale }) => {
  const navigate = useNavigate();
  const { id: storeId } = useParams();

  const handleNewSale = () => {
    if (onCreateSale) {
      onCreateSale();
    } else {
      // Fallback to direct navigation
      if (storeId) {
        navigate(`/store/${storeId}/sales/new`);
      } else {
        navigate("/sales/new");
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales</h1>
        <p className="text-gray-600">
          Manage and track all your sales transactions
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <Button
          onClick={handleNewSale}
          variant="primary"
          icon={<FaPlus size={14} />}
          className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] items-center"
        >
          New Sale
        </Button>
      </div>
    </div>
  );
};

export default SalesHeader;
