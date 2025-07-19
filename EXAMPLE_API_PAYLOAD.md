# Example API Payload Structure

This document shows how the Create Inventory form now includes the requested fields in the API payload.

## Example Payload for Simple Product (No Variants)

```json
{
  "name": "Premium Coffee",
  "categoryId": "category-123",
  "description": "A premium blend of Arabica coffee beans.",
  "brandName": "Starbucks",
  "location": "Aisle 3, Shelf B",
  "ean": "1234567890123",
  "pluUpc": "98765",
  "supplierId": "supplier-456",
  "sku": "COFFEE-001",
  "singleItemCostPrice": 8.50,
  "itemQuantity": 100,
  "msrpPrice": 15.99,
  "singleItemSellingPrice": 12.99,
  "clientId": "client-789",
  "storeId": "store-abc",
  "hasVariants": false,
  "attributes": [
    {
      "name": "color",
      "value": "red"
    },
    {
      "name": "size",
      "value": "medium"
    }
  ],
  "packs": [],
  "discountAmount": 0,
  "percentDiscount": 0,
  "variants": []
}
```

## Example Payload for Product with Variants

```json
{
  "name": "T-Shirt Collection",
  "categoryId": "clothing-123",
  "description": "Premium cotton t-shirts available in multiple colors and sizes",
  "brandName": "Nike",
  "location": "Section B, Rack 2",
  "ean": "",
  "pluUpc": "",
  "supplierId": "",
  "sku": "",
  "singleItemCostPrice": 0,
  "itemQuantity": 0,
  "msrpPrice": 0,
  "singleItemSellingPrice": 0,
  "clientId": "client-789",
  "storeId": "store-abc",
  "hasVariants": true,
  "attributes": [],
  "packs": [],
  "discountAmount": 0,
  "percentDiscount": 0,
  "variants": [
    {
      "name": "Red Medium T-Shirt",
      "categoryId": "clothing-123",
      "description": "Premium cotton t-shirt in red color",
      "brandName": "Nike",
      "location": "Section B, Rack 2",
      "price": 25.99,
      "costPrice": 10.00,
      "sku": "TSHIRT-RED-M",
      "ean": "1234567890001",
      "pluUpc": "RED-M-001",
      "quantity": 50,
      "supplierId": "supplier-456",
      "msrpPrice": 29.99,
      "discountAmount": 0,
      "percentDiscount": 0,
      "attributes": {
        "color": "red",
        "size": "medium"
      },
      "packs": []
    },
    {
      "name": "Blue Large T-Shirt",
      "categoryId": "clothing-123",
      "description": "Premium cotton t-shirt in blue color",
      "brandName": "Nike",
      "location": "Section B, Rack 2",
      "price": 25.99,
      "costPrice": 10.00,
      "sku": "TSHIRT-BLUE-L",
      "ean": "1234567890002",
      "pluUpc": "BLUE-L-001",
      "quantity": 30,
      "supplierId": "supplier-456",
      "msrpPrice": 29.99,
      "discountAmount": 0,
      "percentDiscount": 0,
      "attributes": {
        "color": "blue",
        "size": "large"
      },
      "packs": []
    }
  ]
}
```

## New Fields Added to the Form

1. **Description**: Text area for product description
2. **Brand Name**: Input field for brand name
3. **Location**: Input field for product location (e.g., "Aisle 3, Shelf B")
4. **Attributes**: Array of name-value pairs for product attributes

All these fields are now included in both the main product payload and variant payloads where applicable.
