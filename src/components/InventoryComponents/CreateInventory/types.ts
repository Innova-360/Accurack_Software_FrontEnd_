export interface PackDiscount {
  id: string;
  quantity: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
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
  attributeCombination: Record<string, string>;
  quantity: number;
  price: number;
  plu: string;
  discount: number;
  vendor: string;
  customSku: string;
  description: string;
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
  price: string;
  vendor: string;
  customSku: string;
  ean: string;
  pluUpc: string;
  itemCost: string;
  itemSellingCost: string;
  minSellingQuantity: string;
  minOrderValue: string;
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
}
