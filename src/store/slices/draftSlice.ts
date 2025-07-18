import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import type { 
  DraftListResponse, 
  DraftDetailResponse, 
  CreateDraftResponse, 
  DraftQueryParams,
  CreateDirectDraftRequest,
  CreateDirectDraftResponse,
  UpdateDraftRequest,
  DeleteResponse,
  SubmitResponse,
  ApproveResponse,
  RejectResponse
} from "../../types/draft";

interface DraftState {
  drafts: DraftListResponse['data'] | null;
  currentDraft: DraftDetailResponse['data'] | null;
  loading: boolean;
  error: string | null;
  filters: DraftQueryParams;
}

const initialState: DraftState = {
  drafts: null,
  currentDraft: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    status: undefined,
    search: "",
  },
};

// Create direct draft (new endpoint for creating drafts without existing sale)
export const createDirectDraft = createAsyncThunk<
  CreateDirectDraftResponse,
  CreateDirectDraftRequest,
  { rejectValue: string }
>("drafts/createDirectDraft", async (draftData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/invoice-drafts", draftData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create direct draft"
    );
  }
});

// Create draft from sale (legacy endpoint) - Remove this since it's not in Swagger
// Use createDirectDraft instead with proper data structure

// Legacy function name for backward compatibility
export const createDraft = createDirectDraft;

// Create draft from sale function using the correct endpoint
export const createDraftFromSale = createAsyncThunk<
  CreateDirectDraftResponse,
  { 
    saleId: string; 
    storeId?: string; 
    notes?: string; 
    dueDate?: string; 
    shippingAddress?: string; 
    logoUrl?: string; 
    customFields?: Array<{ name: string; value: string; }>; 
  },
  { rejectValue: string }
>("drafts/createDraftFromSale", async (draftData, { rejectWithValue }) => {
  try {
    // Use the main draft creation endpoint with saleId in the body
    const response = await apiClient.post("/invoice-drafts", draftData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create draft from sale"
    );
  }
});

// Convert invoice to draft
export const createDraftFromInvoice = createAsyncThunk<
  CreateDraftResponse,
  { invoiceId: string; notes?: string; dueDate?: string },
  { rejectValue: string }
>("drafts/createDraftFromInvoice", async (data, { rejectWithValue }) => {
  try {
    const payload = {
      notes: data.notes,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };
    const response = await apiClient.post(`/invoice-drafts/convert/${data.invoiceId}`, payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to convert invoice to draft"
    );
  }
});

// Get all drafts with pagination and filters
export const fetchDrafts = createAsyncThunk<
  DraftListResponse,
  { params?: DraftQueryParams },
  { rejectValue: string }
>("drafts/fetchDrafts", async ({ params }, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.saleId) queryParams.append('saleId', params.saleId);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const response = await apiClient.get(`/invoice-drafts?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch drafts"
    );
  }
});

// Get draft by ID
export const fetchDraftById = createAsyncThunk<
  DraftDetailResponse,
  { draftId: string },
  { rejectValue: string }
>("drafts/fetchDraftById", async ({ draftId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/invoice-drafts/${draftId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch draft"
    );
  }
});

// Update draft
export const updateDraft = createAsyncThunk<
  DraftDetailResponse,
  { draftId: string; data: UpdateDraftRequest },
  { rejectValue: string }
>("drafts/updateDraft", async ({ draftId, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/invoice-drafts/${draftId}`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update draft"
    );
  }
});

// Delete draft
export const deleteDraft = createAsyncThunk<
  DeleteResponse & { draftId: string },
  { draftId: string },
  { rejectValue: string }
>("drafts/deleteDraft", async ({ draftId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.delete(`/invoice-drafts/${draftId}`);
    return { ...response.data, draftId }; // Include draftId for easier handling
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete draft"
    );
  }
});

// Submit draft for approval
export const submitDraftForApproval = createAsyncThunk<
  SubmitResponse,
  { draftId: string },
  { rejectValue: string }
>("drafts/submitForApproval", async ({ draftId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/invoice-drafts/${draftId}/submit`);
    return { ...response.data, draftId }; // Include draftId for easier handling
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to submit draft for approval"
    );
  }
});
   

// Approve draft and create invoice
export const approveDraft = createAsyncThunk<
  ApproveResponse,
  { draftId: string },
  { rejectValue: string }
>("drafts/approveDraft", async ({ draftId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/invoice-drafts/${draftId}/approve`);
    return { ...response.data, draftId }; // Include draftId for easier handling
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to approve draft"
    );
  }
});

// Reject draft
export const rejectDraft = createAsyncThunk<
  RejectResponse,
  { draftId: string; reason: string },
  { rejectValue: string }
>("drafts/rejectDraft", async ({ draftId, reason }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/invoice-drafts/${draftId}/reject`, { reason });
    return { ...response.data, draftId }; // Include draftId for easier handling
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to reject draft"
    );
  }
});
   

// Legacy finalize function for backward compatibility - redirects to approve
export const finalizeDraft = approveDraft;

// Get version history of a draftf
export const getDraftVersions = createAsyncThunk<
  any, // Define proper type based on API response
  { draftId: string },
  { rejectValue: string }
>("drafts/getDraftVersions", async ({ draftId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/invoice-drafts/${draftId}/versions`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to get draft versions"
    );
  }
});

// Revert draft to previous version
export const revertDraftToVersion = createAsyncThunk<
  any, // Define proper type based on API response
  { draftId: string; versionId: string },
  { rejectValue: string }
>("drafts/revertDraftToVersion", async ({ draftId, versionId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/invoice-drafts/${draftId}/revert/${versionId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to revert draft to version"
    );
  }
});

// Compare two versions of a draft
export const compareDraftVersions = createAsyncThunk<
  any, // Define proper type based on API response
  { draftId: string; version1Id: string; version2Id: string },
  { rejectValue: string }
>("drafts/compareDraftVersions", async ({ draftId, version1Id, version2Id }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/invoice-drafts/${draftId}/versions/compare/${version1Id}/${version2Id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to compare draft versions"
    );
  }
});

const draftSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    clearDrafts(state) {
      state.drafts = null;
      state.error = null;
    },
    clearCurrentDraft(state) {
      state.currentDraft = null;
    },
    setFilters(state, action: PayloadAction<Partial<DraftQueryParams>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create draft
      .addCase(createDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDraft.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new draft to the list if it exists
        if (state.drafts && action.payload.data) {
          // Ensure the draft data has all required fields for DraftListItem
          const draftData = action.payload.data;
          const draftListItem: any = {
            ...draftData,
            // Filter out any status that's not in our DraftStatus enum
            status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'FINALIZED'].includes(draftData.status) 
              ? draftData.status 
              : 'DRAFT'
          };
          state.drafts.drafts.unshift(draftListItem);
          state.drafts.total += 1;
        }
      })
      .addCase(createDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create draft";
      })

      // Convert invoice to draft
      .addCase(createDraftFromInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDraftFromInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new draft to the list if it exists
        if (state.drafts && action.payload.data) {
          state.drafts.drafts.unshift(action.payload.data);
          state.drafts.total += 1;
        }
      })
      .addCase(createDraftFromInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to convert invoice to draft";
      })

      // Fetch drafts
      .addCase(fetchDrafts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.loading = false;
        state.drafts = action.payload.data;
      })
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch drafts";
      })

      // Fetch draft by ID
      .addCase(fetchDraftById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDraftById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDraft = action.payload.data;
      })
      .addCase(fetchDraftById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch draft";
      })

      // Update draft
      .addCase(updateDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDraft = action.payload.data;
        // Update in the list if it exists
        if (state.drafts) {
          const index = state.drafts.drafts.findIndex(d => d.id === action.payload.data.id);
          if (index !== -1) {
            // Update the list item with relevant fields
            state.drafts.drafts[index] = {
              ...state.drafts.drafts[index],
              notes: action.payload.data.notes,
              totalAmount: action.payload.data.totalAmount,
              status: action.payload.data.status,
            };
          }
        }
      })
      .addCase(updateDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update draft";
      })

      // Delete draft
      .addCase(deleteDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDraft.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from list
        if (state.drafts) {
          state.drafts.drafts = state.drafts.drafts.filter(d => d.id !== action.payload.draftId);
          state.drafts.total -= 1;
        }
        // Clear current if it was deleted
        if (state.currentDraft?.id === action.payload.draftId) {
          state.currentDraft = null;
        }
      })
      .addCase(deleteDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete draft";
      })

      // Submit for approval
      .addCase(submitDraftForApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDraftForApproval.fulfilled, (state, action) => {
        state.loading = false;
        // Update draft status
        if (state.currentDraft) {
          state.currentDraft.status = 'PENDING_APPROVAL';
        }
        // Update in list
        if (state.drafts) {
          const draftId = (action.payload as any).draftId || action.payload.data?.id;
          const index = state.drafts.drafts.findIndex(d => d.id === draftId);
          if (index !== -1) {
            state.drafts.drafts[index].status = 'PENDING_APPROVAL';
          }
        }
      })
      .addCase(submitDraftForApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to submit draft for approval";
      })

      // Approve draft and create invoice
      .addCase(approveDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveDraft.fulfilled, (state, action) => {
        state.loading = false;
        // Update draft status to APPROVED or FINALIZED depending on API response
        if (state.currentDraft) {
          // Check if invoice was created (indicating finalization)
          if (action.payload.data?.invoiceId) {
            state.currentDraft.status = 'FINALIZED';
            state.currentDraft.finalizedAt = action.payload.data.approvedAt || action.payload.data.finalizedAt;
            state.currentDraft.invoiceId = action.payload.data.invoiceId;
          } else {
            state.currentDraft.status = 'APPROVED';
          }
          state.currentDraft.approvedAt = action.payload.data.approvedAt;
        }
        // Update in list
        if (state.drafts) {
          const draftId = (action.payload as any).draftId || action.payload.data?.id;
          const index = state.drafts.drafts.findIndex(d => d.id === draftId);
          if (index !== -1) {
            // Set status based on whether invoice was created
            if (action.payload.data?.invoiceId) {
              state.drafts.drafts[index].status = 'FINALIZED';
            } else {
              state.drafts.drafts[index].status = 'APPROVED';
            }
          }
        }
      })
      .addCase(approveDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to approve draft";
      })

      // Reject draft
      .addCase(rejectDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectDraft.fulfilled, (state, action) => {
        state.loading = false;
        // Update draft status
        if (state.currentDraft) {
          state.currentDraft.status = 'REJECTED';
          state.currentDraft.rejectionReason = action.payload.data?.rejectionReason;
        }
        // Update in list
        if (state.drafts) {
          const draftId = (action.payload as any).draftId || action.payload.data?.id;
          const index = state.drafts.drafts.findIndex(d => d.id === draftId);
          if (index !== -1) {
            state.drafts.drafts[index].status = 'REJECTED';
          }
        }
      })
      .addCase(rejectDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to reject draft";
      })

      // Note: finalizeDraft is now an alias for approveDraft, so no separate reducers needed

      // Get draft versions
      .addCase(getDraftVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDraftVersions.fulfilled, (state, _action) => {
        state.loading = false;
        // Store versions data in state if needed
      })
      .addCase(getDraftVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to get draft versions";
      })

      // Revert draft to version
      .addCase(revertDraftToVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(revertDraftToVersion.fulfilled, (state, _action) => {
        state.loading = false;
        // Update current draft with reverted data
        // Will need to refetch the draft details
      })
      .addCase(revertDraftToVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to revert draft to version";
      })

      // Compare draft versions
      .addCase(compareDraftVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareDraftVersions.fulfilled, (state, _action) => {
        state.loading = false;
        // Store comparison data if needed
      })
      .addCase(compareDraftVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to compare draft versions";
      });
  },
});

export const { clearDrafts, clearCurrentDraft, setFilters, clearError } = draftSlice.actions;
export default draftSlice.reducer;
