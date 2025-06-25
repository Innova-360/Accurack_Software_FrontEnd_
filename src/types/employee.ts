export interface EmployeeAPIData {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  employeeCode: string;
  position: string;
  department: string;
  phone: string;
  joiningDate: string;
  email: string;
  permissions: [
    {resource: string ,
      actions: string[]; // Changed from 'action' to 'actions'
      storeId: string;
    }
  ];
  storeIds: string[];
}

export interface EmployeeFormData {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  employeeCode: string;
  position: string;
  department: string;
  phone: string;
  joiningDate: string;
  email: string;
  password?: string; // Optional for edit mode
  permissions: [
    {
      resource: string;
      actions: string[]; // Changed from 'action' to 'actions'
      storeId: string;
    }
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
}
