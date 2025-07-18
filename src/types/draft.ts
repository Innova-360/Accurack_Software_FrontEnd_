export const DraftStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FINALIZED: 'FINALIZED'
} as const;

export type DraftStatus = typeof DraftStatus[keyof typeof DraftStatus];

// New interfaces for direct draft creation
export interface DraftItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  productId?: string;
}

export interface DraftCustomField {
  name: string;
  value: string;
}

export interface CreateDirectDraftRequest {
  storeId: string;
  customerId?: string;
  notes?: string;
  dueDate?: string;
  shippingAddress?: string;
  logoUrl?: string;
  totalAmount?: number;
  netAmount?: number;
  tax?: number;
  paymentMethod?: string;
  cashierName?: string;
  customFields?: DraftCustomField[];
  // For creating from sale
  saleId?: string;
}

export interface DraftItemResponse {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  productId?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    pluUpc?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDirectDraftResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    draftNumber: string;
    version: number;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'FINALIZED';
    customerName: string;
    totalAmount: number;
    netAmount: number;
    tax: number;
    notes?: string;
    draftItems: DraftItemResponse[];
    customFields?: Array<{
      id: string;
      name: string;
      value: string;
    }>;
    createdAt: string;
  };
  status: number;
  timestamp: string;
}

// Legacy interface for creating draft from existing sale
export interface CreateDraftRequest {
  saleId?: string; // Made optional for direct draft creation
  notes?: string;
  dueDate?: string; // ISO date
  shippingAddress?: string;
  logoUrl?: string;
  data?: any; // For storing form data when creating draft without sale
  customFields?: Array<{
    name: string;
    value: string;
  }>;
}

export interface CreateDraftResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    draftNumber: string;
    version: number;
    status: 'DRAFT';
    saleId: string;
    customerName: string;
    totalAmount: number;
    notes?: string;
    createdAt: string;
  };
  status: number;
  timestamp: string;
}

export interface DraftQueryParams {
  page?: number;
  limit?: number;
  status?: DraftStatus;
  saleId?: string;
  customerId?: string;
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  search?: string;
}

export interface DraftListItem {
  id: string;
  draftNumber: string;
  version: number;
  status: DraftStatus;
  saleId?: string; // Make optional as it might not always be present
  customerName: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  submittedForApprovalAt?: string;
  approvedAt?: string;
}

export interface DraftListResponse {
  success: boolean;
  message: string;
  data: {
    drafts: DraftListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  status: number;
  timestamp: string;
}

export interface UserInfo {
  id: string;
  firstName: string;
  email: string;
}

export interface DraftDetailResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    draftNumber: string;
    version: number;
    status: DraftStatus;
    saleId: string;
    originalInvoiceId?: string;
    
    // Draft-specific fields
    notes?: string;
    dueDate?: string;
    shippingAddress?: string;
    logoUrl?: string;
    
    // Auto-populated from sale
    customerId: string;
    businessId: string;
    totalAmount: number;
    netAmount: number;
    tax: number;
    paymentMethod: string;
    cashierName: string;
    
    // Workflow fields
    submittedForApprovalAt?: string;
    submittedBy?: string;
    submittedByUser?: UserInfo;
    approvedAt?: string;
    approvedBy?: string;
    approvedByUser?: UserInfo;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectedByUser?: UserInfo;
    rejectionReason?: string;
    finalizedAt?: string;
    finalizedBy?: string;
    finalizedByUser?: UserInfo;
    invoiceId?: string;
    
    // Relations
    sale: any; // SaleWithItems type
    customer: any; // Customer type from invoice.ts
    business: any; // Business type from invoice.ts
    customFields: Array<{
      id: string;
      name: string;
      value: string;
    }>;
    
    // Metadata
    userId: string;
    storeId: string;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  };
  status: number;
  timestamp: string;
}

export interface UpdateDraftRequest {
  notes?: string;
  dueDate?: string | Date;
  shippingAddress?: string;
  logoUrl?: string;
  customFields?: Array<{
    name: string;
    value: string;
  }>;
  customer?: {
    customerName?: string;
    phoneNumber?: string;
    customerMail?: string;
  };
  business?: {
    businessName?: string;
    contactNo?: string;
    address?: string;
  };
  netAmount?: number;
  tax?: number;
  totalAmount?: number;
  paymentMethod?: "CASH" | "CARD" | "BANK_TRANSFER" | "CHECK" | "DIGITAL_WALLET";
}

export interface FinalizeDraftRequest {
  generateInvoiceNumber?: boolean; // default: true
  customInvoiceNumber?: string;
  includeQRCode?: boolean; // default: true
}

export interface SubmitForApprovalRequest {
  // No body required
}

export interface RejectDraftRequest {
  reason: string;
}

// Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
  timestamp: string;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: DraftStatus;
    submittedAt: string;
  };
}

export interface ApproveResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: DraftStatus;
    approvedAt: string;
    finalizedAt?: string; // Added for when invoice is created
    invoiceId?: string; // Added for when invoice is created
  };
}

export interface RejectResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: DraftStatus;
    rejectedAt: string;
    rejectionReason: string;
  };
}

export interface FinalizeResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: DraftStatus;
    finalizedAt: string;
    invoiceId?: string;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
