export interface EmployeeAPIData {
  id?: string;
  employeeCode: string; // 6-digit employee code (matches backend schema)
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  createdAt?: string; // Backend uses createdAt instead of joiningDate
  permissions: [
    {
      resource: string;
      actions: string[]; // Changed from 'action' to 'actions'
      storeId: string;
    },
  ];
  storeIds: string[];
}

export interface EmployeeFormData {
  id?: string;
  employeeCode: string; // 6-digit employee code (matches backend schema)
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  // joiningDate?: string; // Frontend-only field for display
  password?: string; // Optional for edit mode
  permissions: [
    {
      resource: string;
      actions: string[]; // Changed from 'action' to 'actions'
      storeId: string;
    },
  ];
  storeIds: string[];
}

export interface Role {
  id: string;
  name: string;
  employeeName: string;
  employeeId: string;
  avatars: string[];
  createdDate: string;
  permissions: Permission[];
  status: "Active" | "Inactive";
}

export interface Permission {
  id: string;
  name: string;
  icon: React.ReactElement;
}

export interface EmployeePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeState {
  employees: EmployeeAPIData[];
  roles: Role[];
  currentEmployee: EmployeeAPIData | null;
  loading: boolean;
  error: string | null;
  pagination: EmployeePagination;
  // --- Role Templates State ---
  roleTemplates: RoleTemplate[];
  roleTemplatesLoading: boolean;
  roleTemplatesError: string | null;
}

// --- Role Template Types ---
export interface RoleTemplatePermission {
  resource: string;
  action: string;
  scope: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: RoleTemplatePermission[];
  inheritsFrom: string | null;
  isDefault: boolean;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
