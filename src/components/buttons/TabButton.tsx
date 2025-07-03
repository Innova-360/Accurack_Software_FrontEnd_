import React from 'react';
import type { TabButtonProps } from './types';

const TabButton: React.FC<TabButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  active = false,
  ...props
}) => {
  const baseClasses = [
    'px-4',
    'py-2',
    'text-sm',
    'font-medium',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-[#03414C]',
    // 'padding-[40px]'

  ];

  const stateClasses = active 
    ? ['bg-[#03414C]', 'text-white']
    : ['text-gray-600', 'hover:text-[#03414C]', 'hover:bg-gray-100'];

  if (disabled) {
    baseClasses.push('opacity-50', 'cursor-not-allowed');
  }

  const combinedClasses = [
    ...baseClasses,
    ...stateClasses,
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
      {...props}
    >
      {children}
    </button>
  );
};

export default TabButton;