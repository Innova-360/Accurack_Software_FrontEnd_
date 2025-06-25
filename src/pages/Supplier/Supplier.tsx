import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileExport, FaTrash, FaBars } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { SpecialButton } from '../../components/buttons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSuppliers, clearSuppliers, setPage } from '../../store/slices/supplierSlice';
import {  
  AddSupplierModal,  
  EditSupplierModal, 
  DeleteSupplierModal, 
  ViewSupplierModal,
  ViewProductsModal,
  SupplierSidebar,
  SupplierTable,
  ProductsTable,
  StatsGrid,
  PaginationControls
} from '../../components/SupplierComponents';
import type { Supplier } from '../../types/supplier';
import Header from '../../components/Header';
import useRequireStore from '../../hooks/useRequireStore';

const SupplierPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentStore = useRequireStore();
    // Get suppliers from Redux store
  const { suppliers, loading, error, pagination } = useAppSelector((state) => state.suppliers);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'suppliers' | 'products'>('suppliers');
  
  // Modal states
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewProductsModalOpen, setIsViewProductsModalOpen] = useState(false);  // Fetch suppliers when component mounts or store changes
  useEffect(() => {
    const fetchData = async () => {
      if (currentStore?.id) {
        try {
          // Using unwrap() for cleaner promise handling
          await dispatch(fetchSuppliers({ storeId: currentStore.id })).unwrap();
        } catch (error) {
          console.error('Failed to fetch suppliers:', error);
        }
      } else {
        dispatch(clearSuppliers());
      }
    };

    fetchData();
  }, [dispatch, currentStore?.id]);
// Handle supplier selection from sidebar
  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewMode('products');
  };
  // Handle back to suppliers view
  const handleBackToSuppliers = () => {
    setSelectedSupplier(null);
    setViewMode('suppliers');
  };
  
  // Edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  // Delete supplier
  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  // Delete all suppliers - TODO: Implement API endpoint for bulk delete
  const handleDeleteAll = () => {
    setIsDeleteAllModalOpen(true);
  };

  // View supplier
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // View products
  const handleViewProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewProductsModalOpen(true);
  };
  // Export functionality
  const handleExport = () => {
    try {
      const dataToExport = suppliers.map(supplier => ({
        'Supplier ID': supplier.supplier_id,
        'Name': supplier.name,
        'Email': supplier.email,
        'Phone': supplier.phone,
        'Address': supplier.address,
        'Store ID': supplier.storeId,
        'Created At': supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : '',
        'Updated At': supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString() : ''
      }));

      if (dataToExport.length === 0) {
        toast.error('No suppliers to export');
        return;
      }

      const csvContent = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(row => Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Suppliers exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data. Please try again.');
    }  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    if (currentStore?.id) {
      dispatch(setPage(page));
      dispatch(fetchSuppliers({ storeId: currentStore.id, page, limit: 10 }));
    }
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-100 flex">      {/* Sidebar */}
      <SupplierSidebar
        suppliers={suppliers}
        selectedSupplier={selectedSupplier}
        isSidebarOpen={isSidebarOpen}
        viewMode={viewMode}
        onSupplierSelect={handleSupplierSelect}
        onBackToSuppliers={handleBackToSuppliers}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        onSetViewMode={setViewMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navigation */}
        <div className="bg-white  border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-md md:hidden"
              >
                <FaBars className="text-gray-600" size={16} />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <span className="text-gray-800 font-semibold text-lg">
                  {viewMode === 'products' && selectedSupplier 
                    ? selectedSupplier.name
                    : 'All Suppliers'
                  }
                </span>
              </div>
              {viewMode === 'products' && selectedSupplier && (
                <button
                  onClick={handleBackToSuppliers}
                  className="text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                >
                  ← Back to Suppliers
                </button>
              )}
            </div>              <div className="flex items-center gap-2">
              <SpecialButton variant="expense-export" onClick={handleExport}>
                <FaFileExport size={14} />
                <span className="sm:inline ml-2">Export</span>
              </SpecialButton>
              <SpecialButton variant="expense-delete" onClick={handleDeleteAll}>
                <FaTrash size={14} />
                <span className="sm:inline ml-2">Delete All</span>
              </SpecialButton>              <SpecialButton variant="expense-add" onClick={() => setIsAddSupplierModalOpen(true)}>
                <FaPlus size={14} />
                <span className="sm:inline ml-2">Add New</span>
              </SpecialButton>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {viewMode === 'products' && selectedSupplier 
                  ? `${selectedSupplier.name} - Products` 
                  : 'Suppliers Management'
                }
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {viewMode === 'products' && selectedSupplier 
                  ? `Manage products from ${selectedSupplier.name}`
                  : 'Manage your suppliers and their information'
                }
              </p>              {/* Stats Grid */}
              <StatsGrid 
                viewMode={viewMode}
                suppliers={suppliers}
                selectedSupplier={selectedSupplier}
                currentSupplierProducts={[]} // TODO: Integrate with products API when available
                totalSuppliers={pagination.total}
              />
            </div>            {/* Loading and Error States */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-2 text-gray-600">Loading suppliers...</span>
              </div>
            )}

            {error && (
              <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">Error: {error}</p>
                <button 
                  onClick={() => currentStore?.id && dispatch(fetchSuppliers({ storeId: currentStore.id }))}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try Again
                </button>
              </div>            )}            {/* Content based on view mode */}
            {!loading && !error && (
              <>
                {viewMode === 'suppliers' ? (
                  <>
                    <SupplierTable
                      suppliers={suppliers}
                      onViewSupplier={handleViewSupplier}
                      onEditSupplier={handleEditSupplier}
                      onDeleteSupplier={handleDeleteSupplier}
                      onViewProducts={handleViewProducts}
                      onAddSupplier={() => setIsAddSupplierModalOpen(true)}
                    />
                    {/* Pagination Controls */}
                    <PaginationControls
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      total={pagination.total}
                      limit={pagination.limit}
                      onPageChange={handlePageChange}
                      loading={loading}
                    />
                  </>
                ) : selectedSupplier && (
                  <ProductsTable
                    products={[]} // TODO: Integrate with products API when available
                    supplier={selectedSupplier}
                    onBackToSuppliers={handleBackToSuppliers}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
      />

      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />

      <DeleteSupplierModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />

      <DeleteSupplierModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        supplier={null}
        isDeleteAll={true}
        supplierCount={suppliers?.length}
      />

      <ViewSupplierModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />

      <ViewProductsModal
        isOpen={isViewProductsModalOpen}
        onClose={() => {
          setIsViewProductsModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        products={[]} // TODO: Integrate with products API when available
      />
    </div>
    </>
  );
};

export default SupplierPage;