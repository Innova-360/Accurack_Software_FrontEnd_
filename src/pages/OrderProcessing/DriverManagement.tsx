import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import useRequireStore from "../../hooks/useRequireStore";
import {
  fetchOrders,
  clearError,
} from "../../store/slices/orderProcessingSlice";
import type { AppDispatch, RootState } from "../../store";
import type { OrderItem } from "../../types/orderProcessing";

interface Driver {
  name: string;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

const DriverManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id: string }>();
  const currentStore = useRequireStore();

  // Redux state
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalOrders");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch orders data function
  const fetchOrdersData = useCallback(() => {
    if (currentStore?.id) {
      const params: any = {
        storeId: currentStore.id,
        page: 1,
        limit: 1000, // Get all orders for driver analysis
      };

      dispatch(fetchOrders(params));
    }
  }, [currentStore?.id, dispatch]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calculate driver statistics
  const getDriverStats = (): Driver[] => {
    const driverMap = new Map<string, Driver>();

    orders.forEach((order: OrderItem) => {
      const driverName = order.driverName;

      if (!driverMap.has(driverName)) {
        driverMap.set(driverName, {
          name: driverName,
          totalOrders: 0,
          activeOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          lastOrderDate: order.createdAt,
        });
      }

      const driver = driverMap.get(driverName)!;
      driver.totalOrders += 1;
      driver.totalRevenue += order.paymentAmount;

      if (order.status === "completed") {
        driver.completedOrders += 1;
      } else if (order.status === "pending" || order.status === "shipped") {
        driver.activeOrders += 1;
      }

      // Update last order date if this order is more recent
      if (new Date(order.createdAt) > new Date(driver.lastOrderDate)) {
        driver.lastOrderDate = order.createdAt;
      }
    });

    // Calculate average order value for each driver
    Array.from(driverMap.values()).forEach((driver) => {
      driver.averageOrderValue =
        driver.totalOrders > 0 ? driver.totalRevenue / driver.totalOrders : 0;
    });

    return Array.from(driverMap.values());
  };

  // Filter and sort drivers
  const getFilteredAndSortedDrivers = (): Driver[] => {
    let drivers = getDriverStats();

    // Filter by search term
    if (searchTerm.trim()) {
      drivers = drivers.filter((driver) =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort drivers
    drivers.sort((a, b) => {
      let aValue = a[sortBy as keyof Driver];
      let bValue = b[sortBy as keyof Driver];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return drivers;
  };

  const drivers = getFilteredAndSortedDrivers();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleBackToOrderProcessing = () => {
    navigate(
      storeId ? `/store/${storeId}/order-processing` : "/order-processing"
    );
  };

  const handleViewDriverOrders = (driverName: string) => {
    // Navigate to view orders with driver filter
    navigate(
      storeId
        ? `/store/${storeId}/order-processing/view-orders?driver=${encodeURIComponent(driverName)}`
        : `/order-processing/view-orders?driver=${encodeURIComponent(driverName)}`
    );
  };

  useEffect(() => {
    if (!currentStore?.id) {
      navigate("/stores");
    }
  }, [currentStore, navigate]);

  if (!currentStore?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Driver Management
              </h1>
              <button
                onClick={handleBackToOrderProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Order Processing
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Driver Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <div className="text-2xl font-bold text-teal-600">
                {drivers.length}
              </div>
              <div className="text-sm text-gray-600">Total Drivers</div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="text-2xl font-bold text-green-600">
                {drivers.filter((d) => d.activeOrders > 0).length}
              </div>
              <div className="text-sm text-gray-600">Active Drivers</div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="text-2xl font-bold text-blue-600">
                {drivers.reduce((sum, d) => sum + d.totalOrders, 0)}
              </div>
              <div className="text-sm text-gray-600">
                Total Orders Delivered
              </div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="text-2xl font-bold text-purple-600">
                $
                {drivers.reduce((sum, d) => sum + d.totalRevenue, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                Total Revenue Generated
              </div>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Driver Performance
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : drivers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No drivers found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "No drivers match your search criteria."
                      : "No orders with drivers have been created yet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("name")}
                      >
                        Driver Name
                        {sortBy === "name" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("totalOrders")}
                      >
                        Total Orders
                        {sortBy === "totalOrders" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("activeOrders")}
                      >
                        Active Orders
                        {sortBy === "activeOrders" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("completedOrders")}
                      >
                        Completed Orders
                        {sortBy === "completedOrders" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("totalRevenue")}
                      >
                        Total Revenue
                        {sortBy === "totalRevenue" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("averageOrderValue")}
                      >
                        Avg Order Value
                        {sortBy === "averageOrderValue" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("lastOrderDate")}
                      >
                        Last Order
                        {sortBy === "lastOrderDate" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {driver.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.totalOrders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              driver.activeOrders > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {driver.activeOrders}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {driver.completedOrders}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${driver.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${driver.averageOrderValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(driver.lastOrderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDriverOrders(driver.name)}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            View Orders
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverManagementPage;
