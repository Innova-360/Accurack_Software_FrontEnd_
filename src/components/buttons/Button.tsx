import React from 'react';
import type { BaseButtonProps } from './types';
import { getBaseClasses, getIconClasses } from './utils';

const Button: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  size = 'md',
  variant = 'primary',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  ...props
}) => {
  const baseClasses = getBaseClasses(size, variant, fullWidth, disabled, loading);
  const iconClasses = icon ? getIconClasses(size, iconPosition) : '';
  
  const combinedClasses = `${baseClasses} ${className}`.trim();

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <svg 
          className={`animate-spin ${iconClasses}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }
    
    if (icon) {
      return (
        <span className={iconClasses}>
          {icon}
        </span>
      );
    }
    
    return null;
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {loading ? 'Loading...' : children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;