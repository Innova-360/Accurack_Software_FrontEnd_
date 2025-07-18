import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  fetchDraftById, 
  updateDraft, 
  submitDraftForApproval,
  approveDraft,
  rejectDraft,
  deleteDraft
} from "../../store/slices/draftSlice";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import Loading from "../../components/Loading";
import { 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  Edit, 
  Check, 
  X, 
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { DraftStatus } from "../../types/draft";

const DraftDetail: React.FC = () => {
  const { id: storeId, draftId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDraft, loading, error } = useAppSelector((state) => state.drafts);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    notes: "",
    dueDate: "",
    shippingAddress: "",
    logoUrl: "",
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (draftId) {
      dispatch(fetchDraftById({ draftId }));
    }
  }, [dispatch, draftId]);

  useEffect(() => {
    if (currentDraft) {
      setEditForm({
        notes: currentDraft.notes || "",
        dueDate: currentDraft.dueDate || "",
        shippingAddress: currentDraft.shippingAddress || "",
        logoUrl: currentDraft.logoUrl || "",
      });
    }
  }, [currentDraft]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
        return <Check className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
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

  const handleSave = async () => {
    if (!currentDraft) return;
    
    const updateData = {
      ...editForm,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
    };
    
    const result = await dispatch(updateDraft({ 
      draftId: currentDraft.id, 
      data: updateData 
    }));
    
    if (updateDraft.fulfilled.match(result)) {
      toast.success("Draft updated successfully");
      setIsEditing(false);
    } else {
      toast.error("Failed to update draft");
    }
  };

  const handleFinalize = async () => {
    if (!currentDraft) return;
    
    // Use approve endpoint which creates the invoice
    const result = await dispatch(approveDraft({ 
      draftId: currentDraft.id
    }));
    if (approveDraft.fulfilled.match(result)) {
      // Check if invoice was created
      if (result.payload.data?.invoiceId) {
        toast.success("Draft approved and invoice created successfully!");
      } else {
        toast.success("Draft approved successfully!");
      }
      navigate(`/store/${storeId}/drafts`);
    } else {
      const errorMessage = result.payload as string || "Failed to approve draft";
      toast.error(errorMessage);
      console.error("Approve draft error:", result.payload);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!currentDraft) return;
    const result = await dispatch(submitDraftForApproval({ draftId: currentDraft.id }));
    if (submitDraftForApproval.fulfilled.match(result)) {
      toast.success("Draft submitted for approval");
    } else {
      toast.error("Failed to submit draft for approval");
    }
  };

  const handleApprove = async () => {
    if (!currentDraft) return;
    const result = await dispatch(approveDraft({ draftId: currentDraft.id }));
    if (approveDraft.fulfilled.match(result)) {
      toast.success("Draft approved successfully");
    } else {
      toast.error("Failed to approve draft");
    }
  };

  const handleReject = async () => {
    if (currentDraft && rejectReason.trim()) {
      const result = await dispatch(rejectDraft({ draftId: currentDraft.id, reason: rejectReason }));
      if (rejectDraft.fulfilled.match(result)) {
        toast.success("Draft rejected successfully");
      } else {
        toast.error("Failed to reject draft");
      }
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  const handleDelete = async () => {
    if (!currentDraft) return;
    
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      const result = await dispatch(deleteDraft({ draftId: currentDraft.id }));
      if (deleteDraft.fulfilled.match(result)) {
        toast.success("Draft deleted successfully");
        navigate(`/store/${storeId}/drafts`);
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : "Failed to delete draft";
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return <Loading label="Draft Details" />;
  }

  if (!currentDraft) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Draft not found
              </h3>
              <p className="text-gray-600 mb-6">
                The draft you're looking for doesn't exist or has been deleted.
              </p>
              <SpecialButton
                variant="primary"
                onClick={() => navigate(`/store/${storeId}/drafts`)}
                className="bg-[#03414C] hover:bg-[#025561] text-white"
              >
                Back to Drafts
              </SpecialButton>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <SpecialButton
              variant="secondary"
              onClick={() => navigate(`/store/${storeId}/drafts`)}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Drafts
            </SpecialButton>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Draft Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Draft Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-[#03414CF0]" />
                      {currentDraft.draftNumber}
                    </h1>
                    <p className="text-gray-600 mt-1">Version {currentDraft.version}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                      currentDraft.status
                    )}`}
                  >
                    {getStatusIcon(currentDraft.status)}
                    {currentDraft.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer & Business Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Customer</h3>
                      <p className="text-gray-600">{currentDraft.customer?.customerName}</p>
                      <p className="text-sm text-gray-500">{currentDraft.customer?.phoneNumber}</p>
                      <p className="text-sm text-gray-500">{currentDraft.customer?.customerMail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business</h3>
                      <p className="text-gray-600">{currentDraft.business?.businessName}</p>
                      <p className="text-sm text-gray-500">{currentDraft.business?.contactNo}</p>
                      <p className="text-sm text-gray-500">{currentDraft.business?.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Net Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(currentDraft.netAmount)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(currentDraft.tax)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Amount</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(currentDraft.totalAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900">{currentDraft.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cashier</p>
                    <p className="font-semibold text-gray-900">{currentDraft.cashierName}</p>
                  </div>
                </div>
              </div>

              {/* Draft-Specific Fields */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Draft Information</h3>
                  {canEdit(currentDraft.status) && (
                    <SpecialButton
                      variant="secondary"
                      onClick={() => setIsEditing(!isEditing)}
                      className="inline-flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? "Cancel" : "Edit"}
                    </SpecialButton>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Add notes for this draft..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={editForm.dueDate?.split('T')[0] || ""}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Address
                      </label>
                      <textarea
                        value={editForm.shippingAddress}
                        onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Enter shipping address..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <SpecialButton
                        variant="primary"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </SpecialButton>
                      <SpecialButton
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </SpecialButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-gray-900">{currentDraft.notes || "No notes"}</p>
                    </div>
                    {currentDraft.dueDate && (
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(currentDraft.dueDate)}
                        </p>
                      </div>
                    )}
                    {currentDraft.shippingAddress && (
                      <div>
                        <p className="text-sm text-gray-600">Shipping Address</p>
                        <p className="text-gray-900">{currentDraft.shippingAddress}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Actions & Timeline */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {canSubmitForApproval(currentDraft.status) && (
                    <SpecialButton
                      variant="primary"
                      onClick={handleSubmitForApproval}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit for Approval
                    </SpecialButton>
                  )}

                  {canApprove(currentDraft.status) && (
                    <SpecialButton
                      variant="primary"
                      onClick={handleApprove}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Draft
                    </SpecialButton>
                  )}

                  {canReject(currentDraft.status) && (
                    <SpecialButton
                      variant="secondary"
                      onClick={() => setShowRejectModal(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Draft
                    </SpecialButton>
                  )}

                  {canFinalize(currentDraft.status) && (
                    <SpecialButton
                      variant="primary"
                      onClick={handleFinalize}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Finalize to Invoice
                    </SpecialButton>
                  )}

                  {canDelete(currentDraft.status) && (
                    <SpecialButton
                      variant="secondary"
                      onClick={handleDelete}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete Draft
                    </SpecialButton>
                  )}
                </div>
              </div>

              {/* Draft Metadata */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Draft Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-900">{formatDate(currentDraft.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="text-gray-900">{formatDate(currentDraft.updatedAt)}</p>
                  </div>
                  {currentDraft.submittedForApprovalAt && (
                    <div>
                      <p className="text-gray-600">Submitted for Approval</p>
                      <p className="text-gray-900">{formatDate(currentDraft.submittedForApprovalAt)}</p>
                    </div>
                  )}
                  {currentDraft.approvedAt && (
                    <div>
                      <p className="text-gray-600">Approved</p>
                      <p className="text-gray-900">{formatDate(currentDraft.approvedAt)}</p>
                    </div>
                  )}
                  {currentDraft.finalizedAt && (
                    <div>
                      <p className="text-gray-600">Finalized</p>
                      <p className="text-gray-900">{formatDate(currentDraft.finalizedAt)}</p>
                      {currentDraft.invoiceId && (
                        <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                          <p className="text-purple-800 text-sm">Invoice ID: {currentDraft.invoiceId}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {currentDraft.rejectedAt && (
                    <div>
                      <p className="text-gray-600">Rejected</p>
                      <p className="text-gray-900">{formatDate(currentDraft.rejectedAt)}</p>
                      {currentDraft.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 rounded-lg">
                          <p className="text-red-800 text-sm">{currentDraft.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
                }}
                className="flex-1"
              >
                Cancel
              </SpecialButton>
              <SpecialButton
                variant="primary"
                onClick={handleReject}
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

export default DraftDetail;
