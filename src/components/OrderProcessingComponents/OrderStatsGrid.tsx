import React from 'react';
import { 
  FaShoppingCart, 
  FaClock, 
  FaCheckCircle, 
  FaTruck, 
  FaDollarSign, 
  FaChartLine 
} from 'react-icons/fa';
import type { OrderStats } from '../../types/orderProcessing';

interface StatsCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface OrderStatsGridProps {
  stats: OrderStats | null;
  loading: boolean;
}

const OrderStatsGrid: React.FC<OrderStatsGridProps> = ({ stats, loading }) => {
  // Generate stats cards from API data
  const getStatsCards = (data: OrderStats | null): StatsCard[] => {
    if (!data) {
      return [
        {
          title: "Total Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaShoppingCart />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Pending Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaClock />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Completed Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaCheckCircle />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Shipped Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaTruck />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Total Revenue",
          value: "$0.00",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaDollarSign />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Avg Order Value",
          value: "$0.00",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaChartLine />,
          color: 'bg-[#03414C]'
        }
      ];
    }

    return [
      {
        title: "Total Orders",
        value: data.totalOrders.toString(),
        change: "All time",
        changeType: 'positive',
        icon: <FaShoppingCart />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Pending Orders",
        value: data.pendingOrders.toString(),
        change: "Awaiting processing",
        changeType: 'neutral',
        icon: <FaClock />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Completed Orders",
        value: data.completedOrders.toString(),
        change: "Successfully delivered",
        changeType: 'positive',
        icon: <FaCheckCircle />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Shipped Orders",
        value: data.shippedOrders.toString(),
        change: "In transit",
        changeType: 'neutral',
        icon: <FaTruck />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Total Revenue",
        value: `$${data.totalRevenue.toFixed(2)}`,
        change: "From orders",
        changeType: 'positive',
        icon: <FaDollarSign />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Avg Order Value",
        value: `$${data.averageOrderValue.toFixed(2)}`,
        change: "Per order",
        changeType: 'positive',
        icon: <FaChartLine />,
        color: 'bg-[#03414C]'
      }
    ];
  };

  const statsCards = getStatsCards(stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statsCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  card.value
                )}
              </p>
              <p className={`text-xs mt-1 ${
                card.changeType === 'positive' ? 'text-green-600' :
                card.changeType === 'negative' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-3 w-20 rounded"></div>
                ) : (
                  card.change
                )}
              </p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <div className="text-white text-xl">
                {card.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatsGrid;
