export interface Supplier {
  id?: string; // Optional numeric/UUID ID from backend
  supplier_id: string;
  name: string;
  email: string;
  phone: string;
  address: string; // Main address field for display in table
  streetAddress?: string; // Detailed street address
  city?: string; // City
  state?: string; // State/Province/Region
  zipCode?: string; // ZIP/Postal Code
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
  address: string; // Composed from detailed fields
  streetAddress: string; // Street address field for form
  city: string; // City field for form
  state: string; // State field for form
  zipCode: string; // ZIP code field for form
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
