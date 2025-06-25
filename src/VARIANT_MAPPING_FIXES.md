# Variant Fields Mapping Fix - Complete Solution

## Issues Fixed

### 1. Wrong Field Names in Payload Mapping

**Problem**: The variant payload mapping was using incorrect field names.

**Before (Incorrect)**:

```javascript
// Wrong field references
sku: variant.sku || variant.customSku || "";
price: variant.price;
packs: variant.packs || variant.packDiscounts;
```

**After (Correct)**:

```javascript
// Correct field references from Variation interface
sku: variant.customSku || "";
price: variant.itemSellingCost || 0; // itemSellingCost is the selling price
packs: variant.packDiscounts || []; // packDiscounts is the correct field name
```

### 2. Field Mapping Reference

Based on the `Variation` interface in `types.ts`:

| API Field         | Form Field (Variation interface) | Purpose               |
| ----------------- | -------------------------------- | --------------------- |
| `name`            | `name`                           | Variant name          |
| `price`           | `itemSellingCost`                | Selling price         |
| `sku`             | `customSku`                      | SKU identifier        |
| `msrpPrice`       | `msrpPrice`                      | MSRP price            |
| `discountAmount`  | `discount`                       | Fixed discount amount |
| `percentDiscount` | `orderValueDiscount`             | Percentage discount   |
| `packs`           | `packDiscounts`                  | Pack pricing array    |

### 3. Pack Field Mapping

| API Pack Field           | Form Pack Field                            | Purpose              |
| ------------------------ | ------------------------------------------ | -------------------- |
| `minimumSellingQuantity` | `quantity`                                 | Min quantity         |
| `totalPacksQuantity`     | `totalPacksQuantity`                       | Total packs          |
| `orderedPacksPrice`      | `orderedPacksPrice`                        | Pack price           |
| `percentDiscount`        | `discountValue` (when type=percentage)     | Pack discount %      |
| `discountAmount`         | Calculated from discountType/discountValue | Pack discount amount |

## Updated Payload Generation

```typescript
if (hasVariants) {
  basePayload.variants = (formData.variations || []).map(
    (variant: any, index: number) => {
      // Use correct field names from Variation interface
      const price = variant.itemSellingCost || 0; // itemSellingCost = selling price
      const msrpPrice = variant.msrpPrice || 0;

      // Handle variant-level discounts
      const variantDiscountAmount = variant.discount || 0;
      const variantPercentDiscount = variant.orderValueDiscount || 0;

      return {
        name: variant.name || "",
        price, // ✅ From itemSellingCost
        sku: variant.customSku || "", // ✅ From customSku
        msrpPrice, // ✅ From msrpPrice
        discountAmount: variantDiscountAmount, // ✅ From discount
        percentDiscount: variantPercentDiscount, // ✅ From orderValueDiscount
        packs: (variant.packDiscounts || []).map((pack: any) => {
          // ✅ From packDiscounts
          const packPrice = pack.orderedPacksPrice || 0;
          const { discountAmount: packDiscountAmount } = calculateDiscounts(
            pack.discountType,
            pack.discountValue,
            packPrice
          );
          return {
            minimumSellingQuantity: pack.quantity || 0, // ✅ From quantity
            totalPacksQuantity: pack.totalPacksQuantity || 0, // ✅ Direct mapping
            orderedPacksPrice: packPrice, // ✅ From orderedPacksPrice
            discountAmount: packDiscountAmount, // ✅ Calculated
            percentDiscount:
              pack.discountType === "percentage" ? pack.discountValue || 0 : 0, // ✅ From discountValue
          };
        }),
      };
    }
  );
}
```

## Debug Logging Added

Added comprehensive console logging to track:

1. Raw variation data from form
2. Field mapping for each variant
3. Pack processing details
4. Final payload structure

## Expected API Payload Structure

```json
{
  "name": "Premium Coffee Beans",
  "variants": [
    {
      "name": "Dark Roast",
      "price": 27.99,
      "sku": "COFFEE-001-DR",
      "msrpPrice": 29.99,
      "discountAmount": 2.0,
      "percentDiscount": 10,
      "packs": [
        {
          "minimumSellingQuantity": 10,
          "totalPacksQuantity": 50,
          "orderedPacksPrice": 18.99,
          "discountAmount": 2.5,
          "percentDiscount": 5
        }
      ]
    }
  ]
}
```

## Verification Steps

1. ✅ Check console logs when creating variants
2. ✅ Verify all form fields are captured correctly
3. ✅ Confirm pack information is included
4. ✅ Validate API payload structure matches expected format

The variant fields should now properly include:

- ✅ Variant name, price, SKU
- ✅ MSRP and discount information
- ✅ Complete pack details with pricing
- ✅ All discount calculations
