export interface Supplier {
  id?: string; // Optional numeric/UUID ID from backend
  supplier_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeId: string;
  status?: "active" | "inactive"; // Added status field
  createdAt?: Date;
  updatedAt?: Date;
  isTemporary?: boolean; // Flag for temporary suppliers (newly created)
  _id?: string; // MongoDB ObjectId if used
}

export interface SupplierFormData {
  supplier_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeId: string;
  status?: "active" | "inactive"; // Default should be 'active'
}

export interface SupplierPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SupplierState {
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  loading: boolean;
  error: string | null;
  pagination: SupplierPagination;
}
