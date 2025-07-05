export interface OrderItem {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  paymentAmount: number;
  paymentType: PaymentType;
  driverName: string;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  isValidated?: boolean;
  validatedAt?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'delivered' 
  | 'shipped' 
  | 'completed'
  | 'cancelled'
  | 'processing';

export type PaymentType = 
  | 'CASH' 
  | 'CARD' 
  | 'BANK_TRANSFER' 
  | 'CHECK' 
  | 'DIGITAL_WALLET';

export interface OrderFormData {
  customerId: string;
  customerName: string;
  status: OrderStatus;
  paymentAmount: number;
  paymentType: PaymentType;
  driverName: string;
  storeId: string;
  isValidated?: boolean;
  validatedAt?: string;
}

export interface OrderState {
  orders: OrderItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CreateOrderRequest {
  customerId: string;
  status: OrderStatus;
  paymentAmount: number;
  paymentType: PaymentType;
  driverName: string;
  storeId: string;
  isValidated?: boolean;
  validatedAt?: string;
}

export interface UpdateOrderRequest {
  id: string;
  customerId?: string;
  status?: OrderStatus;
  paymentAmount?: number;
  paymentType?: PaymentType;
  driverName?: string;
  isValidated?: boolean;
  validatedAt?: string;
}

export interface FetchOrdersParams {
  storeId: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentType?: PaymentType;
  search?: string;
}
