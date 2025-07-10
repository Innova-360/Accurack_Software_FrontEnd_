export interface InvoiceResponseData {
  id: string;
  saleId: string;
  customerId: string;
  businessId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerMail: string;
  customerWebsite: string | null;
  customerAddress: string;
  businessName: string;
  businessContact: string;
  businessWebsite: string;
  businessAddress: string;
  shippingAddress: string;
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | string;
  totalAmount: number;
  netAmount: number;
  tax: number;
  status: "COMPLETED" | "PENDING" | "CANCELLED" | string;
  cashierName: string;
  logoUrl: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  sale: Sale;
  customer: Customer;
  business: Business;
  customFields: CustomField[];
}

export interface Sale {
  id: string;
  customerId: string;
  userId: string;
  storeId: string;
  clientId: string;
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | string;
  totalAmount: number;
  confirmation: "CONFIRMED" | "PENDING" | string;
  quantitySend: number;
  allowance: number;
  source: "manual" | "import" | string;
  tax: number;
  status: "COMPLETED" | "PENDING" | "CANCELLED" | string;
  generateInvoice: boolean;
  cashierName: string;
  createdAt: string;
  updatedAt: string;
  fileUploadSalesId: string | null;
  validatorId: string | null;
  saleItems: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  pluUpc: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  ean: string | null;
  pluUpc: string;
  sku: string | null;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  clientId: string;
  storeId: string;
  discountAmount: number;
  percentDiscount: number;
  hasVariants: boolean;
  packIds: string[];
  variants: any[]; 
  createdAt: string;
  updatedAt: string;
  fileUploadId: string | null;
}

export interface Customer {
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
}

export interface Business {
  id: string;
  clientId: string;
  businessName: string;
  contactNo: string;
  website: string;
  address: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomField {
  id: string;
  invoiceId: string;
  fieldName: string;
  fieldValue: string;
  createdAt: string;
  updatedAt: string;
}