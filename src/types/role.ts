// Role Template interfaces
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

export interface RoleFormData {
  id?: string;
  name: string;
  description: string;
  permissions: Array<{
    resource: string;
    action: string | string[];
  }>;
  inheritsFrom?: string;
  isDefault?: boolean;
  priority?: number;
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

// Permission-related interfaces
export interface Permission {
  resource: string;
  action: string | string[];
  storeId?: string;
  granted: boolean;
}

export interface RoleAssignment {
  userId: string;
  roleTemplateId: string;
  storeId?: string;
}

// API Response interfaces
export interface RoleTemplateResponse {
  data: RoleTemplate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleRoleTemplateResponse {
  data: RoleTemplate;
}
