import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDraftById, updateDraft } from "../../store/slices/draftSlice";
import Header from "../../components/Header";
import { SpecialButton } from "../../components/buttons";
import Loading from "../../components/Loading";
import { 
  FileText, 
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  User,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react";
import { DraftStatus } from "../../types/draft";

interface EditFormData {
  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Business info  
  businessName: string;
  businessContact: string;
  businessAddress: string;
  
  // Financial
  netAmount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  
  // Draft specific
  notes: string;
  dueDate: string;
  shippingAddress: string;
  logoUrl: string;
}

const DraftEdit: React.FC = () => {
  const { id: storeId, draftId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDraft, loading, error } = useAppSelector((state) => state.drafts);

  const [formData, setFormData] = useState<EditFormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    businessName: "",
    businessContact: "",
    businessAddress: "",
    netAmount: 0,
    tax: 0,
    totalAmount: 0,
    paymentMethod: "",
    notes: "",
    dueDate: "",
    shippingAddress: "",
    logoUrl: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draftId) {
      dispatch(fetchDraftById({ draftId }));
    }
  }, [dispatch, draftId]);

  useEffect(() => {
    if (currentDraft) {
      setFormData({
        customerName: currentDraft.customer?.customerName || "",
        customerPhone: currentDraft.customer?.phoneNumber || "",
        customerEmail: currentDraft.customer?.customerMail || "",
        businessName: currentDraft.business?.businessName || "",
        businessContact: currentDraft.business?.contactNo || "",
        businessAddress: currentDraft.business?.address || "",
        netAmount: currentDraft.netAmount || 0,
        tax: currentDraft.tax || 0,
        totalAmount: currentDraft.totalAmount || 0,
        paymentMethod: currentDraft.paymentMethod || "",
        notes: currentDraft.notes || "",
        dueDate: currentDraft.dueDate ? currentDraft.dueDate.split('T')[0] : "",
        shippingAddress: currentDraft.shippingAddress || "",
        logoUrl: currentDraft.logoUrl || "",
      });
    }
  }, [currentDraft]);

  const handleInputChange = (field: keyof EditFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate total when net amount or tax changes
    if (field === 'netAmount' || field === 'tax') {
      const netAmount = field === 'netAmount' ? Number(value) : formData.netAmount;
      const tax = field === 'tax' ? Number(value) : formData.tax;
      setFormData(prev => ({
        ...prev,
        [field]: value,
        totalAmount: netAmount + tax
      }));
    }
  };

  const handleSave = async () => {
    if (!currentDraft) return;

    setSaving(true);
    try {
      const updateData = {
        // Only include customer object if we have at least one customer field
        ...(formData.customerName || formData.customerPhone || formData.customerEmail ? {
          customer: {
            ...(formData.customerName && { customerName: formData.customerName }),
            ...(formData.customerPhone && { phoneNumber: formData.customerPhone }),
            ...(formData.customerEmail && { customerMail: formData.customerEmail }),
          }
        } : {}),
        
        // Only include business object if we have at least one business field
        ...(formData.businessName || formData.businessContact || formData.businessAddress ? {
          business: {
            ...(formData.businessName && { businessName: formData.businessName }),
            ...(formData.businessContact && { contactNo: formData.businessContact }),
            ...(formData.businessAddress && { address: formData.businessAddress }),
          }
        } : {}),
        
        // Financial fields
        ...(formData.netAmount > 0 && { netAmount: formData.netAmount }),
        ...(formData.tax >= 0 && { tax: formData.tax }),
        ...(formData.totalAmount > 0 && { totalAmount: formData.totalAmount }),
        ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod as "CASH" | "CARD" | "BANK_TRANSFER" | "CHECK" | "DIGITAL_WALLET" }),
        
        // Optional fields
        ...(formData.notes && { notes: formData.notes }),
        ...(formData.dueDate && { dueDate: new Date(formData.dueDate).toISOString() }),
        ...(formData.shippingAddress && { shippingAddress: formData.shippingAddress }),
        ...(formData.logoUrl && { logoUrl: formData.logoUrl }),
      };

      console.log("🔄 Updating draft with data:", updateData);
      console.log("🔄 Draft ID:", currentDraft.id);

      const result = await dispatch(updateDraft({ 
        draftId: currentDraft.id, 
        data: updateData 
      }));
      
      console.log("📝 Update result:", result);
      
      if (updateDraft.fulfilled.match(result)) {
        toast.success("Draft updated successfully");
        navigate(`/store/${storeId}/draft/${draftId}`);
      } else {
        const errorMessage = result.payload as string || "Failed to update draft";
        toast.error(errorMessage);
        console.error("Update draft error:", result.payload);
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update draft: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const canEdit = (status: string) => {
    return status === DraftStatus.DRAFT || status === DraftStatus.REJECTED;
  };

  if (loading) {
    return <Loading label="Loading Draft" />;
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

  if (!canEdit(currentDraft.status)) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cannot Edit Draft
              </h3>
              <p className="text-gray-600 mb-6">
                This draft cannot be edited in its current status ({currentDraft.status.replace(/_/g, ' ')}).
                Only drafts with status "DRAFT" or "REJECTED" can be edited.
              </p>
              <SpecialButton
                variant="primary"
                onClick={() => navigate(`/store/${storeId}/draft/${draftId}`)}
                className="bg-[#03414C] hover:bg-[#025561] text-white"
              >
                View Draft
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SpecialButton
                variant="secondary"
                onClick={() => navigate(`/store/${storeId}/draft/${draftId}`)}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Draft
              </SpecialButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#03414CF0]" />
                  Edit Draft: {currentDraft.draftNumber}
                </h1>
                <p className="text-gray-600 mt-1">Version {currentDraft.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SpecialButton
                variant="secondary"
                onClick={() => navigate(`/store/${storeId}/draft/${draftId}`)}
                className="inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </SpecialButton>
              <SpecialButton
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </SpecialButton>
            </div>
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

          {/* Edit Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.businessContact}
                    onChange={(e) => handleInputChange('businessContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.netAmount}
                    onChange={(e) => handleInputChange('netAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Method</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHECK">Check</option>
                    <option value="DIGITAL_WALLET">Digital Wallet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Draft Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Draft Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    value={formData.shippingAddress}
                    onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Enter shipping address..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add notes for this draft..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <SpecialButton
              variant="secondary"
              onClick={() => navigate(`/store/${storeId}/draft/${draftId}`)}
              className="inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </SpecialButton>
            <SpecialButton
              variant="primary"
              onClick={handleSave}
              disabled={saving || !formData.customerName || formData.netAmount <= 0}
              className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </SpecialButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default DraftEdit;
