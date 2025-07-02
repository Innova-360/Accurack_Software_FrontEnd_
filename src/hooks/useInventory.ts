import { useMemo } from "react";
import type { Product } from "../data/inventoryData";

export const useInventoryStats = (products: Product[]) => {
  return useMemo(() => {
    const totalProducts = products.length;
    const totalItems = products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    const totalValue = products.reduce((sum, product) => {
      // Remove $ sign and convert to number for calculation
      const price = parseFloat(product.price.replace("$", ""));
      return sum + price * product.quantity;
    }, 0);

    return {
      totalProducts,
      totalItems,
      totalValue: totalValue.toFixed(2),
    };
  }, [products]);
};

export const useFilteredProducts = (
  products: Product[],
  searchTerm: string,
  sortConfig: { key: string; direction: "asc" | "desc" } | null
) => {
  return useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((product) => {
        const categoryString =
          typeof product.category === "string"
            ? product.category
            : (product.category as any)?.name || "";

        return (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||


      //     product.plu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //     categoryString.toLowerCase().includes(searchTerm.toLowerCase())
      //   );
      // });
      
          product.plu.toLowerCase().includes(searchTerm.toLowerCase()) 
          // product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [products, searchTerm, sortConfig]);
};

export const useGroupedProducts = (
  filteredProducts: Product[],
  groupBy: string
) => {
  return useMemo(() => {
    if (groupBy === "category") {
      const grouped: { [key: string]: Product[] } = {};
      filteredProducts.forEach((product) => {
        const categoryKey =
          typeof product.category === "string"
            ? product.category
            : (product.category as any)?.name || "Uncategorized";

        if (!grouped[categoryKey]) {
          grouped[categoryKey] = [];
        }
        grouped[categoryKey].push(product);
      });
      return grouped;
    }
    return null;
  }, [filteredProducts, groupBy]);
};

export const useLowStockProducts = (products: Product[]) => {
  return useMemo(() => {
    return products.filter((product) => product.quantity < 10);
  }, [products]);
};
