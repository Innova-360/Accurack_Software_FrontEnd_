export interface Supplier {
  id?: string; // Optional numeric/UUID ID from backend
  supplier_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'active' | 'inactive'; // Added status field
}

export interface SupplierFormData {
  supplier_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeId: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  supplierId: string; // Changed from number to string to match supplier_id
}
