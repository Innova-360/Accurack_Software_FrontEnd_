import React, { useState, useEffect } from "react";
import { Search, Filter, FileText, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import Loading from "../../components/Loading";
import { 
  fetchDrafts, 
  deleteDraft, 
  submitDraftForApproval,
  approveDraft,
  rejectDraft,
  setFilters,
  clearError,
  clearDrafts
} from "../../store/slices/draftSlice";
import type { DraftListItem } from "../../types/draft";
import { DraftStatus } from "../../types/draft";

const Drafts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { drafts, loading, error, filters } = useAppSelector((state) => state.drafts);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: storeId } = useParams();

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "ALL");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  // Force refresh drafts when coming from CreateInvoice or when component mounts
  useEffect(() => {
    if (storeId) {
      console.log("🔄 Initial fetch of drafts on component mount");
      dispatch(fetchDrafts({ params: filters }));
    }
  }, [dispatch, storeId]);

  // Handle location state for forced refresh - moved to separate effect with better handling
  useEffect(() => {
    const shouldRefresh = location.state?.refreshDrafts;
    if (shouldRefresh && storeId) {
      console.log("🔄 Refreshing drafts due to navigation state");
      // Clear existing drafts to show loading state
      dispatch(clearDrafts());
      dispatch(fetchDrafts({ params: filters }));
      // Clear the state to prevent repeated fetches
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refreshDrafts, dispatch, storeId, filters, navigate, location.pathname]);

  // Refetch when filters change
  useEffect(() => {
    if (storeId) {
      console.log("🔄 Fetching drafts due to filter change", { filters });
      dispatch(fetchDrafts({ params: filters }));
    }
  }, [dispatch, storeId, filters]);

  // Update filters when search or status changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ 
        search: searchTerm, 
        status: statusFilter === "ALL" ? undefined : statusFilter as any
      }));
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case DraftStatus.DRAFT:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case DraftStatus.PENDING_APPROVAL:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case DraftStatus.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case DraftStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case DraftStatus.FINALIZED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case DraftStatus.DRAFT:
        return <Edit className="w-4 h-4" />;
      case DraftStatus.PENDING_APPROVAL:
        return <Clock className="w-4 h-4" />;
      case DraftStatus.APPROVED:
        return <CheckCircle className="w-4 h-4" />;
      case DraftStatus.REJECTED:
        return <XCircle className="w-4 h-4" />;
      case DraftStatus.FINALIZED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const handleViewDraft = (draftId: string) => {
    navigate(`/store/${storeId}/draft/${draftId}`);
  };

  const handleEditDraft = (draftId: string) => {
    navigate(`/store/${storeId}/draft/${draftId}/edit`);
  };

  const handleDeleteDraft = async (draftId: string) => {
    // Show a toast warning first
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Are you sure you want to delete this draft?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const result = await dispatch(deleteDraft({ draftId }));
              if (deleteDraft.fulfilled.match(result)) {
                toast.success("Draft deleted successfully");
              } else {
                const errorMessage = result.payload as string || "Failed to delete draft";
                toast.error(errorMessage);
                console.error("Delete draft error:", result.payload);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const handleFinalizeDraft = async (draftId: string) => {
    try {
      // Use approve endpoint which creates the invoice
      const result = await dispatch(approveDraft({ draftId }));
      if (approveDraft.fulfilled.match(result)) {
        // Check if invoice was created
        if (result.payload.data?.invoiceId) {
          toast.success("Draft approved and invoice created successfully!");
        } else {
          toast.success("Draft approved successfully!");
        }
        // Refresh the drafts list
        dispatch(fetchDrafts({ params: filters }));
      } else {
        const errorMessage = result.payload as string || "Failed to approve draft";
        toast.error(errorMessage);
        console.error("Approve draft error:", result.payload);
      }
    } catch (error) {
      console.error("Unexpected error in handleFinalizeDraft:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleSubmitForApproval = async (draftId: string) => {
    try {
      const result = await dispatch(submitDraftForApproval({ draftId }));
      if (submitDraftForApproval.fulfilled.match(result)) {
        toast.success("Draft submitted for approval");
      } else {
        const errorMessage = result.payload as string || "Failed to submit draft for approval";
        toast.error(errorMessage);
        console.error("Submit for approval error:", result.payload);
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmitForApproval:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      const result = await dispatch(approveDraft({ draftId }));
      if (approveDraft.fulfilled.match(result)) {
        // Check if invoice was created
        if (result.payload.data?.invoiceId) {
          toast.success("Draft approved and invoice created successfully!");
        } else {
          toast.success("Draft approved successfully");
        }
        // Refresh the drafts list
        dispatch(fetchDrafts({ params: filters }));
      } else {
        const errorMessage = result.payload as string || "Failed to approve draft";
        toast.error(errorMessage);
        console.error("Approve draft error:", result.payload);
      }
    } catch (error) {
      console.error("Unexpected error in handleApproveDraft:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleRejectDraft = async () => {
    if (selectedDraftId && rejectReason.trim()) {
      try {
        const result = await dispatch(rejectDraft({ draftId: selectedDraftId, reason: rejectReason }));
        if (rejectDraft.fulfilled.match(result)) {
          toast.success("Draft rejected successfully");
        } else {
          const errorMessage = result.payload as string || "Failed to reject draft";
          toast.error(errorMessage);
          console.error("Reject draft error:", result.payload);
        }
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedDraftId(null);
      } catch (error) {
        console.error("Unexpected error in handleRejectDraft:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  const openRejectModal = (draftId: string) => {
    setSelectedDraftId(draftId);
    setShowRejectModal(true);
  };

  const canEdit = (status: string) => {
    return status === DraftStatus.DRAFT || status === DraftStatus.REJECTED;
  };

  const canDelete = (status: string) => {
    return status === DraftStatus.DRAFT || status === DraftStatus.REJECTED;
  };

  const canSubmitForApproval = (status: string) => {
    return status === DraftStatus.DRAFT;
  };

  const canApprove = (status: string) => {
    return status === DraftStatus.PENDING_APPROVAL;
  };

  const canReject = (status: string) => {
    return status === DraftStatus.PENDING_APPROVAL;
  };

  const canFinalize = (status: string) => {
    return status === DraftStatus.APPROVED;
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    dispatch(setFilters({ limit, page: 1 }));
  };

  if (loading) {
    return <Loading label="Drafts" />;
  }

  const draftData = drafts?.drafts || [];
  const totalPages = drafts?.totalPages || 0;
  const currentPage = drafts?.page || 1;
  const total = drafts?.total || 0;

  console.log("📊 Current draft state:", { 
    loading, 
    draftsExists: !!drafts, 
    draftDataLength: draftData.length, 
    total, 
    error 
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#03414CF0]" />
                  Invoice Drafts
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your invoice drafts and approval workflow
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg">
                  <span className="font-semibold">{total}</span>
                  <span className="ml-1">Total Drafts</span>
                </div>
                <SpecialButton
                  variant="primary"
                  onClick={() => navigate(`/store/${storeId}/sales/new`)}
                  className="bg-[#03414C] hover:bg-[#025561] text-white"
                >
                  Create New Draft
                </SpecialButton>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-600 hover:text-red-800"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search drafts, customers, or draft numbers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
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
                  <option value={DraftStatus.DRAFT}>Draft</option>
                  <option value={DraftStatus.PENDING_APPROVAL}>Pending Approval</option>
                  <option value={DraftStatus.APPROVED}>Approved</option>
                  <option value={DraftStatus.REJECTED}>Rejected</option>
                  <option value={DraftStatus.FINALIZED}>Finalized</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drafts Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Draft Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {draftData.map((draft: DraftListItem) => (
                    <tr
                      key={draft.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Draft Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {draft.draftNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              Version {draft.version}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {draft.customerName}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(draft.totalAmount)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            draft.status
                          )}`}
                        >
                          {getStatusIcon(draft.status)}
                          {draft.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(draft.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <SpecialButton
                            variant="secondary"
                            onClick={() => handleViewDraft(draft.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </SpecialButton>

                          {canEdit(draft.status) && (
                            <SpecialButton
                              variant="secondary"
                              onClick={() => handleEditDraft(draft.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </SpecialButton>
                          )}

                          {canSubmitForApproval(draft.status) && (
                            <SpecialButton
                              variant="primary"
                              onClick={() => handleSubmitForApproval(draft.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700"
                            >
                              Submit
                            </SpecialButton>
                          )}

                          {canApprove(draft.status) && (
                            <SpecialButton
                              variant="primary"
                              onClick={() => handleApproveDraft(draft.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </SpecialButton>
                          )}

                          {canReject(draft.status) && (
                            <SpecialButton
                              variant="secondary"
                              onClick={() => openRejectModal(draft.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </SpecialButton>
                          )}

                          {canFinalize(draft.status) && (
                            <SpecialButton
                              variant="primary"
                              onClick={() => handleFinalizeDraft(draft.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-purple-600 hover:bg-purple-700"
                            >
                              Finalize
                            </SpecialButton>
                          )}

                          {canDelete(draft.status) && (
                            <SpecialButton
                              variant="secondary"
                              onClick={() => handleDeleteDraft(draft.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </SpecialButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {drafts && drafts.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    Showing {((currentPage - 1) * (drafts.limit || 10)) + 1} to{" "}
                    {Math.min(currentPage * (drafts.limit || 10), total)} of{" "}
                    {total} results
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>Show:</span>
                    <select
                      value={filters.limit || 10}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
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
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {draftData.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No drafts found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first draft from a sale"}
              </p>
              <SpecialButton
                variant="primary"
                onClick={() => navigate(`/store/${storeId}/sales/new`)}
                className="bg-[#03414C] hover:bg-[#025561] text-white"
              >
                Create First Draft
              </SpecialButton>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Draft
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Please provide a reason for rejecting this draft..."
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <SpecialButton
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedDraftId(null);
                }}
                className="flex-1"
              >
                Cancel
              </SpecialButton>
              <SpecialButton
                variant="primary"
                onClick={handleRejectDraft}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Reject Draft
              </SpecialButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Drafts;
