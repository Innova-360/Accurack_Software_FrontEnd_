import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Tax, TaxListFilters } from "../../types/tax";
import { taxAPI } from "../../services/taxAPI";
import {
  formatTaxRate,
  formatCurrency,
  formatDate,
} from "../../utils/taxUtils";
import Header from "../Header";

interface TaxStats {
  total: number;
  active: number;
  inactive: number;
  totalTaxAmount: number;
  averageRate: number;
}

const EnhancedTaxList: React.FC = () => {
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [filters, setFilters] = useState<TaxListFilters>({
    search: "",
    type: "all",
    status: "all",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 10,
  });

  const [stats, setStats] = useState<TaxStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalTaxAmount: 0,
    averageRate: 0,
  });

  useEffect(() => {
    loadTaxes();
  }, [filters]);

  const loadTaxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taxAPI.getTaxes(filters);
      setTaxes(response.taxes);
      setTotalCount(response.total);

      // Calculate stats
      calculateStats(response.taxes);
    } catch (err) {
      setError("Failed to load taxes");
      console.error("Error loading taxes:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taxList: Tax[]) => {
    const total = taxList.length;
    const active = taxList.filter((tax) => tax.status === "active").length;
    const inactive = taxList.filter((tax) => tax.status === "inactive").length;

    // Calculate total potential tax amount (for percentage taxes, use average base price)
    const averageBasePrice = 1000; // Assumption for calculation
    const totalTaxAmount = taxList.reduce((sum, tax) => {
      if (tax.status === "active") {
        return (
          sum +
          (tax.type === "percentage"
            ? (averageBasePrice * tax.rate) / 100
            : tax.rate)
        );
      }
      return sum;
    }, 0);

    const averageRate =
      total > 0 ? taxList.reduce((sum, tax) => sum + tax.rate, 0) / total : 0;

    setStats({
      total,
      active,
      inactive,
      totalTaxAmount,
      averageRate,
    });
  };

  const handleFilterChange = (key: keyof TaxListFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset page when other filters change
    }));
  };
  const handleSort = (sortBy: TaxListFilters["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectTax = (taxId: string) => {
    setSelectedTaxes((prev) =>
      prev.includes(taxId)
        ? prev.filter((id) => id !== taxId)
        : [...prev, taxId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaxes.length === taxes.length && taxes.length > 0) {
      setSelectedTaxes([]);
    } else {
      setSelectedTaxes(taxes.map((tax) => tax.id));
    }
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (selectedTaxes.length === 0) return;

    const confirmMessage = {
      activate: `Are you sure you want to activate ${selectedTaxes.length} tax(es)?`,
      deactivate: `Are you sure you want to deactivate ${selectedTaxes.length} tax(es)?`,
      delete: `Are you sure you want to delete ${selectedTaxes.length} tax(es)? This action cannot be undone.`,
    };

    if (!window.confirm(confirmMessage[action])) {
      return;
    }

    try {
      setBulkActionLoading(true);

      if (action === "delete") {
        await Promise.all(selectedTaxes.map((id) => taxAPI.deleteTax(id)));
      } else {
        // For activate/deactivate, we'd need to implement batch update in the API
        // For now, update them one by one
        const status = action === "activate" ? "active" : "inactive";
        await Promise.all(
          selectedTaxes.map(async (id) => {
            const tax = taxes.find((t) => t.id === id);
            if (tax) {
              await taxAPI.updateTax(id, { ...tax, status } as any);
            }
          })
        );
      }

      setSelectedTaxes([]);
      await loadTaxes(); // Reload the list
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      alert(`Failed to ${action} selected taxes`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDelete = async (taxId: string, taxName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${taxName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(taxId);
      await taxAPI.deleteTax(taxId);
      await loadTaxes(); // Reload the list
    } catch (err) {
      alert("Failed to delete tax");
      console.error("Error deleting tax:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async () => {
    try {
      // In a real app, this would generate and download a CSV/Excel file
      const csvData = taxes.map((tax) => ({
        Name: tax.name,
        Rate: tax.rate,
        Type: tax.type,
        Status: tax.status,
        Description: tax.description || "",
        "Product Type": tax.productType || "",
        "Created At": formatDate(tax.createdAt),
        "Updated At": formatDate(tax.updatedAt),
        Assignments: tax.assignments.length,
        Rules: tax.rules.length,
      }));

      console.log("Export data:", csvData);
      alert("Export functionality would be implemented here");
    } catch (err) {
      console.error("Error exporting taxes:", err);
      alert("Failed to export taxes");
    }
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return filters.sortOrder === "asc" ? (
      <svg
        className="w-4 h-4 text-[#0f4d57]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-[#0f4d57]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    return status === "active" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const getTypeBadge = (type: "percentage" | "fixed") => {
    return type === "percentage" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Percentage
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Fixed
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
            <p className="mt-2 text-gray-600">
              Manage and configure tax rules for your inventory system
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              {showStats ? "Hide" : "Show"} Stats
            </button>
            <button
              onClick={() => navigate("/taxes/create")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0f4d57] hover:bg-[#0d3f47] focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:ring-offset-2 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Tax
            </button>
          </div>
        </div>

        {/* Statistics */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Taxes
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-semibold text-red-900">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rate</p>
                  <p className="text-2xl font-semibold text-purple-900">
                    {stats.averageRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Est. Tax</p>
                  <p className="text-2xl font-semibold text-yellow-900">
                    {formatCurrency(stats.totalTaxAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by tax name or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Results and pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {taxes.length} of {totalCount} taxes
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Show:
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTaxes.length > 0 && (
          <div className="bg-[#0f4d57] text-white p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {selectedTaxes.length} tax
                  {selectedTaxes.length !== 1 ? "es" : ""} selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkAction("activate")}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTaxes([])}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tax Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#0f4d57] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading taxes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadTaxes}
                className="px-4 py-2 bg-[#0f4d57] text-white rounded-md hover:bg-[#0d3f47] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : taxes.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 mb-4">No taxes found</p>
              <button
                onClick={() => navigate("/taxes/create")}
                className="px-4 py-2 bg-[#0f4d57] text-white rounded-md hover:bg-[#0d3f47] transition-colors"
              >
                Create Your First Tax
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedTaxes.length === taxes.length &&
                            taxes.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-[#0f4d57] focus:ring-[#0f4d57]"
                        />
                      </th>
                      <th
                        onClick={() => handleSort("name")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Tax Name</span>
                          {getSortIcon("name")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("rate")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Rate</span>
                          {getSortIcon("rate")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("type")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Type</span>
                          {getSortIcon("type")}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {getSortIcon("status")}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th
                        onClick={() => handleSort("updatedAt")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Last Updated</span>
                          {getSortIcon("updatedAt")}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taxes.map((tax) => (
                      <tr
                        key={tax.id}
                        className={`hover:bg-gray-50 ${selectedTaxes.includes(tax.id) ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTaxes.includes(tax.id)}
                            onChange={() => handleSelectTax(tax.id)}
                            className="rounded border-gray-300 text-[#0f4d57] focus:ring-[#0f4d57]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tax.name}
                            </div>
                            {tax.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {tax.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTaxRate(tax.rate, tax.type)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(tax.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(tax.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tax.assignments.length > 0 ? (
                              <span className="text-gray-600">
                                {tax.assignments.length} assignment
                                {tax.assignments.length !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                All entities
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(tax.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/taxes/${tax.id}/edit`)}
                              className="text-[#0f4d57] hover:text-[#0d3f47] transition-colors"
                              title="Edit tax"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(tax.id, tax.name)}
                              disabled={deleting === tax.id}
                              className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                              title="Delete tax"
                            >
                              {deleting === tax.id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <div className="space-y-4 p-4">
                  {taxes.map((tax) => (
                    <div key={tax.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedTaxes.includes(tax.id)}
                            onChange={() => handleSelectTax(tax.id)}
                            className="rounded border-gray-300 text-[#0f4d57] focus:ring-[#0f4d57] mr-3"
                          />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {tax.name}
                            </h3>
                            {tax.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {tax.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/taxes/${tax.id}/edit`)}
                            className="text-[#0f4d57] hover:text-[#0d3f47]"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tax.id, tax.name)}
                            disabled={deleting === tax.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deleting === tax.id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs text-gray-500">Rate</span>
                          <div className="text-sm font-medium">
                            {formatTaxRate(tax.rate, tax.type)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Type</span>
                          <div className="mt-1">{getTypeBadge(tax.type)}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Status</span>
                          <div className="mt-1">
                            {getStatusBadge(tax.status)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">
                            Last Updated
                          </span>
                          <div className="text-sm">
                            {formatDate(tax.updatedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Assignments
                        </span>
                        <div className="text-sm">
                          {tax.assignments.length > 0 ? (
                            `${tax.assignments.length} assignment${tax.assignments.length !== 1 ? "s" : ""}`
                          ) : (
                            <span className="text-gray-400 italic">
                              All entities
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  handleFilterChange("page", Math.max(1, filters.page - 1))
                }
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handleFilterChange(
                    "page",
                    Math.min(totalPages, filters.page + 1)
                  )
                }
                disabled={filters.page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      handleFilterChange("page", Math.max(1, filters.page - 1))
                    }
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange("page", pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          filters.page === pageNum
                            ? "z-10 bg-[#0f4d57] border-[#0f4d57] text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      handleFilterChange(
                        "page",
                        Math.min(totalPages, filters.page + 1)
                      )
                    }
                    disabled={filters.page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTaxList;
