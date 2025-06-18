import React from 'react';
import { getSpecialVariantClasses } from './utils';

interface SpecialButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant: 'expense-export' | 'expense-delete' | 'expense-save' | 'expense-add' | 
           'inventory-primary' | 'modal-cancel' | 'modal-confirm' | 'modal-delete' | 
           'modal-add' | 'sidebar-add' | 'action-edit' | 'action-delete' | 'action-view' | 
           'action-print' | 'pagination';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  minWidth?: string;
  title?: string;
}

const SpecialButton: React.FC<SpecialButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  variant,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  minWidth,
  title,
  ...props
}) => {
  const baseClasses = getSpecialVariantClasses(variant);
  
  // Determine which variants need common button classes
  const needsCommonClasses = !variant.startsWith('action-') && !variant.startsWith('sidebar-');
  
  const commonClasses = needsCommonClasses ? [
    'flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2'
  ] : [];

  // Add min-width for specific variants
  const widthClasses = [];
  if (minWidth) {
    widthClasses.push(`min-w-[${minWidth}]`);
  } else if (variant.startsWith('expense-') || variant.startsWith('modal-')) {
    widthClasses.push('min-w-[100px]');
  }

  if (fullWidth) {
    widthClasses.push('w-full');
  }

  if (disabled) {
    commonClasses.push('opacity-50', 'cursor-not-allowed');
  }

  const combinedClasses = [
    ...commonClasses,
    ...widthClasses,
    baseClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };
  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClasses = iconPosition === 'left' ? 'mr-2' : 'ml-2';
    
    return (
      <span className={iconClasses}>
        {icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={combinedClasses}
      title={title}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default SpecialButton;
