import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Role interfaces
export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Array<{
    resource: string;
    action: string | string[];
  }>;
  inheritsFrom?: string;
  isDefault: boolean;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleState {
  roleTemplates: RoleTemplate[];
  currentRole: RoleTemplate | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: RoleState = {
  roleTemplates: [],
  currentRole: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks for Role Template API calls
export const fetchRoleTemplates = createAsyncThunk(
  "roles/fetchRoleTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/permissions/templates');
      return response.data?.data || response.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch role templates"
      );
    }
  }
);

export const fetchRoleTemplateById = createAsyncThunk(
  "roles/fetchRoleTemplateById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/permissions/templates/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch role template"
      );
    }
  }
);

export const createRoleTemplate = createAsyncThunk(
  "roles/createRoleTemplate",
  async (roleData: Partial<RoleTemplate>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/permissions/templates', roleData);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create role template"
      );
    }
  }
);

export const updateRoleTemplate = createAsyncThunk(
  "roles/updateRoleTemplate",
  async (
    { id, roleData }: { id: string; roleData: Partial<RoleTemplate> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put(`/permissions/templates/${id}`, roleData);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role template"
      );
    }
  }
);

export const deleteRoleTemplate = createAsyncThunk(
  "roles/deleteRoleTemplate",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/permissions/templates/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete role template"
      );
    }
  }
);

export const assignRoleTemplate = createAsyncThunk(
  "roles/assignRoleTemplate",
  async (
    { userIds, roleTemplateId, storeId }: { userIds: string[]; roleTemplateId: string; storeId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post('/permissions/templates/assign', {
        userIds,
        roleTemplateId,
        storeId,
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign role template"
      );
    }
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearRoles: (state) => {
      state.roleTemplates = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
    setCurrentRole: (state, action: PayloadAction<RoleTemplate>) => {
      state.currentRole = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch role templates
      .addCase(fetchRoleTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.roleTemplates = action.payload;
        state.error = null;
      })
      .addCase(fetchRoleTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch role template by ID
      .addCase(fetchRoleTemplateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleTemplateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
        state.error = null;
      })
      .addCase(fetchRoleTemplateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create role template
      .addCase(createRoleTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoleTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.roleTemplates.push(action.payload);
        state.error = null;
      })
      .addCase(createRoleTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update role template
      .addCase(updateRoleTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoleTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roleTemplates.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roleTemplates[index] = action.payload;
        }
        if (state.currentRole?.id === action.payload.id) {
          state.currentRole = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRoleTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete role template
      .addCase(deleteRoleTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoleTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.roleTemplates = state.roleTemplates.filter(role => role.id !== action.payload);
        if (state.currentRole?.id === action.payload) {
          state.currentRole = null;
        }
        state.error = null;
      })
      .addCase(deleteRoleTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Assign role template
      .addCase(assignRoleTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRoleTemplate.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(assignRoleTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearRoles,
  clearCurrentRole,
  setCurrentRole,
  setPage,
  clearError,
} = roleSlice.actions;

export default roleSlice.reducer;
