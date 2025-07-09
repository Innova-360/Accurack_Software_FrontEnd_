import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { fetchInvoicesByStore } from "../../store/slices/invoiceSlice";
import type { RootState, AppDispatch } from "../../store";
import useRequireStore from "../../hooks/useRequireStore";
import { FaPlus, FaFileInvoice, FaEye, FaPrint } from "react-icons/fa";

const InvoicePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: storeId } = useParams<{ id?: string }>();
  const currentStore = useRequireStore();

  // Redux state
  const { invoices, loading, error } = useSelector(
    (state: RootState) => state.invoice
  );

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch invoices data function
  const fetchInvoicesData = useCallback(() => {
    if (currentStore?.id) {
      console.log("Fetching invoices for store:", currentStore.id);
      dispatch(fetchInvoicesByStore(currentStore.id));
    }
  }, [currentStore?.id, dispatch]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchInvoicesData();
  }, [fetchInvoicesData]);

  // Filter invoices based on search and status
  const getDisplayInvoices = () => {
    let filtered = invoices;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((invoice) => 
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerPhone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    return filtered;
  };

  const displayInvoices = getDisplayInvoices();
  const paginatedInvoices = displayInvoices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Calculate stats
  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    paidInvoices: invoices.filter(invoice => invoice.status === 'COMPLETED').length,
    pendingInvoices: invoices.filter(invoice => invoice.status === 'PENDING').length,
  };

  // Action handlers
  const handleCreateInvoice = () => {
    if (storeId) {
      navigate(`/store/${storeId}/sales/add-new-sale`);
    } else {
      navigate("/sales/add-new-sale");
    }
  };

  const handleViewInvoice = (invoice: any) => {
    // TODO: Navigate to invoice detail view
    toast.info("Invoice detail view will be implemented");
  };

  const handlePrintInvoice = (invoice: any) => {
    // Create print content for invoice
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #03414C; font-size: 32px; margin: 0;">ACCURACK</h1>
          <h2 style="color: #666; margin: 10px 0;">INVOICE</h2>
          <div style="background: #03414C; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block;">
            #${invoice.invoiceNumber}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #03414C; margin-bottom: 10px;">BILL TO:</h3>
            <p><strong>${invoice.customerName}</strong></p>
            <p>${invoice.customerAddress}</p>
            <p>${invoice.customerPhone}</p>
            <p>${invoice.customerMail}</p>
          </div>
          <div>
            <h3 style="color: #03414C; margin-bottom: 10px;">INVOICE DETAILS:</h3>
            <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
            <p><strong>Payment:</strong> ${invoice.paymentMethod}</p>
            <p><strong>Cashier:</strong> ${invoice.cashierName}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #03414C; margin-bottom: 15px;">ITEMS:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #03414C; color: white;">
                <th style="padding: 10px; text-align: left;">Description</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.sale?.saleItems?.map((item: any) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px;">${item.productName}</td>
                  <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 8px; text-align: right;">$${item.sellingPrice.toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="3" style="padding: 8px; text-align: center;">No items</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="text-align: right; margin-bottom: 30px;">
          <div style="border: 2px solid #03414C; padding: 15px; display: inline-block;">
            <p style="margin: 5px 0;"><strong>Subtotal: $${(invoice.totalAmount - invoice.tax).toFixed(2)}</strong></p>
            <p style="margin: 5px 0;"><strong>Tax: $${invoice.tax.toFixed(2)}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #03414C;"><strong>TOTAL: $${invoice.totalAmount.toFixed(2)}</strong></p>
          </div>
        </div>

        <div style="text-align: center; border-top: 2px solid #03414C; padding-top: 20px;">
          <p style="color: #03414C; font-weight: bold;">Thank you for your business!</p>
          <p style="color: #666; font-size: 12px;">This invoice was generated electronically.</p>
        </div>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const totalPages = Math.ceil(displayInvoices.length / rowsPerPage);

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
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices</h1>
                <p className="text-gray-600">Manage and track all your invoices</p>
              </div>
              <button
                onClick={handleCreateInvoice}
                className="bg-[#03414C] hover:bg-[#025561] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus size={16} />
                Create Invoice
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                </div>
                <FaFileInvoice className="text-[#03414C] text-2xl" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
                </div>
                <div className="text-green-600 text-2xl">💰</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                </div>
                <div className="text-green-600 text-2xl">✅</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                </div>
                <div className="text-orange-600 text-2xl">⏳</div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by customer name, invoice number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03414C] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            ) : displayInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first invoice.</p>
                <button
                  onClick={handleCreateInvoice}
                  className="bg-[#03414C] hover:bg-[#025561] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">#{invoice.invoiceNumber}</div>
                              <div className="text-sm text-gray-500">{invoice.paymentMethod}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                              <div className="text-sm text-gray-500">{invoice.customerPhone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${invoice.totalAmount.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">Tax: ${invoice.tax.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewInvoice(invoice)}
                                className="text-[#03414C] hover:text-[#025561] transition-colors"
                                title="View"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={() => handlePrintInvoice(invoice)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                title="Print"
                              >
                                <FaPrint size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {paginatedInvoices.map((invoice) => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">#{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-500">{invoice.customerName}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <div className="font-medium">${invoice.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="flex-1 bg-[#03414C] text-white py-2 px-3 rounded text-sm hover:bg-[#025561] transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, displayInvoices.length)} of {displayInvoices.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;