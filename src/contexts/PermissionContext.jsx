import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { RESOURCES, ACTIONS } from "../utils/permissions";

const PermissionContext = createContext();

export const PermissionProvider = ({ children, permissionService }) => {
  // Get auth state from Redux store instead of AuthContext
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStoreId, setCurrentStoreId] = useState(null);

  // Add missing dependency to useEffect
  const loadUserPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userPermissions =
        await permissionService.getMyPermissions(currentStoreId);
      setPermissions(userPermissions);
    } catch (err) {
      console.error("Failed to load permissions:", err);
      setError(err.message);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [permissionService, currentStoreId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔐 User authenticated, loading permissions for:', user.email);
      loadUserPermissions();
    } else {
      console.log('🚪 User not authenticated, clearing permissions');
      // Clear permissions and cache on logout
      setPermissions(null);
      setError(null);
      setCurrentStoreId(null);
      setLoading(false);
      
      // Clear permission service cache
      if (permissionService) {
        permissionService.clearAllCache();
      }
    }
  }, [isAuthenticated, user, loadUserPermissions, permissionService]);

  const hasPermission = useCallback(
    (resource, action, storeId = null) => {
      if (!permissions || !permissions.permissions) return false;

      return permissions.permissions.some((permission) => {
        // Check resource match
        if (permission.resource !== resource) return false;

        // Check store match (if storeId is specified)
        if (storeId && permission.storeId && permission.storeId !== storeId) {
          return false;
        }

        // Check action match (support for wildcard)
        if (permission.actions.includes("*")) return true;
        if (permission.actions.includes(action)) return true;

        return false;
      });
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (resource, actions = [], storeId = null) => {
      return actions.some((action) => hasPermission(resource, action, storeId));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (resource, actions = [], storeId = null) => {
      return actions.every((action) =>
        hasPermission(resource, action, storeId)
      );
    },
    [hasPermission]
  );

  const getResourcePermissions = useCallback(
    (resource, storeId = null) => {
      if (!permissions || !permissions.permissions) return [];

      return permissions.permissions
        .filter((permission) => {
          const resourceMatch = permission.resource === resource;
          const storeMatch =
            !storeId || !permission.storeId || permission.storeId === storeId;
          return resourceMatch && storeMatch;
        })
        .flatMap((permission) => permission.actions)
        .filter((action, index, self) => self.indexOf(action) === index); // Remove duplicates
    },
    [permissions]
  );

  const getUserStores = useCallback(() => {
    if (!permissions || !permissions.permissions) return [];

    const stores = permissions.permissions
      .map((permission) => permission.storeId)
      .filter((storeId) => storeId !== null)
      .filter((storeId, index, self) => self.indexOf(storeId) === index);

    return stores;
  }, [permissions]);

  const canAccessStore = useCallback(
    (storeId) => {
      if (!permissions || !permissions.permissions) return false;

      return permissions.permissions.some(
        (permission) =>
          permission.storeId === storeId || permission.storeId === null
      );
    },
    [permissions]
  );

  const refreshPermissions = useCallback(async () => {
    permissionService.clearAllCache();
    await loadUserPermissions();
  }, [permissionService, loadUserPermissions]);

  // Enhanced store management
  const switchStore = useCallback((storeId) => {
    setCurrentStoreId(storeId);
  }, []);

  const getCurrentStorePermissions = useCallback(() => {
    if (!currentStoreId) return permissions;

    if (!permissions || !permissions.permissions) return { permissions: [] };

    const storePermissions = permissions.permissions.filter(
      (permission) =>
        permission.storeId === currentStoreId || permission.storeId === null
    );

    return { permissions: storePermissions };
  }, [permissions, currentStoreId]);

  // Accurack-specific convenience methods
  const canAccessInventory = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(
        RESOURCES.INVENTORY,
        action,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canAccessSales = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(RESOURCES.SALES, action, storeId || currentStoreId);
    },
    [hasPermission, currentStoreId]
  );

  const canAccessCustomers = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(
        RESOURCES.CUSTOMER,
        action,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canAccessEmployees = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(
        RESOURCES.EMPLOYEE,
        action,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canAccessSuppliers = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(
        RESOURCES.SUPPLIER,
        action,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canAccessExpenses = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(
        RESOURCES.EXPENSE,
        action,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canAccessInvoices = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(
        RESOURCES.INVOICE,
        action,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canAccessReturns = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(RESOURCES.RETURN, action, storeId || currentStoreId);
    },
    [hasPermission, currentStoreId]
  );

  const canAccessReports = useCallback(
    (action = ACTIONS.READ, storeId = null) => {
      return hasPermission(RESOURCES.REPORT, action, storeId || currentStoreId);
    },
    [hasPermission, currentStoreId]
  );

  const canManageUsers = useCallback(
    (storeId = null) => {
      return hasPermission(
        RESOURCES.USER,
        ACTIONS.MANAGE,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  const canManagePermissions = useCallback(
    (storeId = null) => {
      return hasPermission(
        RESOURCES.PERMISSION,
        ACTIONS.MANAGE,
        storeId || currentStoreId
      );
    },
    [hasPermission, currentStoreId]
  );

  // Check if user is a super admin (has global permissions)
  const isSuperAdmin = useCallback(() => {
    if (!permissions || !permissions.permissions) return false;

    return permissions.permissions.some(
      (permission) =>
        permission.storeId === null &&
        (permission.actions.includes("*") ||
          permission.actions.includes(ACTIONS.MANAGE))
    );
  }, [permissions]);

  // Get all available actions for a specific resource
  const getAvailableActions = useCallback(
    (resource, storeId = null) => {
      const resourcePermissions = getResourcePermissions(
        resource,
        storeId || currentStoreId
      );

      // If user has wildcard permission, return all possible actions
      if (resourcePermissions.includes("*")) {
        return Object.values(ACTIONS);
      }

      return resourcePermissions;
    },
    [getResourcePermissions, currentStoreId]
  );

  const value = {
    permissions,
    loading,
    error,
    currentStoreId,

    // Core permission methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getResourcePermissions,
    getUserStores,
    canAccessStore,
    refreshPermissions,

    // Store management
    switchStore,
    getCurrentStorePermissions,

    // Convenience methods for common permissions
    canCreate: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.CREATE, storeId),
      [hasPermission]
    ),
    canRead: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.READ, storeId),
      [hasPermission]
    ),
    canUpdate: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.UPDATE, storeId),
      [hasPermission]
    ),
    canDelete: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.DELETE, storeId),
      [hasPermission]
    ),
    canManage: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.MANAGE, storeId),
      [hasPermission]
    ),
    canExport: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.EXPORT, storeId),
      [hasPermission]
    ),
    canImport: useCallback(
      (resource, storeId) => hasPermission(resource, ACTIONS.IMPORT, storeId),
      [hasPermission]
    ),

    // Accurack-specific methods
    canAccessInventory,
    canAccessSales,
    canAccessCustomers,
    canAccessEmployees,
    canAccessSuppliers,
    canAccessExpenses,
    canAccessInvoices,
    canAccessReturns,
    canAccessReports,
    canManageUsers,
    canManagePermissions,
    isSuperAdmin,
    getAvailableActions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

export default PermissionContext;
