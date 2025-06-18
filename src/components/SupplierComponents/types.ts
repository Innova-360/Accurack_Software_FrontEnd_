export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: 'Active' | 'Inactive';
  productsSupplied: number;
  totalValue: number;
  joinedDate: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  supplierId: number;
}
