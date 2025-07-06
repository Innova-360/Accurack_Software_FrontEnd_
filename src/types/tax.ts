export interface Tax {
  id: string;
  name: string;
  rate: number;
  type: "percentage" | "fixed";
  status: "active" | "inactive";
  description?: string;
  productType?: "luxury" | "digital" | "perishable" | "hazardous" | "";
  createdAt: string;
  updatedAt: string;
  assignments: TaxAssignment[];
  rules: TaxRule[];
}

export interface TaxAssignment {
  id: string;
  taxId: string;
  targetType: "product" | "category" | "customer" | "store" | "supplier";
  targetId: string;
  targetName: string;
}

export interface TaxRule {
  id: string;
  taxId: string;
  conditionField:
    | "region"
    | "total_amount"
    | "customer_type"
    | "product_category"
    | "store_location"
    | "quantity";
  operator: "==" | "!=" | ">=" | "<=" | "in" | "not_in" | ">" | "<";
  value: string | number | string[];
  type: "string" | "number" | "array";
}

export interface TaxFormData {
  name: string;
  rate: string;
  type: "percentage" | "fixed";
  status: "active" | "inactive";
  description: string;
  productType: "luxury" | "digital" | "perishable" | "hazardous" | "";
  assignments: TaxAssignment[];
  rules: TaxRule[];
}

export interface TaxCalculationResult {
  taxName: string;
  taxType: "percentage" | "fixed";
  rate: number;
  amount: number;
  applied: boolean;
}

export interface TaxPreview {
  basePrice: number;
  productName: string;
  appliedTaxes: TaxCalculationResult[];
  totalTax: number;
  finalPrice: number;
}

export interface TaxListFilters {
  search: string;
  type: "all" | "percentage" | "fixed";
  status: "all" | "active" | "inactive";
  sortBy: "name" | "rate" | "type" | "status" | "updatedAt";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface EntityOption {
  id: string;
  name: string;
  type?: string;
}

export interface RuleFieldOption {
  value: string;
  label: string;
  type: "string" | "number" | "array";
}

export interface OperatorOption {
  value: string;
  label: string;
  supportedTypes: ("string" | "number" | "array")[];
}
