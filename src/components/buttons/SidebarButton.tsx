import React from 'react';
import type { BaseButtonProps } from './types';

interface SidebarButtonProps extends BaseButtonProps {
  active?: boolean;
  icon?: React.ReactNode;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  active = false,
  icon,
  ...props
}) => {
  const baseClasses = [
    'flex',
    'items-center',
    'justify-between',
    'w-full',
    'px-3',
    'py-2',
    'mb-1',
    'text-left',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-[#03414C]'
  ];

  const stateClasses = active 
    ? ['bg-[#03414C]', 'text-white']
    : ['text-gray-700', 'hover:bg-gray-100'];

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
      <div className="flex items-center">
        <div className="w-2 h-2 bg-current rounded-full mr-2 opacity-60"></div>
        <span className={active ? "text-sm font-medium" : "text-sm"}>{children}</span>
      </div>
      {icon}
    </button>
  );
};

export default SidebarButton;
