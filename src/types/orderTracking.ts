export interface OrderTrackingItem {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderTrackingStatus;
  paymentAmount: number;
  originalPaymentAmount: number;
  paymentType: PaymentType;
  driverName: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  validatedAt: string;
  createdAt: string;
  updatedAt: string;
  storeId: string;
}

export type OrderTrackingStatus = 
  | 'pending_verification' 
  | 'verified' 
  | 'rejected'
  | 'under_review';

export type PaymentType = 
  | 'CASH' 
  | 'CARD' 
  | 'BANK_TRANSFER' 
  | 'CHECK' 
  | 'DIGITAL_WALLET';

export interface OrderTrackingFormData {
  paymentAmount: number;
  verificationNotes?: string;
}

export interface OrderTrackingState {
  trackingOrders: OrderTrackingItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderTrackingStats {
  totalTrackingOrders: number;
  pendingVerification: number;
  verifiedOrders: number;
  rejectedOrders: number;
  totalVerifiedAmount: number;
  averageVerificationTime: number;
}

export interface VerifyOrderRequest {
  id: string;
  paymentAmount: number;
  verificationNotes?: string;
  storeId: string;
}

export interface RejectOrderRequest {
  id: string;
  rejectionReason: string;
  storeId: string;
}

export interface FetchTrackingOrdersParams {
  storeId: string;
  page?: number;
  limit?: number;
  status?: OrderTrackingStatus;
  paymentType?: PaymentType;
  search?: string;
  isVerified?: boolean;
}
