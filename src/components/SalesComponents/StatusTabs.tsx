import React from "react";
import { CheckCircle, Clock, XCircle, Truck, Package, List } from "lucide-react";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (status: string) => void;
  salesCounts: {
    all: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    shipped: number;
    completed: number;
  };
}

const StatusTabs: React.FC<StatusTabsProps> = ({
  activeTab,
  onTabChange,
  salesCounts,
}) => {
  const tabs = [
    {
      id: "All",
      label: "All Sales",
      icon: <List className="h-4 w-4" />,
      count: salesCounts.all,
      color: "text-gray-600",
      activeColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "Pending",
      label: "Pending",
      icon: <Clock className="h-4 w-4" />,
      count: salesCounts.pending,
      color: "text-yellow-600",
      activeColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "Confirmed",
      label: "Confirmed",
      icon: <CheckCircle className="h-4 w-4" />,
      count: salesCounts.confirmed,
      color: "text-green-600",
      activeColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: "Shipped",
      label: "Shipped",
      icon: <Truck className="h-4 w-4" />,
      count: salesCounts.shipped,
      color: "text-blue-600",
      activeColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "Completed",
      label: "Completed",
      icon: <Package className="h-4 w-4" />,
      count: salesCounts.completed,
      color: "text-teal-600",
      activeColor: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      id: "Cancelled",
      label: "Cancelled",
      icon: <XCircle className="h-4 w-4" />,
      count: salesCounts.cancelled,
      color: "text-red-600",
      activeColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      
      {/* Horizontal Tab Layout */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-1 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? tab.activeColor
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {/* Icon */}
              <div>
                {tab.icon}
              </div>
              
              {/* Label */}
              <span>{tab.label}</span>
              
              {/* Active underline indicator */}
              {activeTab === tab.id && (
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full
                  ${tab.id === "All" ? "bg-blue-600" : ""}
                  ${tab.id === "Pending" ? "bg-yellow-600" : ""}
                  ${tab.id === "Confirmed" ? "bg-green-600" : ""}
                  ${tab.id === "Shipped" ? "bg-blue-600" : ""}
                  ${tab.id === "Completed" ? "bg-teal-600" : ""}
                  ${tab.id === "Cancelled" ? "bg-red-600" : ""}
                `}></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default StatusTabs;
