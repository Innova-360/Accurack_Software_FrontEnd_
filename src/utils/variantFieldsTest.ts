// Test utility to verify variant field mapping
import type { Variant } from "../data/inventoryData";

export const testVariantFields = () => {
  const testVariant: Variant = {
    id: "test-variant-1",
    name: "Dark Roast",
    price: 27.99,
    sku: "COFFEE-001-DR",
    msrpPrice: 29.99,
    discountAmount: 2.0,
    percentDiscount: 10,
    packs: [
      {
        minimumSellingQuantity: 10,
        totalPacksQuantity: 50,
        orderedPacksPrice: 18.99,
        percentDiscount: 5,
        discountAmount: 2.5,
      },
    ],
  };

  testVariant.packs.forEach((pack, index) => {});

  return testVariant;
};

// Verify that all required fields from the API example are present
export const validateVariantStructure = (variant: Variant): boolean => {
  const requiredFields = ["name", "price", "sku"];
  const optionalFields = [
    "id",
    "msrpPrice",
    "discountAmount",
    "percentDiscount",
  ];
  const packFields = [
    "minimumSellingQuantity",
    "totalPacksQuantity",
    "orderedPacksPrice",
    "percentDiscount",
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in variant)) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }

  // Check optional fields (should be defined in interface)
  for (const field of optionalFields) {
    if (field in variant) {
    }
  }

  // Check pack structure
  if (variant.packs && variant.packs.length > 0) {
    variant.packs.forEach((pack, index) => {
      for (const field of packFields) {
        if (!(field in pack)) {
          console.error(`❌ Missing pack field in pack ${index}: ${field}`);
          return false;
        }
      }
    });
  }

  return true;
};
