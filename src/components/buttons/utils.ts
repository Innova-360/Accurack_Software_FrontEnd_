import type { BaseButtonProps } from './types';

export const getBaseClasses = (
  size: BaseButtonProps['size'] = 'md',
  variant: BaseButtonProps['variant'] = 'primary',
  fullWidth?: boolean,
  disabled?: boolean,
  loading?: boolean
): string => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-[#03414C] text-white hover:bg-[#025a6b] focus:ring-[#03414C]',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
    success: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-300',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-300',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300',
    gray: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
  };

  // Base classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2'
  ];

  // Conditional classes
  if (fullWidth) baseClasses.push('w-full');
  if (disabled || loading) {
    baseClasses.push('opacity-50', 'cursor-not-allowed');
    // Remove hover effects when disabled
    return [
      ...baseClasses,
      sizeClasses[size],
      variantClasses[variant].split(' ')[0], // Only get background color, no hover
      variant === 'outline' ? 'border border-gray-300' : '',
      variant === 'primary' ? 'text-white' : 
      variant === 'secondary' || variant === 'outline' ? 'text-gray-700' : 'text-white'
    ].filter(Boolean).join(' ');
  }

  return [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant]
  ].join(' ');
};

export const getIconClasses = (size: BaseButtonProps['size'] = 'md', position: 'left' | 'right' = 'left'): string => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const positionClasses = {
    left: 'mr-2',
    right: 'ml-2'
  };

  return `${sizeClasses[size]} ${positionClasses[position]}`;
};

export const getSpecialVariantClasses = (variant: string): string => {
  const specialVariants: Record<string, string> = {
    // Expense page specific variants
    'expense-export': 'px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border',
    'expense-delete': 'px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 border',
    'expense-save': 'px-4 py-2 text-sm bg-[#03414C] hover:bg-[#025a6b] text-white',
    'expense-add': 'px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white',
    
    // Inventory page specific variants
    'inventory-primary': 'px-3 py-2 sm:px-4 sm:py-2 bg-[#0f4d57] text-white hover:bg-[#0d4049] text-sm sm:text-base',
    
    // Modal specific variants
    'modal-cancel': 'px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700',
    'modal-confirm': 'px-4 py-2 text-sm font-medium bg-[#03414C] hover:bg-[#025a6b] text-white',
    'modal-delete': 'px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white',
    'modal-add': 'px-4 py-2 text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white',
      // Sidebar button (these already have padding built in via the w-full layout)
    'sidebar-category': 'w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 transition-colors',
    'sidebar-category-active': 'w-full px-3 py-2 text-left rounded-md bg-[#03414C] text-white',
    'sidebar-add': 'flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 transition-colors text-gray-700',
    
    // Action buttons (small icon buttons)
    'action-edit': 'text-gray-500 hover:text-blue-600',
    'action-delete': 'text-gray-500 hover:text-red-600',
    'action-view': 'text-gray-500 hover:text-green-600',
    'action-print': 'text-gray-500 hover:text-purple-600',
    
    // Tab buttons
    'tab-active': 'px-4 py-2 text-sm font-medium bg-[#03414C] text-white rounded-md',
    'tab-inactive': 'px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#03414C] rounded-md hover:bg-gray-100',
    
    // Pagination buttons
    'pagination': 'px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
  };

  return specialVariants[variant] || '';
};
