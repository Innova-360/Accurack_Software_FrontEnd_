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
      const response = await supplierAPI.getSuppliers(storeId);

      if (response.success) {
        // Filter suppliers by active status
        const activeSuppliers = response.data.suppliers.filter(
          (supplier) => supplier.status !== "inactive"
        );
        console.log(
          `useSuppliers hook: ${activeSuppliers.length} active suppliers out of ${response.data.suppliers.length} total`
        );
        setSuppliers(activeSuppliers);
      } else {
        setError(response.message || "Failed to fetch suppliers");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching suppliers"
      );
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
