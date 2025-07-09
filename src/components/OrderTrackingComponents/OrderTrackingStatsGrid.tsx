import React from 'react';
import { 
  FaClipboardList, 
  FaClock, 
  FaCheckCircle, 
  FaTimes, 
  FaDollarSign, 
  FaStopwatch 
} from 'react-icons/fa';
import type { OrderTrackingStats } from '../../types/orderTracking';

interface StatsCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface OrderTrackingStatsGridProps {
  stats: OrderTrackingStats | null;
  loading: boolean;
}

const OrderTrackingStatsGrid: React.FC<OrderTrackingStatsGridProps> = ({ stats, loading }) => {
  // Generate stats cards from API data
  const getStatsCards = (data: OrderTrackingStats | null): StatsCard[] => {
    if (!data) {
      return [
        {
          title: "Total Tracking Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaClipboardList />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Pending Verification",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaClock />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Verified Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaCheckCircle />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Rejected Orders",
          value: "0",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaTimes />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Verified Amount",
          value: "$0.00",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaDollarSign />,
          color: 'bg-[#03414C]'
        },
        {
          title: "Avg Verification Time",
          value: "0h",
          change: "Loading...",
          changeType: 'neutral',
          icon: <FaStopwatch />,
          color: 'bg-[#03414C]'
        }
      ];
    }

    return [
      {
        title: "Total Tracking Orders",
        value: data.totalTrackingOrders?.toString(),
        change: "All time",
        changeType: 'positive',
        icon: <FaClipboardList />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Pending Verification",
        value: data.pendingVerification?.toString(),
        change: "Awaiting review",
        changeType: 'neutral',
        icon: <FaClock />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Verified Orders",
        value: data.verifiedOrders?.toString(),
        change: "Payment confirmed",
        changeType: 'positive',
        icon: <FaCheckCircle />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Rejected Orders",
        value: data.rejectedOrders?.toString(),
        change: "Payment issues",
        changeType: 'negative',
        icon: <FaTimes />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Verified Amount",
        value: `$${data.totalVerifiedAmount?.toFixed(2)}`,
        change: "Total verified",
        changeType: 'positive',
        icon: <FaDollarSign />,
        color: 'bg-[#03414C]'
      },
      {
        title: "Avg Verification Time",
        value: `${data.averageVerificationTime?.toFixed(1)}h`,
        change: "Processing time",
        changeType: 'neutral',
        icon: <FaStopwatch />,
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

export default OrderTrackingStatsGrid;
