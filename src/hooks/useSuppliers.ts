import { useState, useEffect } from "react";
import { supplierAPI, type Supplier } from "../services/supplierAPI";

interface UseSupplierReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSuppliers = (storeId: string): UseSupplierReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 useSuppliers: Fetching suppliers for storeId:", storeId);
      const response = await supplierAPI.getSuppliers(storeId);
      console.log("📦 useSuppliers: Response received:", response);      if (response && response.success) {
        // Safely access suppliers array with fallback and validation
        const suppliersArray = Array.isArray(response.data?.data?.suppliers)
          ? response.data.data.suppliers
          : [];
        console.log(
          "✅ useSuppliers: Suppliers fetched successfully:",
          suppliersArray.length,
          "suppliers:",
          suppliersArray
        );
        setSuppliers(suppliersArray);
      } else {
        console.error(
          "❌ useSuppliers: Failed to fetch suppliers:",
          response?.message || "Unknown error"
        );
        setError(response?.message || "Failed to fetch suppliers");
        setSuppliers([]); // Reset suppliers on error
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching suppliers";
      console.error("💥 useSuppliers: Error fetching suppliers:", errorMessage);
      console.error("💥 useSuppliers: Full error object:", err);
      setError(errorMessage);
      setSuppliers([]); // Reset suppliers on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
  };
};

export default useSuppliers;
