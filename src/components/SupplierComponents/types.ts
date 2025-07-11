export interface Supplier {
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  id?: string; // Optional numeric/UUID ID from backend
  supplier_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeId: string;
  status?: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
  isTemporary?: boolean;
  _id?: string;
  productSuppliers?: ProductSupplier[];
}

export interface ProductSupplier {
  id: string;
  productId: string;
  supplierId: string;
  costPrice: number;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
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
