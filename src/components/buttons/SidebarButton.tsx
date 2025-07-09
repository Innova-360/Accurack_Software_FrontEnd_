import React, { useState, useEffect } from "react";
import type { BaseButtonProps } from "./types";

interface SidebarButtonProps extends BaseButtonProps {
  active?: boolean;
  icon?: React.ReactNode;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  active,
  icon,
  ...props
}) => {
  const [internalActive, setInternalActive] = useState(false);

  // Determine if this is controlled (active prop provided) or uncontrolled
  const isControlled = active !== undefined;
  const isActive = isControlled ? active : internalActive;

  // Update internal state when active prop changes (for controlled mode)
  useEffect(() => {
    if (isControlled) {
      setInternalActive(active);
    }
  }, [active, isControlled]);

  const baseClasses = [
    "flex",
    "items-center",
    "justify-between",
    "w-full",
    "px-3",
    "py-2",
    "mb-1",
    "text-left",
    "rounded-md",
    "transition-colors",
    "duration-200",
    "focus:outline-none",
  ];

  const stateClasses = isActive
    ? ["bg-[#03414C]", "text-white"]
    : ["bg-white", "text-black"];

  if (disabled) {
    baseClasses.push("opacity-50", "cursor-not-allowed");
  }

  const combinedClasses = [...baseClasses, ...stateClasses, className]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (!disabled && onClick) {
      // Only toggle internal state if this is uncontrolled
      if (!isControlled) {
        setInternalActive(!internalActive);
      }
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
        <span
          className={
            isActive ? "text-sm font-medium text-white" : "text-sm text-black"
          }
        >
          {children}
        </span>
      </div>
      {icon}
    </button>
  );
};

export default SidebarButton;
