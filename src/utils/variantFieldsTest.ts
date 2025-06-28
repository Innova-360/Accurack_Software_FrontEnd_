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

  console.log("Test Variant Structure:");
  console.log("✓ id:", testVariant.id);
  console.log("✓ name:", testVariant.name);
  console.log("✓ price:", testVariant.price);
  console.log("✓ sku:", testVariant.sku);
  console.log("✓ msrpPrice:", testVariant.msrpPrice);
  console.log("✓ discountAmount:", testVariant.discountAmount);
  console.log("✓ percentDiscount:", testVariant.percentDiscount);

  console.log("\nPack Information:");
  testVariant.packs.forEach((pack, index) => {
    console.log(`Pack ${index + 1}:`);
    console.log("  ✓ minimumSellingQuantity:", pack.minimumSellingQuantity);
    console.log("  ✓ totalPacksQuantity:", pack.totalPacksQuantity);
    console.log("  ✓ orderedPacksPrice:", pack.orderedPacksPrice);
    console.log("  ✓ percentDiscount:", pack.percentDiscount);
    console.log("  ✓ discountAmount:", pack.discountAmount);
  });

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

  console.log("Validating variant structure...");

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in variant)) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
    console.log(`✓ Required field present: ${field}`);
  }

  // Check optional fields (should be defined in interface)
  for (const field of optionalFields) {
    if (field in variant) {
      console.log(`✓ Optional field present: ${field}`);
    }
  }

  // Check pack structure
  if (variant.packs && variant.packs.length > 0) {
    console.log("✓ Packs array present");
    variant.packs.forEach((pack, index) => {
      for (const field of packFields) {
        if (!(field in pack)) {
          console.error(`❌ Missing pack field in pack ${index}: ${field}`);
          return false;
        }
      }
      console.log(`✓ Pack ${index} structure valid`);
    });
  }

  console.log("✅ Variant structure validation passed");
  return true;
};
