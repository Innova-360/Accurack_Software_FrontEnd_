export interface Customer {
  id: string;
  customerName: string;
  customerAddress: string;
  phoneNumber: string;
  telephoneNumber?: string;
  customerMail: string;
  storeId: string;
  clientId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormData {
  customerName: string;
  customerAddress: string;
  phoneNumber: string;
  telephoneNumber: string;
  customerMail: string;
  storeId: string;
  clientId: string;
}

export interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerResponse {
  customers: Customer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
