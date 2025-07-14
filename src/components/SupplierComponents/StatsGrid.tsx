import React from "react";
import type { Supplier, Product } from "./types";

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

interface StatsGridProps {
  viewMode: "suppliers" | "products";
  suppliers: Supplier[];
  selectedSupplier?: Supplier | null;
  currentSupplierProducts?: Product[];
  totalSuppliers?: number; // Total count from pagination
}

// Custom Chart Component
const SupplierChart: React.FC<{
  totalSuppliers: number;
  activeSuppliers: number;
}> = ({ totalSuppliers, activeSuppliers }) => {
  const activePercentage =
    totalSuppliers > 0 ? (activeSuppliers / totalSuppliers) * 100 : 0;
  const inactivePercentage = 100 - activePercentage;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Vendor Status Overview
      </h3>

      {/* Donut Chart */}
      <div className="relative w-48 h-48 mx-auto mb-4">
        <svg
          width="192"
          height="192"
          viewBox="0 0 192 192"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="20"
          />

          {/* Active suppliers arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#03414C"
            strokeWidth="20"
            strokeDasharray={`${(activePercentage / 100) * 502.65} 502.65`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Inactive suppliers arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeDasharray={`${(inactivePercentage / 100) * 502.65} 502.65`}
            strokeDashoffset={`-${(activePercentage / 100) * 502.65}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#03414C]">
              {totalSuppliers}
            </div>
            <div className="text-sm text-gray-600">Total Vendors</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#03414C] rounded-full"></div>
            <span className="text-sm text-gray-700">Active Vendors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {activeSuppliers}
            </span>
            <span className="text-xs text-gray-500">
              ({activePercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-700">Inactive Vendors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {totalSuppliers - activeSuppliers}
            </span>
            <span className="text-xs text-gray-500">
              ({inactivePercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Active Rate</span>
            <span>{activePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#03414C] h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${activePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({
  viewMode,
  suppliers,
  selectedSupplier,
  currentSupplierProducts = [],
  totalSuppliers,
}) => {
  if (viewMode === "suppliers") {
    const totalSuppliersCount = totalSuppliers ?? suppliers?.length ?? 0;
    // Since we don't have status field anymore, all suppliers are considered active
    const activeSuppliers = totalSuppliersCount;
    // Since we don't have totalValue and productsSupplied fields, we'll show 0 or remove these stats
    const totalValue = 0; // TODO: Calculate from actual products when available
    const totalProducts = 0; // TODO: Calculate from actual products when available

    return (
      <div className="space-y-4">
        {/* Simple Chart */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#03414C]">
                  {totalSuppliersCount}
                </div>
                <div className="text-sm text-gray-600">Total Vendors</div>
              </div>
              <div className="w-12 h-12 bg-[#03414C] bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#03414C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="w-6 h-6 text-[white]"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {activeSuppliers}
                </div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
  //       <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  //         <div className="text-2xl font-bold text-gray-900">{currentSupplierProducts.length}</div>
  //         <div className="text-sm text-gray-600">Products Available</div>
  //       </div>
  //       <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  //         <div className="text-2xl font-bold text-green-600">
  //           {currentSupplierProducts.filter(p => p.stock > 0).length}
  //         </div>
  //         <div className="text-sm text-gray-600">In Stock</div>
  //       </div>
  //       <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  //         <div className="text-2xl font-bold text-blue-600">
  //           {currentSupplierProducts.reduce((sum, p) => sum + p.stock, 0)}
  //         </div>
  //         <div className="text-sm text-gray-600">Total Stock</div>
  //       </div>
  //       <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  //         <div className="text-2xl font-bold text-teal-600">
  //           {formatCurrency(currentSupplierProducts.reduce((sum, p) => sum + (p.price * p.stock), 0))}
  //         </div>
  //         <div className="text-sm text-gray-600">Total Inventory Value</div>
  //       </div>
  //     </div>
  //   );
  // }

  return null;
};

export default StatsGrid;
