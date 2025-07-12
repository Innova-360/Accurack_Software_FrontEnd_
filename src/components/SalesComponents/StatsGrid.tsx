import React from 'react';
import { 
  FaChartLine, 
  FaFileAlt, 
  FaUsers, 
  FaShoppingCart, 
  FaBoxes, 
} from 'react-icons/fa';
import type { StatsData } from '../../services/salesService';
import { formatCurrency } from '../../services/salesService';

interface StatsCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  color: string;
}

interface StatsGridProps {
  stats: StatsData | null;
  loading: boolean;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading }) => {
  // Generate stats cards from API data
  const getStatsCards = (data: StatsData | null): StatsCard[] => {
    if (!data) {
      return [
        {
          title: "Today's Sales",
          value: "$0.00",
          change: "Loading...",
          changeType: 'positive',
          icon: <FaChartLine />,
          color: 'bg-teal-600'
        },
        {
          title: "Transactions",
          value: "0",
          change: "Loading...",
          changeType: 'positive',
          icon: <FaFileAlt />,
          color: 'bg-teal-600'
        },
        {
          title: "Customers",
          value: "0",
          change: "Loading...",
          changeType: 'positive',
          icon: <FaUsers />,
          color: 'bg-teal-600'
        },
        {
          title: "Avg. Transaction",
          value: "$0.00",
          change: "Loading...",
          changeType: 'positive',
          icon: <FaShoppingCart />,
          color: 'bg-teal-600'
        },
        {
          title: "Products Available",
          value: "0",
          change: "of 0 total",
          changeType: 'positive',
          icon: <FaBoxes />,
          color: 'bg-teal-600'
        },
      ];
    }

    return [
      {
        title: "Today's Sales",
        value: formatCurrency(data.todaysSales),
        // change: "+12.5% from yesterday",
        // changeType: 'positive',
        icon: <FaChartLine />,
        color: 'bg-teal-600'
      },
      {
        title: "Transactions",
        value: data.transactions.toString(),
        // change: "+3.2% from yesterday",
        // changeType: 'positive',
        icon: <FaFileAlt />,
        color: 'bg-teal-600'
      },
      {
        title: "Customers",
        value: data.customers.toString(),
        // change: "+5.1% from yesterday",
        // changeType: 'positive',
        icon: <FaUsers />,
        color: 'bg-teal-600'
      },
      {
        title: "Avg. Transaction",
        value: formatCurrency(data.avgTransaction),
        // change: "+2.7% from yesterday",
        // changeType: 'positive',
        icon: <FaShoppingCart />,
        color: 'bg-teal-600'
      },
      {
        title: "Products Available",
        value: data.productsAvailable.toString(),
        // change: "of 5 total",
        // changeType: 'positive',
        icon: <FaBoxes />,
        color: 'bg-teal-600'
      },
    ];
  };

  const statsCards = getStatsCards(stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {statsCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.color} text-white`}>
              {stat.icon}
            </div>
            <span className="text-xs text-gray-500">{stat.title}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {loading ? 'Loading...' : stat.value}
          </div>
          {/* <div className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {loading ? 'Loading...' : stat.change}
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;