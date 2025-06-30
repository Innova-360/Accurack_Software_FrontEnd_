import apiClient from "./api";
import type { Product as BaseProduct, Variant } from "../data/inventoryData";

// export interface ApiProduct {
//   id: string;
//   name: string;
//   category: string;
//   ean: string;
//   pluUpc: string;
//   supplierId: string;
//   sku: string;
//   singleItemCostPrice: number;
//   itemQuantity: number;
//   msrpPrice: number;
//   singleItemSellingPrice: number;
//   discountAmount: number;
//   percentDiscount: number;
//   clientId: string;
//   storeId: string;
//   hasVariants: boolean;
//   description?: string;
//   supplier?: string;
//   createdAt?: string;
//   packs: Array<{
//     minimumSellingQuantity: number;
//     totalPacksQuantity: number;
//     orderedPacksPrice: number;
//     discountAmount: number;
//     percentDiscount: number;
//   }>;
//   variants: Array<{
//     id?: string;
//     name: string;
//     price: number;
//     sku?: string;
//     pluUpc?: string;
//     quantity?: number;
//     msrpPrice?: number;
//     discountAmount?: number;
//     percentDiscount?: number;
//     supplierId?: string;
//     packIds?: string[];
//     packs: Array<{
//       minimumSellingQuantity: number;
//       totalPacksQuantity: number;
//       orderedPacksPrice: number;
//       percentDiscount: number;
//       discountAmount?: number;
//     }>;
//   }>;
// }

export interface ApiProduct {
  id: string;
  name: string;
  category: string;
  ean: string;
  pluUpc: string;
  supplierId: string;
  sku: string;
  singleItemCostPrice: number;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  discountAmount: number;
  percentDiscount: number;
  clientId: string;
  storeId: string;
  hasVariants: boolean;
  description?: string;
  supplier?: string;
  createdAt?: string;
  store?: {
    id: string;
    name: string;
  };
  productSuppliers?: Array<{
    supplier: {
      id: string;
      name: string;
    };
  }>;
  packs: Array<{
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    discountAmount: number;
    percentDiscount: number;
  }>;
  variants: Array<{
    id?: string;
    name: string;
    price: number;
    sku?: string;
    pluUpc?: string;
    quantity?: number;
    msrpPrice?: number;
    discountAmount?: number;
    percentDiscount?: number;
    supplierId?: string;
    packIds?: string[];
    packs: Array<{
      minimumSellingQuantity: number;
      totalPacksQuantity: number;
      orderedPacksPrice: number;
      percentDiscount: number;
      discountAmount?: number;
    }>;
  }>;
}

// Export the Product type for use in other components
export type Product = BaseProduct;
export type { Variant };

// API service
export const productAPI = {
  // Fetch all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get("/product/list");
      console.log("API Response:", response.data); // Debug log      // Handle different possible response structures
      let apiProducts: ApiProduct[];

      // First check if response.data.data exists and has products
      if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products)
      ) {
        apiProducts = response.data.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        apiProducts = response.data.data;
      } else if (Array.isArray(response.data)) {
        apiProducts = response.data;
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        apiProducts = response.data.products;
      } else if (
        response.data?.data &&
        typeof response.data.data === "object"
      ) {
        // If data is an object, look for arrays inside it
        const dataKeys = Object.keys(response.data.data);
        console.log("Data object keys:", dataKeys);

        // Try to find an array in the data object
        let foundArray = null;
        for (const key of dataKeys) {
          if (Array.isArray(response.data.data[key])) {
            foundArray = response.data.data[key];
            console.log(`Found array at key: ${key}`, foundArray);
            break;
          }
        }

        if (foundArray) {
          apiProducts = foundArray;
        } else {
          console.error("No array found in data object:", response.data.data);
          return [];
        }
      } else {
        console.error("Unexpected API response structure:", response.data);
        // Return empty array if we can't find products
        return [];
      }

      // Validate that we have an array
      if (!Array.isArray(apiProducts)) {
        console.error("API products is not an array:", apiProducts);
        return [];
      } // Transform API products to match the existing Product interface
      return apiProducts.map((apiProduct) => {
        try {
          // return {
          //   id: apiProduct.id || "",
          //   name: apiProduct.name || "Unknown Product",
          //   quantity: apiProduct.itemQuantity || 0,
          //   plu: apiProduct.pluUpc || "",
          //   sku: apiProduct.sku || "",
          //   description: apiProduct.description || "",
          //   price: `$${(apiProduct.singleItemSellingPrice || 0).toFixed(2)}`,
          //   category: apiProduct.category || "Uncategorized",
          //   itemsPerUnit: 1, // Default value, adjust if needed
          //   supplier: apiProduct.supplier || "",
          //   createdAt:
          //     apiProduct.createdAt || new Date().toISOString().split("T")[0],
          //   hasVariants: apiProduct.hasVariants || false,
          //   // variants: apiProduct.variants?.map((variant) => ({
          //   //   id: variant.id,
          //   //   name: variant.name || 'Unknown Variant',
          //   //   price: variant.price || 0,
          //   //   sku: variant.sku || '',
          //   //   msrpPrice: variant.msrpPrice,
          //   //   discountAmount: variant.discountAmount,
          //   //   percentDiscount: variant.percentDiscount,
          //   //   packs: variant.packs || [],
          //   // })) || [],

          //   variants:
          //     apiProduct.variants?.map((variant) => ({
          //       id: variant.id,
          //       name: variant.name || "Unknown Variant",
          //       price: variant.price || 0,
          //       sku: variant.sku || "",
          //       pluUpc: variant.pluUpc || "",
          //       quantity: variant.quantity || 0,
          //       msrpPrice: variant.msrpPrice,
          //       discountAmount: variant.discountAmount,
          //       percentDiscount: variant.percentDiscount,
          //       supplierId: variant.supplierId,
          //       packIds: variant.packIds || [],
          //       packs: variant.packs || [],
          //     })) || [],
          // };

          return {
            id: apiProduct.id || "",
            name: apiProduct.name || "Unknown Product",
            quantity: apiProduct.itemQuantity || 0,
            plu: apiProduct.pluUpc || "plu not found",
            sku: apiProduct.sku || "sku not found",
            description: apiProduct.description || "this is description",
            price: `$${(apiProduct.singleItemSellingPrice || 0).toFixed(2)}`,
            category: apiProduct.category || "Uncategorized",
            itemsPerUnit: 1, 
            supplier:
              apiProduct.supplier ||
              "-",
            createdAt:
              apiProduct.createdAt || new Date().toISOString().split("T")[0],
            hasVariants: apiProduct.hasVariants || false,
            variants:
              apiProduct.variants?.map((variant) => ({
                id: variant.id,
                name: variant.name || "Unknown Variant",
                price: variant.price || 0,
                sku: variant.sku || variant.id || "",
                pluUpc: variant.pluUpc || "",
                quantity: variant.quantity || 0,
                msrpPrice: variant.msrpPrice,
                discountAmount: variant.discountAmount,
                percentDiscount: variant.percentDiscount,
                supplierId: variant.supplierId,
                packIds: variant.packIds || [],
                packs: variant.packs || [],
              })) || [],
          };
        } catch (transformError) {
          console.error(
            "Error transforming product:",
            apiProduct,
            transformError
          );
          // Return a basic product structure for failed transformations
          return {
            id: apiProduct.id || Math.random().toString(),
            name: apiProduct.name || "Unknown Product",
            quantity: 0,
            plu: "",
            sku: "",
            description: "Error loading product details",
            price: "$0.00",
            category: "Uncategorized",
            itemsPerUnit: 1,
            supplier: "",
            createdAt: new Date().toISOString().split("T")[0],
            hasVariants: false,
            variants: [],
          };
        }
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Delete a product
  async deleteProduct(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/product/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Update a product
  async updateProduct(
    id: string,
    productData: any
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await apiClient.put(`/product/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },
};