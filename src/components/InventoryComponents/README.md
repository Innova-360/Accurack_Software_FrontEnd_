# Inventory Module Refactoring

This document describes the refactored inventory module structure for better maintainability and code organization.

## File Structure

### Data Layer

- `src/data/inventoryData.ts` - Product interface and mock data

### Custom Hooks

- `src/hooks/useInventory.ts` - Custom hooks for inventory data processing
  - `useInventoryStats` - Calculate inventory statistics
  - `useFilteredProducts` - Filter and sort products
  - `useGroupedProducts` - Group products by category
  - `useLowStockProducts` - Filter low stock products

### Components

- `src/components/InventoryComponents/`
  - `InventoryStats.tsx` - Stats cards component
  - `InventoryControls.tsx` - Search and control inputs
  - `InventoryTable.tsx` - Desktop table view
  - `InventoryMobileView.tsx` - Mobile card view
  - `GroupedTableView.tsx` - Grouped by category table view
  - `Pagination.tsx` - Pagination component
  - `LowStockSection.tsx` - Low stock products section
  - `index.ts` - Export file for easier imports

### Main Page

- `src/pages/Inventory/Inventory.tsx` - Main inventory page (refactored)

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the app
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testability**: Each component can be tested independently
5. **Performance**: Custom hooks optimize data processing with memoization
6. **Type Safety**: Proper TypeScript interfaces and types

## Component Breakdown

### InventoryStats

- Displays total products, items, and value
- Takes calculated stats as props

### InventoryControls

- Handles search, grouping, and pagination controls
- Manages user input and callbacks

### InventoryTable

- Desktop table view with sorting and selection
- Handles all table-related functionality

### InventoryMobileView

- Mobile-responsive card view
- Supports both regular and grouped views

### GroupedTableView

- Specialized table for category grouping
- Expandable/collapsible categories

### Pagination

- Reusable pagination component
- Handles page navigation logic

### LowStockSection

- Dedicated section for low stock alerts
- Responsive design for mobile and desktop

## Usage

```tsx
import {
  InventoryStats,
  InventoryControls,
  InventoryTable,
} from "../../components/InventoryComponents";
```

## Custom Hooks Usage

```tsx
import {
  useInventoryStats,
  useFilteredProducts,
  useGroupedProducts,
  useLowStockProducts,
} from "../../hooks/useInventory";
```

This refactoring makes the codebase more maintainable and scalable for future development.
