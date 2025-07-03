import { useState, useEffect } from "react";
import { productAPI, type Product } from "../services/productAPI";
import { products as mockProducts } from "../data/inventoryData";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productAPI.getProducts();

      // Use API data regardless of whether it's empty or not
      setProducts(fetchedProducts);

      if (fetchedProducts.length === 0) {
        console.warn("No products returned from API");
      } else {
        console.log(
          `Successfully loaded ${fetchedProducts.length} products from API`
        );
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");

      // Only use mock data on actual API errors, not empty responses
      console.warn("Using mock data due to API error");
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
