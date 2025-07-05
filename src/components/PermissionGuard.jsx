import React from "react";
import { usePermissions } from "../contexts/PermissionContext";

const PermissionGuard = ({
  resource,
  action,
  storeId = null,
  actions = [], // For multiple actions (ANY match)
  requireAll = false, // If true, require ALL actions
  children,
  fallback = null,
  loadingComponent = (
    <div className="loading-permissions">Loading permissions...</div>
  ),
  errorComponent = null,
  showError = false,
  // Enhanced options
  respectCurrentStore = true, // Whether to use current store from context
  showFallbackReason = false, // Show why access was denied
  logAccess = false, // Log access attempts for debugging
  className = "",
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    error,
    currentStoreId,
  } = usePermissions();

  // Use current store if respectCurrentStore is true and no storeId provided
  const effectiveStoreId =
    respectCurrentStore && !storeId ? currentStoreId : storeId;

  // Show loading state
  if (loading) {
    return loadingComponent;
  }

  // Show error state if requested
  if (error && showError) {
    return (
      errorComponent || (
        <div className="permission-error">
          Error loading permissions: {error}
        </div>
      )
    );
  }

  // Determine permission check based on props
  let hasAccess = false;
  let denialReason = "";

  if (actions.length > 0) {
    // Multiple actions specified
    hasAccess = requireAll
      ? hasAllPermissions(resource, actions, effectiveStoreId)
      : hasAnyPermission(resource, actions, effectiveStoreId);

    if (!hasAccess && showFallbackReason) {
      denialReason = requireAll
        ? `Missing one or more required permissions: ${actions.join(", ")} for ${resource}`
        : `Missing all permissions: ${actions.join(", ")} for ${resource}`;
    }
  } else if (action) {
    // Single action specified
    hasAccess = hasPermission(resource, action, effectiveStoreId);

    if (!hasAccess && showFallbackReason) {
      denialReason = `Missing permission: ${action} for ${resource}`;
    }
  } else {
    console.warn("PermissionGuard: No action or actions specified");
    if (showFallbackReason) {
      denialReason = "No permission criteria specified";
    }
  }

  // Log access attempt if requested
  if (logAccess) {
    console.log("PermissionGuard Access Check:", {
      resource,
      action,
      actions,
      storeId: effectiveStoreId,
      hasAccess,
      denialReason: denialReason || "Access granted",
    });
  }

  if (!hasAccess) {
    if (showFallbackReason && denialReason) {
      return (
        <div className={`permission-denied ${className}`}>
          {fallback || (
            <div className="access-denied-message">
              <p>Access Denied: {denialReason}</p>
            </div>
          )}
        </div>
      );
    }
    return fallback;
  }

  return <div className={className}>{children}</div>;
};

// Enhanced convenience components for common use cases
export const CreateGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="create"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const ReadGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="read"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const UpdateGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="update"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const DeleteGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="delete"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const ManageGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="manage"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const ExportGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="export"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const ImportGuard = ({
  resource,
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource={resource}
    action="import"
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

// Accurack-specific guards
export const InventoryGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="inventory"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const SalesGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="sales"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const CustomerGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="customer"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const EmployeeGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="employee"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const SupplierGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="supplier"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const ExpenseGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="expense"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const InvoiceGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="invoice"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const ReportGuard = ({
  action = "read",
  storeId,
  children,
  fallback,
  ...props
}) => (
  <PermissionGuard
    resource="report"
    action={action}
    storeId={storeId}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

export const AdminGuard = ({ children, fallback, ...props }) => (
  <PermissionGuard
    resource="user"
    action="manage"
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGuard>
);

// Multi-resource guard for complex permissions
export const MultiResourceGuard = ({
  resourcePermissions = [], // [{ resource, action, storeId }]
  requireAll = false,
  children,
  fallback,
  ...props
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = requireAll
    ? resourcePermissions.every(({ resource, action, storeId }) =>
        hasPermission(resource, action, storeId)
      )
    : resourcePermissions.some(({ resource, action, storeId }) =>
        hasPermission(resource, action, storeId)
      );

  if (!hasAccess) {
    return fallback;
  }

  return <div {...props}>{children}</div>;
};

export default PermissionGuard;
