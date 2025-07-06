import type {
  Tax,
  TaxListFilters,
  TaxFormData,
  TaxCalculationResult,
} from "../types/tax";

// Mock data for taxes
const mockTaxes: Tax[] = [
  {
    id: "1",
    name: "VAT",
    rate: 7.5,
    type: "percentage",
    status: "active",
    description: "Value Added Tax",
    productType: "",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-06-20T14:20:00Z",
    assignments: [
      {
        id: "a1",
        taxId: "1",
        targetType: "category",
        targetId: "electronics",
        targetName: "Electronics",
      },
    ],
    rules: [
      {
        id: "r1",
        taxId: "1",
        conditionField: "region",
        operator: "==",
        value: "US",
        type: "string",
      },
    ],
  },
  {
    id: "2",
    name: "Luxury Tax",
    rate: 50,
    type: "fixed",
    status: "active",
    description: "Fixed luxury tax for high-end products",
    productType: "luxury",
    createdAt: "2024-02-10T09:15:00Z",
    updatedAt: "2024-06-18T11:45:00Z",
    assignments: [
      {
        id: "a2",
        taxId: "2",
        targetType: "product",
        targetId: "iphone15",
        targetName: "iPhone 15 Pro",
      },
    ],
    rules: [
      {
        id: "r2",
        taxId: "2",
        conditionField: "total_amount",
        operator: ">=",
        value: 1000,
        type: "number",
      },
    ],
  },
  {
    id: "3",
    name: "Digital Services Tax",
    rate: 3,
    type: "percentage",
    status: "active",
    description: "Tax on digital products and services",
    productType: "digital",
    createdAt: "2024-03-05T16:20:00Z",
    updatedAt: "2024-06-15T08:30:00Z",
    assignments: [],
    rules: [],
  },
  {
    id: "4",
    name: "Environmental Fee",
    rate: 25,
    type: "fixed",
    status: "inactive",
    description: "Environmental disposal fee",
    productType: "hazardous",
    createdAt: "2024-04-12T12:00:00Z",
    updatedAt: "2024-05-20T15:10:00Z",
    assignments: [],
    rules: [],
  },
];

// Tax service API functions
export const taxAPI = {
  // Get all taxes with filtering and pagination
  getTaxes: async (
    filters: TaxListFilters
  ): Promise<{ taxes: Tax[]; total: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

    let filteredTaxes = [...mockTaxes];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTaxes = filteredTaxes.filter(
        (tax) =>
          tax.name.toLowerCase().includes(searchLower) ||
          tax.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type !== "all") {
      filteredTaxes = filteredTaxes.filter((tax) => tax.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filteredTaxes = filteredTaxes.filter(
        (tax) => tax.status === filters.status
      );
    }
    // Apply sorting
    filteredTaxes.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    // Apply pagination
    const startIndex = (filters.page - 1) * filters.limit;
    const paginatedTaxes = filteredTaxes.slice(
      startIndex,
      startIndex + filters.limit
    );

    return {
      taxes: paginatedTaxes,
      total: filteredTaxes.length,
    };
  },

  // Get single tax by ID
  getTax: async (id: string): Promise<Tax | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTaxes.find((tax) => tax.id === id) || null;
  },

  // Create new tax
  createTax: async (taxData: TaxFormData): Promise<Tax> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newTax: Tax = {
      id: `tax_${Date.now()}`,
      name: taxData.name,
      rate: parseFloat(taxData.rate),
      type: taxData.type,
      status: taxData.status,
      description: taxData.description,
      productType: taxData.productType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignments: taxData.assignments,
      rules: taxData.rules,
    };

    mockTaxes.push(newTax);
    return newTax;
  },

  // Update existing tax
  updateTax: async (id: string, taxData: TaxFormData): Promise<Tax> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const index = mockTaxes.findIndex((tax) => tax.id === id);
    if (index === -1) {
      throw new Error("Tax not found");
    }

    const updatedTax: Tax = {
      ...mockTaxes[index],
      name: taxData.name,
      rate: parseFloat(taxData.rate),
      type: taxData.type,
      status: taxData.status,
      description: taxData.description,
      productType: taxData.productType,
      updatedAt: new Date().toISOString(),
      assignments: taxData.assignments,
      rules: taxData.rules,
    };

    mockTaxes[index] = updatedTax;
    return updatedTax;
  },

  // Delete tax
  deleteTax: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockTaxes.findIndex((tax) => tax.id === id);
    if (index === -1) {
      throw new Error("Tax not found");
    }

    mockTaxes.splice(index, 1);
  },
  // Calculate taxes for a given context
  calculateTaxes: async (context: {
    basePrice: number;
    productId?: string;
    categoryId?: string;
    customerId?: string;
    storeId?: string;
    supplierId?: string;
    region?: string;
    customerType?: string;
    quantity?: number;
    productCategory?: string;
    storeLocation?: string;
    totalAmount?: number;
  }): Promise<TaxCalculationResult[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const applicableTaxes = mockTaxes.filter((tax) => tax.status === "active");
    const results: TaxCalculationResult[] = [];

    for (const tax of applicableTaxes) {
      let applies = true;

      // Check rules
      for (const rule of tax.rules) {
        const contextValue =
          context[rule.conditionField as keyof typeof context];

        switch (rule.operator) {
          case "==":
            applies = applies && contextValue === rule.value;
            break;
          case "!=":
            applies = applies && contextValue !== rule.value;
            break;
          case ">=":
            applies = applies && Number(contextValue) >= Number(rule.value);
            break;
          case "<=":
            applies = applies && Number(contextValue) <= Number(rule.value);
            break;
          case ">":
            applies = applies && Number(contextValue) > Number(rule.value);
            break;
          case "<":
            applies = applies && Number(contextValue) < Number(rule.value);
            break;
          case "in":
            applies =
              applies &&
              Array.isArray(rule.value) &&
              rule.value.includes(String(contextValue));
            break;
          case "not_in":
            applies =
              applies &&
              Array.isArray(rule.value) &&
              !rule.value.includes(String(contextValue));
            break;
        }

        if (!applies) break;
      }

      // Check assignments
      if (applies && tax.assignments.length > 0) {
        applies = tax.assignments.some((assignment) => {
          switch (assignment.targetType) {
            case "product":
              return assignment.targetId === context.productId;
            case "category":
              return assignment.targetId === context.categoryId;
            case "customer":
              return assignment.targetId === context.customerId;
            case "store":
              return assignment.targetId === context.storeId;
            case "supplier":
              return assignment.targetId === context.supplierId;
            default:
              return false;
          }
        });
      }

      const amount =
        tax.type === "percentage"
          ? (context.basePrice * tax.rate) / 100
          : tax.rate;

      results.push({
        taxName: tax.name,
        taxType: tax.type,
        rate: tax.rate,
        amount,
        applied: applies,
      });
    }

    return results;
  },
};
