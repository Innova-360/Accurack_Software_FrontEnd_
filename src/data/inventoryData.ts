export interface Variant {
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
  color?: string;
  origin?: string;
  packs?: Array<{
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    percentDiscount: number;
    discountAmount?: number;
  }>;
}

export interface Product {
  id?: string;
  name: string;
  quantity: number;
  itemQuantity?: number; // Alternative quantity field used in the component
  plu: string;
  pluUpc?: string; // Add pluUpc field
  sku: string;
  ean?: string; // Add EAN field
  description: string;
  price: string;
  category: string | { name: string; id?: string; code?: string }; // Allow both string and object with code
  itemsPerUnit: number;
  supplier:
    | string
    | {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string; // Add address field
        status?: string; // Add status field
      };
  supplierId?: string; // Add supplier ID field
  clientId?: string; // Add client ID field
  storeId?: string; // Add store ID field
  categoryId?: string; // Add category ID field
  createdAt: string;
  updatedAt?: string; // Add updated at field
  hasVariants?: boolean;
  variants?: Variant[];
  // Additional fields for detailed product view
  costPrice?: number;
  singleItemCostPrice?: number; // Add cost price field used in component
  singleItemSellingPrice?: number; // Add selling price field used in component
  msrpPrice?: number;
  profitAmount?: number;
  profitMargin?: number;
  percentDiscount?: number; // Add discount percentage field
  discountAmount?: number; // Add discount amount field
  store?: {
    id: string;
    name: string;
  };
  sales?: any[];
  purchaseOrders?: Array<{
    id: string;
    quantity: number;
    total?: number;
    status: string;
    createdAt?: string; // Add created at field
  }>;
  productSuppliers?: Array<{
    id: string;
    productId: string;
    supplierId: string;
    costPrice: number;
    categoryId: string;
    state: string;
    createdAt: string;
    updatedAt: string;
    supplier: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      status: string;
      storeId: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  packs?: Array<{
    id?: string;
    productId?: string;
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    discountAmount?: number;
    percentDiscount: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
  packIds?: string[]; // Add packIds field
}

export const products: Product[] = [
  {
    name: "Premium Coffee Beans",
    quantity: 150,
    plu: "PLU001",
    sku: "SKU-CF-001",
    description: "High-quality arabica coffee beans sourced from...",
    price: "$24.99",
    category: "BEVERAGES",
    itemsPerUnit: 1,
    supplier: "Coffee Co.",
    createdAt: "2024-01-15",
    hasVariants: true,
    variants: [
      {
        id: "var-cf-001-1",
        name: "Dark Roast",
        price: 24.99,
        sku: "SKU-CF-001-DARK",
        msrpPrice: 29.99,
        discountAmount: 0,
        percentDiscount: 0,
        packs: [],
      },
      {
        id: "var-cf-001-2",
        name: "Medium Roast",
        price: 22.99,
        sku: "SKU-CF-001-MED",
        msrpPrice: 27.99,
        discountAmount: 0,
        percentDiscount: 0,
        packs: [],
      },
      {
        id: "var-cf-001-3",
        name: "Light Roast",
        price: 21.99,
        sku: "SKU-CF-001-LIGHT",
        msrpPrice: 26.99,
        discountAmount: 0,
        percentDiscount: 0,
        packs: [],
      },
    ],
  },
  {
    name: "Organic Milk",
    quantity: 75,
    plu: "PLU002",
    sku: "SKU-ML-002",
    description: "Fresh organic whole milk, 1 gallon",
    price: "$5.49",
    category: "DAIRY",
    itemsPerUnit: 1,
    supplier: "Dairy Farm Inc.",
    createdAt: "2024-01-10",
  },
  {
    name: "Artisan Bread",
    quantity: 25,
    plu: "PLU003",
    sku: "SKU-BR-003",
    description: "Freshly baked sourdough bread",
    price: "$7.99",
    category: "BAKERY",
    itemsPerUnit: 1,
    supplier: "Local Bakery",
    createdAt: "2024-01-20",
    hasVariants: true,
    variants: [
      {
        id: "var-br-003-1",
        name: "Whole Wheat",
        price: 8.99,
        sku: "SKU-BR-003-WW",
        msrpPrice: 10.99,
        discountAmount: 0,
        percentDiscount: 0,
        packs: [],
      },
      {
        id: "var-br-003-2",
        name: "Sourdough",
        price: 7.99,
        sku: "SKU-BR-003-SD",
        msrpPrice: 9.99,
        discountAmount: 0,
        percentDiscount: 0,
        packs: [],
      },
    ],
  },
  {
    name: "Seasonal Fruits Mix",
    quantity: 200,
    plu: "PLU004",
    sku: "SKU-FR-004",
    description: "Mixed seasonal fruits including apples, oranges...",
    price: "$12.99",
    category: "PRODUCE",
    itemsPerUnit: 5,
    supplier: "Fresh Produce Ltd.",
    createdAt: "2024-01-08",
  },
  {
    name: "Gourmet Cheese",
    quantity: 30,
    plu: "PLU005",
    sku: "SKU-CH-005",
    description: "Aged cheddar cheese, premium quality",
    price: "$18.99",
    category: "DAIRY",
    itemsPerUnit: 1,
    supplier: "Artisan Cheese Co.",
    createdAt: "2024-01-12",
  },
  {
    name: "Fresh Pasta",
    quantity: 80,
    plu: "PLU006",
    sku: "SKU-PA-006",
    description: "Homemade fresh pasta, various shapes available",
    price: "$9.99",
    category: "PASTA",
    itemsPerUnit: 1,
    supplier: "Italian Foods",
    createdAt: "2024-01-18",
  },
  {
    name: "Organic Spinach",
    quantity: 120,
    plu: "PLU007",
    sku: "SKU-SP-007",
    description: "Fresh organic spinach leaves, 5oz bag",
    price: "$3.49",
    category: "PRODUCE",
    itemsPerUnit: 1,
    supplier: "Green Farms",
    createdAt: "2024-01-14",
  },
  {
    name: "Premium Olive Oil",
    quantity: 45,
    plu: "PLU008",
    sku: "SKU-OL-008",
    description: "Extra virgin olive oil, 500ml bottle",
    price: "$15.99",
    category: "CONDIMENTS",
    itemsPerUnit: 1,
    supplier: "Mediterranean Imports",
    createdAt: "2024-01-16",
  },
  {
    name: "Vanilla Ice Cream",
    quantity: 60,
    plu: "PLU009",
    sku: "SKU-IC-009",
    description: "Premium vanilla ice cream, 1 pint",
    price: "$6.99",
    category: "FROZEN",
    itemsPerUnit: 1,
    supplier: "Ice Cream Factory",
    createdAt: "2024-01-11",
  },
  {
    name: "Whole Grain Cereal",
    quantity: 90,
    plu: "PLU010",
    sku: "SKU-CE-010",
    description: "Healthy whole grain breakfast cereal",
    price: "$8.49",
    category: "BREAKFAST",
    itemsPerUnit: 1,
    supplier: "Health Foods Corp.",
    createdAt: "2024-01-13",
  },
  {
    name: "Wild Salmon Fillet",
    quantity: 7,
    plu: "PLU011",
    sku: "SKU-SA-011",
    description: "Fresh wild-caught salmon fillet, per lb",
    price: "$22.99",
    category: "SEAFOOD",
    itemsPerUnit: 1,
    supplier: "Ocean Fresh",
    createdAt: "2024-01-17",
  },
  {
    name: "Greek Yogurt",
    quantity: 110,
    plu: "PLU012",
    sku: "SKU-YO-012",
    description: "Thick and creamy Greek yogurt, 32oz",
    price: "$7.99",
    category: "DAIRY",
    itemsPerUnit: 1,
    supplier: "Greek Dairy Co.",
    createdAt: "2024-01-19",
  },
  {
    name: "Honey",
    quantity: 5,
    plu: "PLU013",
    sku: "SKU-HO-013",
    description: "Pure organic honey, 16oz jar",
    price: "$12.99",
    category: "CONDIMENTS",
    itemsPerUnit: 1,
    supplier: "Bee Keepers United",
    createdAt: "2024-01-21",
  },
  {
    name: "Avocados",
    quantity: 3,
    plu: "PLU014",
    sku: "SKU-AV-014",
    description: "Fresh ripe avocados, pack of 4",
    price: "$5.99",
    category: "PRODUCE",
    itemsPerUnit: 4,
    supplier: "Tropical Fruits Ltd.",
    createdAt: "2024-01-22",
  },
];
