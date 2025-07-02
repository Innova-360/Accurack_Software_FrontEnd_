# Server-Side Pagination Implementation

## Overview

This implementation adds server-side pagination to the product fetching functionality, replacing the previous client-side pagination approach.

## Changes Made

### 1. Updated `productAPI.ts`

- **Added interfaces**:
  - `PaginatedProductsResponse`: Contains products array and pagination metadata
  - `PaginationParams`: Parameters for pagination requests (page, limit, search, sortBy, sortOrder)

- **Modified `getProducts` method**:
  - Now accepts `PaginationParams` for server-side filtering/sorting/pagination
  - Returns `PaginatedProductsResponse` with both data and pagination info
  - Constructs query parameters for the API request

- **Added `getAllProducts` method**:
  - Legacy method for backward compatibility
  - Fetches a large number of products (limit: 1000) to simulate "all products"

### 2. Updated `useProducts.ts` hook

- **Enhanced with pagination support**:
  - Now accepts `UseProductsParams` with pagination/search/sort options
  - Maintains pagination state from API response
  - Added `fetchWithParams` method for dynamic parameter changes
  - Returns pagination metadata along with products

### 3. Updated `Inventory.tsx` page

- **Server-side pagination logic**:
  - Uses API pagination data instead of client-side calculations
  - Pagination handlers now trigger API calls with new parameters
  - Search is debounced (500ms) to avoid excessive API calls
  - Sort triggers immediate API refresh with new sort parameters

- **State management**:
  - Removed client-side filtering logic (`useFilteredProducts`)
  - Pagination state now reflects server-side pagination
  - Added debounced search functionality

## API Contract Expected

The backend API should support the following query parameters for `/product/list`:

```
GET /product/list?page=1&limit=10&search=apple&sortBy=name&sortOrder=asc
```

### Query Parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page
- `search`: Search term for filtering products
- `sortBy`: Field to sort by (name, price, quantity, etc.)
- `sortOrder`: Sort direction (`asc` or `desc`)

### Expected Response Format:

```json
{
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Benefits

1. **Performance**: Only loads required data per page
2. **Scalability**: Can handle large datasets efficiently
3. **Real-time search**: Server-side search provides more accurate results
4. **Consistent sorting**: Server-side sorting ensures consistent results
5. **Reduced memory usage**: Client doesn't need to hold all products in memory

## Backward Compatibility

- The `getAllProducts()` method provides backward compatibility for components that need all products
- Existing components that don't use pagination continue to work
- Product interface and basic API structure remain unchanged

## Usage Example

```typescript
// In a component
const { products, loading, pagination, fetchWithParams } = useProducts({
  page: 1,
  limit: 10,
  search: "",
  sortBy: "name",
  sortOrder: "asc",
});

// To change page
await fetchWithParams({ page: 2, limit: 10 });

// To search
await fetchWithParams({ page: 1, limit: 10, search: "apple" });
```

## Notes

- Search is debounced to avoid excessive API calls
- Page resets to 1 when search term or rows per page changes
- Sort triggers immediate API refresh
- Low stock products still use client-side pagination (can be enhanced later)
- Group by category still works client-side (can be moved to server-side if needed)
