// Test to debug variant field mapping issues
import type { Variation } from "../components/InventoryComponents/CreateInventory/types";

// Sample variation data that matches the form structure
const sampleVariation: Variation = {
  id: "var-1",
  attributeCombination: { Size: "Large", Color: "Red" },
  name: "Dark Roast Coffee - Large",
  category: "Beverages",
  customCategory: "",
  brandName: "Premium Brand",
  ean: "1234567890123",
  individualItemQuantity: 1,
  itemCost: 15.99,
  itemSellingCost: 27.99, // This is the selling price
  minSellingQuantity: 1,
  msrpPrice: 29.99,
  minOrderValue: 0,
  orderValueDiscount: 0,
  description: "Premium dark roast coffee",
  quantity: 100,
  price: 0, // This field exists but seems unused in forms
  plu: "PLU001",
  discount: 2.0,
  customSku: "COFFEE-001-DR-L",
  supplierId: "supplier-123",
  imageFile: null,
  imagePreview: "",
  hasPackSettings: true,
  packDiscounts: [
    {
      id: "pack-1",
      quantity: 10,
      discountType: "percentage" as const,
      discountValue: 5,
      totalPacksQuantity: 50,
      orderedPacksPrice: 18.99,
    },
  ],
  hasDiscountTiers: false,
  discountTiers: [],
};

// Function to map variation to API payload
export const mapVariationToPayload = (variant: Variation) => {
  const mapped = {
    name: variant.name || "",
    price: variant.itemSellingCost || 0, // Use itemSellingCost as the price
    sku: variant.customSku || "",
    msrpPrice: variant.msrpPrice || 0,
    discountAmount: variant.discount || 0,
    percentDiscount: variant.orderValueDiscount || 0,
    packs: (variant.packDiscounts || []).map((pack) => {
      return {
        minimumSellingQuantity: pack.quantity || 0,
        totalPacksQuantity: pack.totalPacksQuantity || 0,
        orderedPacksPrice: pack.orderedPacksPrice || 0,
        discountAmount: 0, // Calculate based on pack.discountType and pack.discountValue
        percentDiscount:
          pack.discountType === "percentage" ? pack.discountValue || 0 : 0,
      };
    }),
  };

  return mapped;
};

// Test the mapping
export const testVariantMapping = () => {
  const result = mapVariationToPayload(sampleVariation);

  return result;
};

export { sampleVariation };
