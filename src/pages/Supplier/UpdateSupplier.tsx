import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import toast from "react-hot-toast";
// import { SpecialButton } from "../../components/buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchSuppliers,
  clearSuppliers,
  setPage,
} from "../../store/slices/supplierSlice";
import {
  EditSupplierModal,
  DeleteSupplierModal,
  ViewSupplierModal,
  PaginationControls,
} from "../../components/SupplierComponents";
import SupplierTable from "../../components/SupplierComponents/updateSuppliertable";

import type { Supplier } from "../../types/supplier";
import Header from "../../components/Header";
import useRequireStore from "../../hooks/useRequireStore";
import { useResponsiveSidebar } from "../../hooks/useResponsiveSidebar";

const SupplierPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentStore = useRequireStore();
  // Get suppliers from Redux store
  const { suppliers, loading, error, pagination } = useAppSelector(
    (state) => state.suppliers
  );

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  // Use responsive sidebar hook
  const { isSidebarOpen, toggleSidebar } = useResponsiveSidebar();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch suppliers when component mounts or store changes
  useEffect(() => {
    const fetchData = async () => {
      if (currentStore?.id) {
        try {
          // Using unwrap() for cleaner promise handling
          await dispatch(fetchSuppliers({ storeId: currentStore.id })).unwrap();
        } catch (error) {
          console.error("Failed to fetch suppliers:", error);
        }
      } else {
        dispatch(clearSuppliers());
      }
    };

    fetchData();
  }, [dispatch, currentStore?.id]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile, auto-open on desktop
      if (window.innerWidth < 1024) {
        toggleSidebar();
      } else {
        toggleSidebar();
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // View assigned products - Open modal to show assigned products
  const handleViewAssignedProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    // In a real app, this would open a modal to show assigned products
  };

  // Add supplier - navigate to add supplier page
  const handleAddSupplier = () => {
    if (currentStore?.id) {
      navigate(`/store/${currentStore.id}/supplier/add`);
    } else {
      toast.error("Store not found");
    }
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

  // View supplier
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // View products - Navigate to assign products page
  const handleViewProducts = (supplier: Supplier) => {
    // Enhanced ID validation - check multiple possible ID fields
    let supplierId = null;

    // Check if this is a temporary supplier (newly created)
    if (supplier.isTemporary) {
      // Find the real supplier from the suppliers list by name and email
      const realSupplier = suppliers.find(
        (s) => s.name === supplier.name && s.email === supplier.email
      );

      if (realSupplier) {
        supplier = realSupplier; // Use the real supplier
      } else {
        toast.success("Please wait, refreshing supplier data...");
        handleRefreshSuppliers();
        return;
      }
    }

    // Try different ID field variations
    if (supplier.id && supplier.id.toString().trim()) {
      supplierId = supplier.id.toString().trim();
    } else if (supplier.supplier_id && supplier.supplier_id.toString().trim()) {
      supplierId = supplier.supplier_id.toString().trim();
    } else if (supplier._id && supplier._id.toString().trim()) {
      supplierId = supplier._id.toString().trim();
    }

    if (
      supplierId &&
      supplierId !== "undefined" &&
      supplierId !== "null" &&
      !supplierId.startsWith("temp-")
    ) {
      const finalUrl = `/store/${currentStore?.id}/supplier/${supplierId}/assign-products`;

      navigate(finalUrl, {
        state: { supplier: supplier },
      });
    } else {
      console.error("No valid supplier ID found:", supplier);
      toast.error(
        "Supplier ID not found. Please refresh the page and try again."
      );
    }
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    if (currentStore?.id) {
      dispatch(setPage(page));
      dispatch(fetchSuppliers({ storeId: currentStore.id, page, limit: 10 }));
    }
  };

  // Handle edit modal close with refresh
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
    // Force refresh after modal close to ensure state is updated
    handleRefreshSuppliers();
  };

  // Handle delete modal close with refresh
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
    // Force refresh after modal close to ensure state is updated
    handleRefreshSuppliers();
  };

  // Force refresh suppliers list
  const handleRefreshSuppliers = async () => {
    if (currentStore?.id) {
      try {
        await dispatch(fetchSuppliers({ storeId: currentStore.id })).unwrap();
      } catch (error) {
        console.error("Failed to refresh suppliers:", error);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex">
        {" "}
        {/* Sidebar */}
        {/* <SupplierSidebar
          suppliers={suppliers}
          selectedSupplier={selectedSupplier}
          isSidebarOpen={isSidebarOpen}
          viewMode={viewMode}
          onSupplierSelect={handleSupplierSelect}
          onBackToSuppliers={handleBackToSuppliers}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onAddSupplier={() => setIsAddSupplierModalOpen(true)}
          onSetViewMode={setViewMode}
        /> */}
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top Navigation */}
          <div className="bg-white  border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 rounded-md md:hidden"
                >
                  <FaBars className="text-gray-600" size={16} />
                </button>

                {/* <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="text-gray-800 font-semibold text-lg">
                    {viewMode === "products" && selectedSupplier
                      ? selectedSupplier.name
                      : "All Suppliers"}
                  </span>
                </div> */}
                {/* {viewMode === "products" && selectedSupplier && (
                  <button
                    onClick={handleBackToSuppliers}
                    className="text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                  >
                    ← Back to Suppliers
                  </button>
                )} */}
              </div>{" "}
              {/* <div className="flex items-center gap-2">
                <SpecialButton variant="expense-export" onClick={handleExport}>
                  <FaFileExport size={14} />
                  <span className="sm:inline ml-2">Export</span>
                </SpecialButton>
                <SpecialButton
                  variant="expense-delete"
                  onClick={handleDeleteAll}
                >
                  <FaTrash size={14} />
                  <span className="sm:inline ml-2">Delete All</span>
                </SpecialButton>
                <SpecialButton
                  variant="expense-add"
                  onClick={handleAddSupplier}
                >
                  <FaPlus size={14} />
                  <span className="sm:inline ml-2">Add New</span>
                </SpecialButton>
              </div> */}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="px-6 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Vendors Management
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Manage your vendors and their information
                </p>{" "}
                {/* Stats Grid */}
                {/* <StatsGrid
                  viewMode={viewMode}
                  suppliers={suppliers}
                  selectedSupplier={selectedSupplier}
                  currentSupplierProducts={[]} // TODO: Integrate with products API when available
                  totalSuppliers={pagination.total}
                /> */}
              </div>{" "}
              {/* Loading and Error States */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading suppliers...
                  </span>
                </div>
              )}
              {error && (
                <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">Error: {error}</p>
                  <button
                    onClick={() =>
                      currentStore?.id &&
                      dispatch(fetchSuppliers({ storeId: currentStore.id }))
                    }
                    className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                  >
                    Try Again
                  </button>
                </div>
              )}{" "}
              {/* Content based on view mode */}
              {!loading && !error && (
                <>
                  {/* Always show suppliers table in this view */}
                  <SupplierTable
                    suppliers={suppliers}
                    onViewSupplier={handleViewSupplier}
                    onEditSupplier={handleEditSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                    onViewProducts={handleViewProducts}
                    onViewAssignedProducts={handleViewAssignedProducts}
                    onAddSupplier={handleAddSupplier}
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
              )}
            </div>
          </div>
        </div>{" "}
        {/* Modals */}
        {/* <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={handleAddModalClose}
          onSupplierCreated={handleShowAssignProductPrompt}
        /> */}
        <EditSupplierModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          supplier={selectedSupplier}
        />
        <DeleteSupplierModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          supplier={selectedSupplier}
        />
        {/* <DeleteSupplierModal
          isOpen={isDeleteAllModalOpen}
          onClose={handleDeleteAllModalClose}
          supplier={null}
          isDeleteAll={true}
          supplierCount={suppliers?.length}
        /> */}
        <ViewSupplierModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
        />
        {/* <ViewProductsModal
          isOpen={isViewProductsModalOpen}
          onClose={() => {
            setIsViewProductsModalOpen(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
          products={[]} // TODO: Integrate with products API when available
        /> */}
        {/* <ViewAssignedProductsModal
          isOpen={isViewAssignedProductsModalOpen}
          onClose={() => {
            setIsViewAssignedProductsModalOpen(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
        /> */}
        {/* Assign Product Prompt Modal - Demo Only */}
        {/* <AssignProductPromptModal
          isOpen={isAssignProductPromptOpen}
          onClose={handleCloseAssignProductPrompt}
          supplier={newlyCreatedSupplier}
          onViewProducts={handleViewProducts}
        /> */}
      </div>
    </>
  );
};

export default SupplierPage;
