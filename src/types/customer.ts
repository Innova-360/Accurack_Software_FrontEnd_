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
  balance: CustomerBalanceState;
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

interface BalanceSheet {
  id: string;

  customerId: string;

  saleId: string | null;

  remainingAmount: number;

  amountPaid: number;

  paymentStatus: "PAID" | "UNPAID" | "PARTIALLY_PAID"; // adjust based on actual values

  description: string;

  createdAt: string;

  updatedAt: string;
}

interface CustomerData {
  id: string;

  customerName: string;

  customerAddress: string;

  phoneNumber: string;

  telephoneNumber: string;

  customerMail: string;

  website: string | null;

  threshold: number;

  storeId: string;

  clientId: string;

  createdAt: string;

  updatedAt: string;

  balanceSheets: BalanceSheet[];

  _count: {
    sales: number;
  };
}

export interface SearchCustomersResponse {
  success: boolean;

  message: string;

  data: {
    customers: CustomerData[];

    total: number;

    page: number;

    limit: number;

    totalPages: number;
  };

  status: number;

  timestamp: string;
}

export interface BalanceHistoryItem {
  id: string;
  customerId: string;
  saleId: string | null;
  remainingAmount: number;
  amountPaid: number;
  paymentStatus: "PAID" | "UNPAID" | "PARTIALLY_PAID";
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerBalanceData {
  customer: Customer & {
    website: string | null;
    threshold: number;
  };
  currentBalance: number;
  totalPaid: number;
  balanceHistory: BalanceHistoryItem[];
}

export interface CustomerBalanceResponse {
  success: boolean;
  message: string;
  data: CustomerBalanceData;
  status: number;
  timestamp: string;
}

export interface CustomerBalanceState {
  balanceData: CustomerBalanceData | null;
  loading: boolean;
  error: string | null;
}
