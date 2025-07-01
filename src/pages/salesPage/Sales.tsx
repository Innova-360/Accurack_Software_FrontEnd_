import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import SalesHeader from "../../components/SalesComponents/SalesHeader";
import StatsGrid from "../../components/SalesComponents/StatsGrid";
import FilterBar from "../../components/SalesComponents/FilterBar";
import TransactionTable from "../../components/SalesComponents/TransactionTable";
import Pagination from "../../components/SalesComponents/Pagination";
import EditTransactionModal from "../../components/SalesComponents/EditTransactionModal";
import ViewTransactionModal from "../../components/SalesComponents/ViewTransactionModal";
import DeleteConfirmModal from "../../components/SalesComponents/DeleteConfirmModal";
import { fetchSales } from "../../store/slices/salesSlice";
import type { RootState, AppDispatch } from "../../store";
import useRequireStore from "../../hooks/useRequireStore";

const SalesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentStore = useRequireStore();
  
  // Redux state
  const { sales, loading, error } = useSelector((state: RootState) => state.sales);
  
  // Convert Redux sales data to Transaction format for compatibility
  console.log("Sales data from Redux:", sales);
  
  // Debug: Log each sale's status
  sales.forEach((sale: any, index: number) => {
    console.log(`🔍 Processing sale ${index + 1}:`, {
      id: sale.id,
      status: sale.status,
      statusType: typeof sale.status,
      paymentMethod: sale.paymentMethod,
      customer: sale.customer?.customerName || sale.customerData?.customerName
    });
  });
  
  const transactions: any = sales.map((sale: any) => ({
    id: sale.id,
    transactionId: sale.transactionId || sale.id,
    dateTime: new Date(sale.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    customerName: sale.customer?.customerName || sale.customerData?.customerName || 'Unknown Customer',
    phoneNumber: sale.customer?.phoneNumber || sale.customer?.phone || sale.customerPhone || 'N/A',
    items: sale.saleItems?.length || 0,
    total: sale.totalAmount,
    tax: sale.tax,
    payment: sale.paymentMethod || 'CASH',
    status: sale.status || 'Pending',
    cashier: sale.cashierName
  }));
  console.log("Converted transactions:", transactions);

  // Calculate stats from sales data
  const stats = {
    todaysSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    transactions: sales.length,
    customers: new Set(sales.map((sale: any) => 
      sale.customer?.phoneNumber || sale.customer?.phone || sale.customerPhone || 'unknown'
    ).filter(phone => phone !== 'unknown')).size,
    avgTransaction: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
    productsAvailable: 0, // This would need to come from inventory
    lowStockItems: 0 // This would need to come from inventory
  };

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [cashierFilter, setCashierFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch sales data function
  const fetchSalesData = useCallback(() => {
    if (currentStore?.id) {
      // Convert frontend filter values to backend format
      const params: any = {
        storeId: currentStore.id,
        page: currentPage,
        limit: rowsPerPage
      };
      console.log("type of page:", typeof params.page);
      console.log("type of limit:", typeof params.limit);
      // Add filters if they're not "All"
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      if (paymentFilter !== "All") {
        params.paymentMethod = paymentFilter;
      }
      
      // Handle date filter - convert to actual dates
      if (dateFilter !== "Today") {
        // You can implement date range logic here based on your dateFilter values
        // For now, we'll skip date filtering unless it's a specific date range
      }

      console.log("Fetching sales with filters:", params);
      dispatch(fetchSales(params));
    }
  }, [currentStore?.id, currentPage, rowsPerPage, statusFilter, paymentFilter, dateFilter, dispatch]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<any | null>(null);

  // Server-side filtering is handled by backend for status, payment, etc.
  // But we still do client-side search filtering since search term is not sent to backend
  const getDisplayTransactions = () => {
    if (!searchTerm) {
      return transactions; // No search term, return all transactions from backend
    }
    
    // Apply search filter on the server-filtered results
    return transactions.filter((transaction: any) => {
      const matchesSearch =
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const displayTransactions = getDisplayTransactions();
  const paginatedTransactions = displayTransactions;
  
  // For pagination display
  const totalPages = Math.ceil(displayTransactions.length > 0 ? displayTransactions.length / rowsPerPage : 1);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, displayTransactions.length);

  // Action handlers
  const handleSalesReport = () => {
    toast("Sales Report functionality will be implemented");
  };
  const handleAnalytics = () => {
    toast("Analytics functionality will be implemented");
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setCashierFilter("All");
    setDateFilter("Today");
    setCurrentPage(1);
  };

  const handleView = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };
  const handleEditSave = async (updatedTransaction: any) => {
    try {
      // TODO: Implement update transaction API call
      console.log("Update transaction:", updatedTransaction);
      toast.success("Transaction update functionality will be implemented");
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handlePrint = async (transaction: any) => {
    try {
      // Create print content
      const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
          <h2 style="color: #03414C; text-align: center; margin-bottom: 20px;">Transaction Receipt</h2>
          <hr style="border: 1px solid #03414C;" />
          <div style="margin: 15px 0;">
            <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
            <p><strong>Date & Time:</strong> ${transaction.dateTime}</p>
            <p><strong>Customer:</strong> ${transaction.customerName}</p>
            <p><strong>Items:</strong> ${transaction.items}</p>
            <p><strong>Subtotal:</strong> $${(transaction.total - transaction.tax).toFixed(2)}</p>
            <p><strong>Tax:</strong> $${transaction.tax.toFixed(2)}</p>
            <p style="font-size: 16px;"><strong>Total:</strong> $${transaction.total.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${transaction.payment}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            <p><strong>Cashier:</strong> ${transaction.cashier}</p>
          </div>
          <hr style="border: 1px solid #03414C;" />
          <p style="text-align: center; color: #666; margin-top: 20px;">Thank you for your business!</p>
        </div>
      `;
      
      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error("Failed to print transaction:", error);
      toast.error("Failed to print transaction");
    }
  };

  const handleDelete = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTransaction) {
      try {
        // TODO: Implement delete transaction API call
        toast.success("Transaction delete functionality will be implemented");
        setIsDeleteModalOpen(false);
        setSelectedTransaction(null);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        toast.error("Failed to delete transaction");
      }
    }
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Header Section */}        <SalesHeader
          onSalesReport={handleSalesReport}
          onAnalytics={handleAnalytics}
        />

          {/* Stats Grid */}
          <StatsGrid stats={stats} loading={loading} />

          {/* Filters Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <FilterBar
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              paymentFilter={paymentFilter}
              cashierFilter={cashierFilter}
              dateFilter={dateFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onPaymentChange={setPaymentFilter}
              onCashierChange={setCashierFilter}
              onDateChange={setDateFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            {/* Table */}
            {displayTransactions.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No transactions found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new sale.
                  </p>
                </div>
              </div>
            ) : (
              <TransactionTable
                transactions={paginatedTransactions}
                onView={handleView}
                onEdit={handleEdit}
                onPrint={handlePrint}
                onDelete={handleDelete}
              />
            )}
            
            {/* Pagination */}
            {displayTransactions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={displayTransactions.length}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setRowsPerPage}
              />
            )}
          </div>

          {/* Additional Action Buttons */}
        </div>
      </div>

      {/* Modals */}
      <ViewTransactionModal
        isOpen={isViewModalOpen}
        transaction={selectedTransaction}
        onClose={() => setIsViewModalOpen(false)}
      />

      <EditTransactionModal
        isOpen={isEditModalOpen}
        transaction={selectedTransaction}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        transaction={selectedTransaction}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default SalesPage;
