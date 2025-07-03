import React from 'react';
import type { Supplier, Product } from './types';

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

interface StatsGridProps {
  viewMode: 'suppliers' | 'products';
  suppliers: Supplier[];
  selectedSupplier?: Supplier | null;
  currentSupplierProducts?: Product[];
  totalSuppliers?: number; // Total count from pagination
}

const StatsGrid: React.FC<StatsGridProps> = ({
  viewMode,
  suppliers,
  selectedSupplier,
  currentSupplierProducts = [],
  totalSuppliers
}) => {
  if (viewMode === 'suppliers') {
    // Use totalSuppliers from pagination if available, otherwise fall back to current page count
    const totalSuppliersCount = totalSuppliers ?? suppliers?.length ?? 0;
    // Since we don't have status field anymore, all suppliers are considered active
    const activeSuppliers = totalSuppliersCount;
    // Since we don't have totalValue and productsSupplied fields, we'll show 0 or remove these stats
    const totalValue = 0; // TODO: Calculate from actual products when available
    const totalProducts = 0; // TODO: Calculate from actual products when available

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{totalSuppliersCount}</div>
          <div className="text-sm text-gray-600">Total Suppliers</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
          <div className="text-sm text-gray-600">Active Suppliers</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-teal-600">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>
    );
  }

  if (viewMode === 'products' && selectedSupplier) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{currentSupplierProducts.length}</div>
          <div className="text-sm text-gray-600">Products Available</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {currentSupplierProducts.filter(p => p.stock > 0).length}
          </div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {currentSupplierProducts.reduce((sum, p) => sum + p.stock, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Stock</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-teal-600">
            {formatCurrency(currentSupplierProducts.reduce((sum, p) => sum + (p.price * p.stock), 0))}
          </div>
          <div className="text-sm text-gray-600">Total Inventory Value</div>
        </div>
      </div>
    );
  }

  return null;
};

export default StatsGrid;
