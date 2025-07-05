// Phase 1: Basic Hook Implementation
import { useContext } from "react";
import { PermissionContext } from "../contexts/PermissionContext";

// Re-export the hook from context for convenience
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

// Specialized hooks for common use cases
export const useResourcePermissions = (resource, storeId = null) => {
  const { getResourcePermissions, hasPermission } = usePermissions();

  const actions = getResourcePermissions(resource, storeId);

  return {
    actions,
    canCreate: hasPermission(resource, "create", storeId),
    canRead: hasPermission(resource, "read", storeId),
    canUpdate: hasPermission(resource, "update", storeId),
    canDelete: hasPermission(resource, "delete", storeId),
    canExport: hasPermission(resource, "export", storeId),
    canManage: hasPermission(resource, "manage", storeId),
    hasAnyAccess: actions.length > 0,
  };
};

export const useStoreAccess = () => {
  const { getUserStores, canAccessStore, permissions } = usePermissions();

  const userStores = getUserStores();
  const hasGlobalAccess =
    permissions?.permissions?.some((p) => p.storeId === null) || false;

  return {
    userStores,
    hasGlobalAccess,
    canAccessStore,
    hasStoreAccess: userStores.length > 0 || hasGlobalAccess,
  };
};

// Accurack-specific hooks for easy migration
export const useInventoryPermissions = (storeId = null) => {
  return useResourcePermissions("inventory", storeId);
};

export const useSalesPermissions = (storeId = null) => {
  return useResourcePermissions("sales", storeId);
};

export const useCustomerPermissions = (storeId = null) => {
  return useResourcePermissions("customer", storeId);
};

export const useEmployeePermissions = (storeId = null) => {
  return useResourcePermissions("employee", storeId);
};

export default usePermissions;
