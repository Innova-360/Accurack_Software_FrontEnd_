import React from "react";
import { usePermissions } from "../contexts/PermissionContext";

const PermissionButton = ({
  resource,
  action,
  storeId = null,
  onClick,
  children,
  disabled = false,
  hideIfNoPermission = true,
  disableIfNoPermission = false,
  className = "",
  style = {},
  title = "",
  variant = "primary", // For styling variants
  size = "medium",
  loading = false,
  icon = null,
  // Enhanced options
  respectCurrentStore = true,
  showTooltip = true,
  confirmAction = false,
  confirmMessage = "Are you sure?",
  logClicks = false,
  ...props
}) => {
  const {
    hasPermission,
    loading: permissionsLoading,
    currentStoreId,
  } = usePermissions();

  // Use current store if respectCurrentStore is true and no storeId provided
  const effectiveStoreId =
    respectCurrentStore && !storeId ? currentStoreId : storeId;

  const canPerformAction =
    !permissionsLoading && hasPermission(resource, action, effectiveStoreId);

  // Hide button if no permission and hideIfNoPermission is true
  if (hideIfNoPermission && !canPerformAction) {
    return null;
  }

  // Determine if button should be disabled
  const isDisabled =
    disabled ||
    permissionsLoading ||
    loading ||
    (disableIfNoPermission && !canPerformAction);

  // Generate appropriate title/tooltip
  const buttonTitle =
    title ||
    (showTooltip && !canPerformAction
      ? `You don't have permission to ${action} ${resource}`
      : "");

  const handleClick = (e) => {
    if (!canPerformAction) return;

    if (logClicks) {
      console.log("PermissionButton clicked:", {
        resource,
        action,
        storeId: effectiveStoreId,
        hasPermission: canPerformAction,
      });
    }

    if (confirmAction) {
      if (window.confirm(confirmMessage)) {
        onClick?.(e);
      }
    } else {
      onClick?.(e);
    }
  };

  // Dynamic class names based on variant and state
  const getButtonClasses = () => {
    const baseClasses = ["permission-button"];

    // Variant classes
    baseClasses.push(`btn-${variant}`);

    // Size classes
    baseClasses.push(`btn-${size}`);

    // State classes
    if (!canPerformAction) baseClasses.push("no-permission");
    if (isDisabled) baseClasses.push("disabled");
    if (loading) baseClasses.push("loading");

    // Custom classes
    if (className) baseClasses.push(className);

    return baseClasses.join(" ");
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={getButtonClasses()}
      style={style}
      title={buttonTitle}
      aria-disabled={isDisabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {loading || permissionsLoading ? (
        <span className="btn-loading">
          <span className="spinner"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Enhanced convenience buttons for common actions
export const CreateButton = ({ resource, storeId, icon, ...props }) => (
  <PermissionButton
    resource={resource}
    action="create"
    storeId={storeId}
    variant="success"
    icon={icon || "+"}
    {...props}
  />
);

export const EditButton = ({ resource, storeId, icon, ...props }) => (
  <PermissionButton
    resource={resource}
    action="update"
    storeId={storeId}
    variant="primary"
    icon={icon || "✏️"}
    {...props}
  />
);

export const DeleteButton = ({
  resource,
  storeId,
  confirmMessage,
  icon,
  ...props
}) => (
  <PermissionButton
    resource={resource}
    action="delete"
    storeId={storeId}
    variant="danger"
    confirmAction={true}
    confirmMessage={
      confirmMessage || "Are you sure you want to delete this item?"
    }
    icon={icon || "🗑️"}
    {...props}
  />
);

export const ExportButton = ({ resource, storeId, icon, ...props }) => (
  <PermissionButton
    resource={resource}
    action="export"
    storeId={storeId}
    variant="secondary"
    icon={icon || "📤"}
    {...props}
  />
);

export const ImportButton = ({ resource, storeId, icon, ...props }) => (
  <PermissionButton
    resource={resource}
    action="import"
    storeId={storeId}
    variant="secondary"
    icon={icon || "📥"}
    {...props}
  />
);

export const ViewButton = ({ resource, storeId, icon, ...props }) => (
  <PermissionButton
    resource={resource}
    action="read"
    storeId={storeId}
    variant="outline"
    icon={icon || "👁️"}
    {...props}
  />
);

export const ManageButton = ({ resource, storeId, icon, ...props }) => (
  <PermissionButton
    resource={resource}
    action="manage"
    storeId={storeId}
    variant="warning"
    icon={icon || "⚙️"}
    {...props}
  />
);

// Accurack-specific buttons
export const AddInventoryButton = (props) => (
  <CreateButton resource="inventory" {...props}>
    Add Item
  </CreateButton>
);

export const ProcessSaleButton = (props) => (
  <PermissionButton
    resource="sales"
    action="process"
    variant="success"
    {...props}
  >
    Process Sale
  </PermissionButton>
);

export const AddCustomerButton = (props) => (
  <CreateButton resource="customer" {...props}>
    Add Customer
  </CreateButton>
);

export const AddEmployeeButton = (props) => (
  <CreateButton resource="employee" {...props}>
    Add Employee
  </CreateButton>
);

export const AddSupplierButton = (props) => (
  <CreateButton resource="supplier" {...props}>
    Add Supplier
  </CreateButton>
);

export const ProcessReturnButton = (props) => (
  <PermissionButton
    resource="return"
    action="process"
    variant="warning"
    {...props}
  >
    Process Return
  </PermissionButton>
);

export const GenerateReportButton = (props) => (
  <PermissionButton resource="report" action="create" variant="info" {...props}>
    Generate Report
  </PermissionButton>
);

export const ExportInventoryButton = (props) => (
  <ExportButton resource="inventory" {...props}>
    Export Inventory
  </ExportButton>
);

export const ExportSalesButton = (props) => (
  <ExportButton resource="sales" {...props}>
    Export Sales
  </ExportButton>
);

// Bulk action buttons
export const BulkActionButton = ({
  resources = [], // Array of resources that need permissions
  action,
  storeId,
  children,
  requireAll = true, // Whether all resources need permission
  ...props
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = requireAll
    ? resources.every((resource) => hasPermission(resource, action, storeId))
    : resources.some((resource) => hasPermission(resource, action, storeId));

  return (
    <button
      {...props}
      disabled={!hasAccess || props.disabled}
      className={`bulk-action-button ${!hasAccess ? "no-permission" : ""} ${props.className || ""}`}
    >
      {children}
    </button>
  );
};

// Button group for related actions
export const PermissionButtonGroup = ({
  children,
  className = "",
  orientation = "horizontal", // 'horizontal' or 'vertical'
  spacing = "normal", // 'tight', 'normal', 'loose'
  ...props
}) => {
  const groupClasses = [
    "permission-button-group",
    `orientation-${orientation}`,
    `spacing-${spacing}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={groupClasses} {...props}>
      {children}
    </div>
  );
};

export default PermissionButton;
