export interface EmployeeAPIData {
  id?: string;
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
      action: string[];
      storeId: string;
    }
  ];
  storeIds: string[];
}

export interface EmployeeFormData {
  id?: string;
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
      action: string[];
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
