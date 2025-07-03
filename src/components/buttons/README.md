# Button Components Documentation

This document describes the reusable button components system created to reduce code duplication across the application.

## Available Components

### 1. Button (Main Component)
The main button component with flexible styling options.

```tsx
import { Button } from './components/buttons';

<Button 
  variant="primary" 
  size="md" 
  icon={<FaPlus />}
  onClick={handleClick}
>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'gray' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: React node for icon
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean
- `loading`: boolean
- `disabled`: boolean

### 2. SpecialButton
Pre-configured buttons for specific use cases.

```tsx
import { SpecialButton } from './components/buttons';

<SpecialButton 
  variant="expense-add" 
  icon={<FaPlus />}
  onClick={handleAdd}
>
  Add Expense
</SpecialButton>
```

**Available Variants:**
- **Expense Page**: 'expense-export', 'expense-delete', 'expense-save', 'expense-add'
- **Modal**: 'modal-cancel', 'modal-confirm', 'modal-delete', 'modal-add'
- **Inventory**: 'inventory-primary'
- **Sidebar**: 'sidebar-add'
- **Actions**: 'action-edit', 'action-delete', 'action-view', 'action-print'
- **Pagination**: 'pagination'

### 3. IconButton
For icon-only buttons.

```tsx
import { IconButton } from './components/buttons';

<IconButton 
  icon={<FaEdit />}
  variant="secondary"
  title="Edit"
  onClick={handleEdit}
/>
```

### 4. SidebarButton
Specialized for sidebar navigation.

```tsx
import { SidebarButton } from './components/buttons';

<SidebarButton 
  active={isSelected}
  icon={<FaChevronDown />}
  onClick={handleSelect}
>
  Category Name
</SidebarButton>
```

### 5. TabButton
For tab navigation.

```tsx
import { TabButton } from './components/buttons';

<TabButton 
  active={activeTab === 'tab1'}
  onClick={() => setActiveTab('tab1')}
>
  Tab 1
</TabButton>
```

## Migration Examples

### Before (Old Button):
```tsx
<button 
  onClick={handleExportCSV}
  className="flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border transition-colors min-w-[100px] justify-center"
>
  <FaFileExport size={12} className="mr-2" />
  Export CSV
</button>
```

### After (New SpecialButton):
```tsx
<SpecialButton
  variant="expense-export"
  onClick={handleExportCSV}
  icon={<FaFileExport size={12} />}
>
  Export CSV
</SpecialButton>
```

## Benefits

1. **Consistency**: All buttons follow the same design patterns
2. **Maintainability**: Changes to button styles only need to be made in one place
3. **Reusability**: Components can be used across different pages/features
4. **Type Safety**: Full TypeScript support with proper prop types
5. **Accessibility**: Built-in focus states, ARIA labels, and keyboard navigation
6. **Performance**: Reduced CSS bundle size through shared styles

## Custom Styling

You can still override styles when needed:

```tsx
<SpecialButton
  variant="expense-add"
  className="my-custom-class additional-styles"
  onClick={handleAdd}
>
  Custom Styled Button
</SpecialButton>
```

## Best Practices

1. Use `SpecialButton` for common patterns (expense actions, modal buttons, etc.)
2. Use `Button` for general-purpose buttons with custom styling needs
3. Use `IconButton` for action buttons in tables/lists
4. Use `SidebarButton` for navigation items
5. Always provide meaningful `title` or `aria-label` for icon buttons
6. Use consistent icon sizes: 12px for small buttons, 14px for medium, 16px for large
