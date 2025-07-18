import React, { useState, useEffect } from "react";
import { Search, Filter, User, FileText, Eye, FilePlus, Save, Building2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { InvoiceResponseData } from "../../types/invoice";
import { fetchInvoices } from "../../store/slices/invoiceSlice";
import { createDraftFromInvoice } from "../../store/slices/draftSlice";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";
import ConvertToDraftModal from "../../components/modals/ConvertToDraftModal";

const Invoices: React.FC = () => {
  const dispatch = useAppDispatch();
  const { invoices, loading } = useAppSelector((state) => state.invoices);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  // const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponseData | null>(null);
  const { id } = useParams();

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    if (id) {
      dispatch(fetchInvoices({ storeId: id }));
    }
  }, [dispatch, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(
    (invoice: InvoiceResponseData) => {
      const matchesSearch =
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  ) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/store/${id}/invoice/${invoiceId}`);
  };

  const handleCreateInvoice = () => {
    navigate(`/store/${id}/invoice/new`);
  };
  const handleSaveAsDraft = (invoice: InvoiceResponseData) => {
    setSelectedInvoice(invoice);
    setShowConvertModal(true);
  };

  const handleConfirmConvertToDraft = async (notes: string, dueDate?: string) => {
    if (!selectedInvoice) return;

    try {
      const draftData = {
        invoiceId: selectedInvoice.id,
        notes: notes.trim(),
        dueDate: dueDate,
      };

      console.log("🔄 Converting invoice to draft:", draftData);

      const result = await dispatch(createDraftFromInvoice(draftData)).unwrap();
      
      toast.success(`Invoice ${selectedInvoice.invoiceNumber} saved as draft successfully!`);
      
      // Close modal and reset state
      setShowConvertModal(false);
      setSelectedInvoice(null);
      
      // Navigate to the new draft
      navigate(`/store/${id}/draft/${result.id}`);
    } catch (error: unknown) {
      console.error("Error converting invoice to draft:", error);
      toast.error(`Failed to save invoice as draft: ${error}`);
    }
  };

  const handleCloseModal = () => {
    setShowConvertModal(false);
    setSelectedInvoice(null);
  };

  if (loading) {
    return <Loading label="Invoices" />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#03414CF0]" />
                  Invoices
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track all your invoices
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <div className=" px-4 py-2 rounded-lg">
                  <span className=" font-semibold">
                    {filteredInvoices.length}
                  </span>
                  <span className=" ml-1">Total Invoices</span>
                </div>
                <SpecialButton
                  variant="primary"
                  onClick={handleCreateInvoice}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#043E49] border  rounded-lg hover:bg-[#032e36] transition-colors"
                >
                  <FilePlus className="w-4 h-4" />
                  New Invoice
                </SpecialButton>
                <SpecialButton
                  variant="secondary"
                  onClick={() => navigate(`/store/${id}/drafts`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
                >
                  <FilePlus className="w-4 h-4" />
                  View Drafts
                </SpecialButton>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search invoices, customers, or businesses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Date Filter 
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                            */}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Invoice Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {invoice.logoUrl ? (
                                                    <img
                                                        src={invoice.logoUrl}
                                                        alt="Business Logo"
                                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <Building2 className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.paymentMethod}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.customerPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.businessName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cashier: {invoice.cashierName}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tax: {formatCurrency(invoice.tax)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </td>

                      {/* Actions  */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <SpecialButton
                            variant="secondary"
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#043E49] border  rounded-lg hover:bg-[#032e36] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </SpecialButton>
                          
                          <SpecialButton
                            variant="secondary"
                            onClick={() => handleSaveAsDraft(invoice)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 border rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save as Draft
                          </SpecialButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredInvoices.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredInvoices.length)} of{" "}
                    {filteredInvoices.length} results
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per page</span>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // Show first page, last page, current page, and pages around current page
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  currentPage === page
                                    ? "bg-[#043E49] text-white"
                                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 &&
                              currentPage < totalPages - 2)
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredInvoices.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first invoice"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Convert to Draft Modal */}
      {selectedInvoice && (
        <ConvertToDraftModal
          isOpen={showConvertModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmConvertToDraft}
          invoice={selectedInvoice}
          loading={loading}
        />
      )}
    </>
  );
};

export default Invoices;
