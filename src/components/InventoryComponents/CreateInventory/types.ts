export interface PackDiscount {
  id: string;
  quantity: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  totalPacksQuantity?: number; // Added for API payload compatibility
  orderedPacksPrice?: number; // Added for API payload compatibility
}

export interface DiscountTier {
  id: string;
  minQuantity: number;
  discountValue: number;
  discountType: "percentage" | "fixed";
}

export interface AttributeOption {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  options: AttributeOption[];
}

export interface Variation {
  id: string;
  attributeCombination: { [attributeName: string]: string };
  name: string;
  category: string;
  customCategory?: string;
  brandName?: string;
  ean: string;
  individualItemQuantity: number;
  itemCost: number;
  itemSellingCost: number;
  minSellingQuantity: number;
  msrpPrice: number;
  minOrderValue: number;
  orderValueDiscount: number;
  description: string;
  quantity: number;
  price: number;
  plu: string;
  discount: number;
  customSku: string;
  supplierId: string;
  imageFile: File | null;
  imagePreview: string;
  hasPackSettings: boolean;
  packDiscounts: PackDiscount[];
  hasDiscountTiers: boolean;
  discountTiers: DiscountTier[];
}

export interface ProductFormData {
  productName: string;
  category: string;
  customCategory?: string;
  brandName?: string;
  price: string;
  customSku: string;
  ean: string;
  pluUpc: string;
  individualItemQuantity: string;
  itemCost: string;
  itemSellingCost: string;
  minSellingQuantity: string;
  minOrderValue: string;
  msrpPrice: string;
  orderValueDiscountType: "percentage" | "fixed" | "";
  orderValueDiscountValue: string;
  quantity: string;
  description: string;
  imageFile: File | null;
  imagePreview: string;
  hasPackSettings: boolean;
  packDiscounts: PackDiscount[];
  hasDiscountSettings: boolean;
  discountTiers: DiscountTier[];
  hasAttributes: boolean;
  attributes: Attribute[];
  variations: Variation[];
  supplierId: string; // Added for API payload compatibility
}
