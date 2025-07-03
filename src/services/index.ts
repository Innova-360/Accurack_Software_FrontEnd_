// Export the main API client
export { default as apiClient } from "./api";
export { default } from "./api";

// Export supplier API
export {
  supplierAPI,
  type Supplier,
  type SupplierResponse,
} from "./supplierAPI";

// Export customer API
export {
  customerAPI,
} from "./customerAPI";

// Export customer types from their source
export type {
  Customer,
  CustomerFormData,
} from "../types/customer";
