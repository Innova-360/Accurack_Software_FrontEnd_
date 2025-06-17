import React, { useState } from 'react';
import Header from '../../components/Header';
import SalesHeader from '../../components/SalesComponents/SalesHeader';
import StatsGrid from '../../components/SalesComponents/StatsGrid';
import FilterBar from '../../components/SalesComponents/FilterBar';
import TransactionTable from '../../components/SalesComponents/TransactionTable';
import Pagination from '../../components/SalesComponents/Pagination';
import EditTransactionModal from '../../components/SalesComponents/EditTransactionModal';
import ViewTransactionModal from '../../components/SalesComponents/ViewTransactionModal';
import DeleteConfirmModal from '../../components/SalesComponents/DeleteConfirmModal';
import type { Transaction } from '../../services/salesService';
import { useSalesData } from '../../hooks/useSalesData';

const SalesPage: React.FC = () => {
    // Use the custom hook for sales data management
    const {
        transactions,
        stats,
        loading,
        error,
        updateTransaction,
        deleteTransaction,
        printTransaction
    } = useSalesData();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'all' | 'shipped' | 'delivered'>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter transactions based on active tab and filters
  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Filter by active tab
    if (activeTab === 'shipped') {
      filtered = filtered.filter(transaction => transaction.status === 'Shipped');
    } else if (activeTab === 'delivered') {
      filtered = filtered.filter(transaction => transaction.status === 'Delivered');
    }

    // Apply additional filters
    return filtered.filter(transaction => {
      const matchesSearch = transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || transaction.status === statusFilter;
      const matchesPayment = paymentFilter === 'All Payments' || transaction.payment === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  };

  const filteredTransactions = getFilteredTransactions();

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredTransactions.length);
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + rowsPerPage);

    // Action handlers
    const handleNewSale = () => {
        alert('New Sale functionality will be implemented');
    };

    const handleSalesReport = () => {
        alert('Sales Report functionality will be implemented');
    };

  const handleAnalytics = () => {
    alert('Analytics functionality will be implemented');
  };

  // Tab handlers
  const handleTabChange = (tab: 'all' | 'shipped' | 'delivered') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setSearchTerm(''); // Clear search when changing tabs
    setStatusFilter('All Status'); // Reset status filter
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
            console.error('Failed to update transaction:', error);
            // Handle error (show toast, etc.)
        }
    };

    const handlePrint = async (transaction: Transaction) => {
        try {
            await printTransaction(transaction.id);
        } catch (error) {
            console.error('Failed to print transaction:', error);
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
                console.error('Failed to delete transaction:', error);
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

                    {/* Header Section */}
                    <SalesHeader
                        onNewSale={handleNewSale}
                        onSalesReport={handleSalesReport}
                        onAnalytics={handleAnalytics}
                    />

                    {/* Stats Grid */}
                    <StatsGrid stats={stats} loading={loading} />

                    {/* Tabs Section */}
                    <div className="bg-white rounded-lg border border-gray-200 mb-6">                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                <button 
                                    onClick={() => handleTabChange('all')}
                                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                                        activeTab === 'all' 
                                            ? 'border-[#03414C] text-[#03414C]' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Recent Sales Orders ({transactions.length})
                                </button>
                                <button 
                                    onClick={() => handleTabChange('shipped')}
                                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                                        activeTab === 'shipped' 
                                            ? 'border-[#03414C] text-[#03414C]' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Shipped ({transactions.filter(t => t.status === 'Shipped').length})
                                </button>
                                <button 
                                    onClick={() => handleTabChange('delivered')}
                                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                                        activeTab === 'delivered' 
                                            ? 'border-[#03414C] text-[#03414C]' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Delivered ({transactions.filter(t => t.status === 'Delivered').length})
                                </button>
                            </nav>
                        </div>                        {/* Transactions Section */}
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {activeTab === 'all' && 'Recent Sales Orders'}
                                    {activeTab === 'shipped' && 'Shipped Orders'}
                                    {activeTab === 'delivered' && 'Delivered Orders'}
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({filteredTransactions.length} {filteredTransactions.length === 1 ? 'order' : 'orders'})
                                    </span>
                                </h2>
                            </div>

                            {/* Filters */}
                            <FilterBar
                                searchTerm={searchTerm}
                                statusFilter={statusFilter}
                                paymentFilter={paymentFilter}
                                rowsPerPage={rowsPerPage}
                                onSearchChange={setSearchTerm}
                                onStatusChange={setStatusFilter}
                                onPaymentChange={setPaymentFilter}
                                onRowsPerPageChange={setRowsPerPage}
                            />                            {/* Table */}
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            {activeTab === 'all' && 'No transactions found'}
                                            {activeTab === 'shipped' && 'No shipped orders found'}
                                            {activeTab === 'delivered' && 'No delivered orders found'}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {activeTab === 'all' && 'Get started by creating a new sale.'}
                                            {activeTab === 'shipped' && 'Orders will appear here when they are shipped.'}
                                            {activeTab === 'delivered' && 'Orders will appear here when they are delivered.'}
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
                                />                            )}

                            {/* Pagination */}
                            {filteredTransactions.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    totalItems={filteredTransactions.length}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
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
