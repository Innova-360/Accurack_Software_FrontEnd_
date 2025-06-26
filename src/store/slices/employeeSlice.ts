import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  EmployeeAPIData,
  EmployeeFormData,
  EmployeeState,
} from "../../types/employee";
import apiClient from "../../services/api";

const initialState: EmployeeState = {
  employees: [],
  roles: [],
  currentEmployee: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks for API calls
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (
    {
      storeId,
      page = 1,
      limit = 10,
    }: { storeId: string | undefined; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (storeId) params.append("storeId", storeId);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const url = `/employees?${params.toString()}`;
      const response = await apiClient.get(url);
      console.log(response)

      // Handle different response structures from backend
      let employees = [];
      let pagination = {
        page,
        limit,
        total: 0,
        totalPages: 0,
      };

      if (response.data) {
        if (Array.isArray(response.data)) {
          employees = response.data;
          pagination.total = employees.length;
          pagination.totalPages = Math.ceil(employees.length / limit);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employees = response.data.data;
          if (response.data.pagination) {
            pagination = { ...pagination, ...response.data.pagination };
          } else {
            pagination.total = employees.length;
            pagination.totalPages = Math.ceil(employees.length / limit);
          }
        }
      }

      return { employees, pagination };
    } catch (error: any) {
      console.error("Fetch employees error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees"
      );
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchEmployeeById",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/employees/${employeeId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee"
      );
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (employeeData: EmployeeFormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/employees", employeeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create employee"
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (
    { id, employeeData }: { id: string; employeeData: EmployeeFormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee"
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/employees/${employeeId}`);
      return employeeId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete employee"
      );
    }
  }
);

export const updateEmployeePermissions = createAsyncThunk(
  "employees/updateEmployeePermissions",
  async (
    { id, permissions }: { id: string; permissions: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put(`/employees/${id}/permissions`, {
        permissions,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee permissions"
      );
    }
  }
);

// Fetch roles/permissions
export const fetchRoles = createAsyncThunk(
  "employees/fetchRoles",
  async (storeId: string | undefined, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (storeId) params.append("storeId", storeId);

      const url = `/employees/roles?${params.toString()}`;
      const response = await apiClient.get(url);

      let roles = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          roles = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          roles = response.data.data;
        }
      }

      return roles;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    }
  }
);

// Fetch role templates from permissions API
export const fetchRoleTemplates = createAsyncThunk(
  "employees/fetchRoleTemplates",
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

// Create role template
export const createRoleTemplate = createAsyncThunk(
  "employees/createRoleTemplate",
  async (roleData: any, { rejectWithValue }) => {
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

// Update role template
export const updateRoleTemplate = createAsyncThunk(
  "employees/updateRoleTemplate",
  async (
    { id, roleData }: { id: string; roleData: any },
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

// Delete role template
export const deleteRoleTemplate = createAsyncThunk(
  "employees/deleteRoleTemplate",
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

// Assign role template to users
export const assignRoleTemplate = createAsyncThunk(
  "employees/assignRoleTemplate",
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

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearEmployees: (state) => {
      state.employees = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    setCurrentEmployee: (state, action: PayloadAction<EmployeeAPIData>) => {
      state.currentEmployee = action.payload;
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
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(
          (emp) => emp.id === action.payload.id
        );
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(
          (emp) => emp.id !== action.payload
        );
        state.pagination.total -= 1;
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update employee permissions
      .addCase(updateEmployeePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployeePermissions.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(
          (emp) => emp.id === action.payload.id
        );
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployeePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch role templates
      .addCase(fetchRoleTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
        state.error = null;
      })
      .addCase(fetchRoleTemplates.rejected, (state, action) => {
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
        state.roles.push(action.payload);
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
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
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
        state.roles = state.roles.filter(role => role.id !== action.payload);
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
  clearEmployees,
  clearCurrentEmployee,
  setCurrentEmployee,
  setPage,
  clearError,
} = employeeSlice.actions;

export default employeeSlice.reducer;
