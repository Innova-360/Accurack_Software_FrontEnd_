import React, { useState } from "react";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import SalesHeader from "../../components/SalesComponents/SalesHeader";
import StatsGrid from "../../components/SalesComponents/StatsGrid";
import FilterBar from "../../components/SalesComponents/FilterBar";
import TransactionTable from "../../components/SalesComponents/TransactionTable";
import Pagination from "../../components/SalesComponents/Pagination";
import EditTransactionModal from "../../components/SalesComponents/EditTransactionModal";
import ViewTransactionModal from "../../components/SalesComponents/ViewTransactionModal";
import DeleteConfirmModal from "../../components/SalesComponents/DeleteConfirmModal";
import type { Transaction } from "../../services/salesService";
import { useSalesData } from "../../hooks/useSalesData";

const SalesPage: React.FC = () => {
  // Use the custom hook for sales data management
  const {
    transactions,
    stats,
    loading,
    error,
    updateTransaction,
    deleteTransaction,
    printTransaction,
  } = useSalesData();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [cashierFilter, setCashierFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Filter transactions based on filters
  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;
      const matchesPayment =
        paymentFilter === "All" ||
        transaction.payment === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(
    startIndex + rowsPerPage,
    filteredTransactions.length
  );
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

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

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };
  const handleEditSave = async (updatedTransaction: Transaction) => {
    try {
      await updateTransaction(updatedTransaction.id, updatedTransaction);
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handlePrint = async (transaction: Transaction) => {
    try {
      await printTransaction(transaction.id);
    } catch (error) {
      console.error("Failed to print transaction:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransaction(selectedTransaction.id);
        setIsDeleteModalOpen(false);
        setSelectedTransaction(null);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        // Handle error (show toast, etc.)
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
            {filteredTransactions.length === 0 ? (
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
            {filteredTransactions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredTransactions.length}
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
