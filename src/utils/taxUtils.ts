import type { Tax, TaxCalculationResult } from "../types/tax";

/**
 * Calculate tax amount based on tax configuration
 */
export const calculateTaxAmount = (tax: Tax, basePrice: number): number => {
  if (tax.type === "percentage") {
    return (basePrice * tax.rate) / 100;
  } else {
    return tax.rate;
  }
};

/**
 * Format tax rate for display
 */
export const formatTaxRate = (
  rate: number,
  type: "percentage" | "fixed"
): string => {
  if (type === "percentage") {
    return `${rate}%`;
  } else {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(rate);
  }
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Calculate total tax from multiple tax results
 */
export const calculateTotalTax = (
  taxResults: TaxCalculationResult[]
): number => {
  return taxResults
    .filter((result) => result.applied)
    .reduce((total, result) => total + result.amount, 0);
};

/**
 * Check if a tax rule condition is met
 */
export const evaluateRuleCondition = (
  _conditionField: string, // Reserved for future use
  operator: string,
  ruleValue: any,
  contextValue: any
): boolean => {
  switch (operator) {
    case "==":
      return contextValue === ruleValue;
    case "!=":
      return contextValue !== ruleValue;
    case ">=":
      return Number(contextValue) >= Number(ruleValue);
    case "<=":
      return Number(contextValue) <= Number(ruleValue);
    case ">":
      return Number(contextValue) > Number(ruleValue);
    case "<":
      return Number(contextValue) < Number(ruleValue);
    case "in":
      return (
        Array.isArray(ruleValue) && ruleValue.includes(String(contextValue))
      );
    case "not_in":
      return (
        Array.isArray(ruleValue) && !ruleValue.includes(String(contextValue))
      );
    default:
      return false;
  }
};

/**
 * Validate tax form data
 */
export const validateTaxFormData = (
  formData: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = "Tax name is required";
  }

  // Rate validation
  if (!formData.rate?.trim()) {
    errors.rate = "Tax rate is required";
  } else {
    const rate = parseFloat(formData.rate);
    if (isNaN(rate) || rate < 0) {
      errors.rate = "Tax rate must be a valid positive number";
    }
    if (formData.type === "percentage" && rate > 100) {
      errors.rate = "Percentage rate cannot exceed 100%";
    }
  }

  // Type validation
  if (!["percentage", "fixed"].includes(formData.type)) {
    errors.type = "Tax type must be either percentage or fixed";
  }

  // Status validation
  if (!["active", "inactive"].includes(formData.status)) {
    errors.status = "Tax status must be either active or inactive";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generate a unique ID for tax rules and assignments
 */
export const generateTaxId = (prefix: string = "tax"): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sort taxes by various criteria
 */
export const sortTaxes = (
  taxes: Tax[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Tax[] => {
  return [...taxes].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Tax];
    let bValue: any = b[sortBy as keyof Tax];

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle date comparison
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === "desc" ? -comparison : comparison;
  });
};

/**
 * Filter taxes based on search criteria
 */
export const filterTaxes = (
  taxes: Tax[],
  filters: {
    search?: string;
    type?: "all" | "percentage" | "fixed";
    status?: "all" | "active" | "inactive";
  }
): Tax[] => {
  let filtered = [...taxes];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (tax) =>
        tax.name.toLowerCase().includes(searchLower) ||
        tax.description?.toLowerCase().includes(searchLower)
    );
  }

  // Type filter
  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((tax) => tax.type === filters.type);
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((tax) => tax.status === filters.status);
  }

  return filtered;
};

/**
 * Get tax statistics
 */
export const getTaxStatistics = (taxes: Tax[]) => {
  const total = taxes.length;
  const active = taxes.filter((tax) => tax.status === "active").length;
  const inactive = taxes.filter((tax) => tax.status === "inactive").length;
  const percentage = taxes.filter((tax) => tax.type === "percentage").length;
  const fixed = taxes.filter((tax) => tax.type === "fixed").length;
  const withRules = taxes.filter((tax) => tax.rules.length > 0).length;
  const withAssignments = taxes.filter(
    (tax) => tax.assignments.length > 0
  ).length;

  return {
    total,
    active,
    inactive,
    percentage,
    fixed,
    withRules,
    withAssignments,
    averageRate:
      taxes.length > 0
        ? taxes.reduce((sum, tax) => sum + tax.rate, 0) / taxes.length
        : 0,
  };
};

/**
 * Export tax data to CSV
 */
export const exportTaxesToCSV = (taxes: Tax[]): string => {
  const headers = [
    "Name",
    "Rate",
    "Type",
    "Status",
    "Description",
    "Product Type",
    "Rules Count",
    "Assignments Count",
    "Created At",
    "Updated At",
  ];

  const rows = taxes.map((tax) => [
    tax.name,
    tax.rate.toString(),
    tax.type,
    tax.status,
    tax.description || "",
    tax.productType || "",
    tax.rules.length.toString(),
    tax.assignments.length.toString(),
    tax.createdAt,
    tax.updatedAt,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (
  csvContent: string,
  filename: string = "taxes.csv"
): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
