import React from 'react';
import type { IconButtonProps } from './types';

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  size = 'md',
  variant = 'secondary',
  title,
  'aria-label': ariaLabel,
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const variantClasses = {
    primary: 'text-[#03414C] hover:bg-[#03414C] hover:text-white',
    secondary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    success: 'text-teal-500 hover:text-teal-700 hover:bg-teal-50',
    warning: 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50',
    info: 'text-blue-500 hover:text-blue-700 hover:bg-blue-50',
    gray: 'text-gray-400 hover:text-gray-600 hover:bg-gray-50',
    outline: 'text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50'
  };

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-gray-300',
    // 'padding-[40px]'

  ];

  if (disabled) {
    baseClasses.push('opacity-50', 'cursor-not-allowed');
  }

  const combinedClasses = [
    ...baseClasses,
    sizeClasses[size],
    disabled ? 'text-gray-400' : variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={combinedClasses}
      title={title}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;