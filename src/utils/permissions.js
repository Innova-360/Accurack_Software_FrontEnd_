// Enhanced permission utilities for Accurack
export const RESOURCES = {
  INVENTORY: "inventory",
  SALES: "sales",
  CUSTOMER: "customer",
  EMPLOYEE: "employee",
  STORE: "store",
  SUPPLIER: "supplier",
  EXPENSE: "expense",
  INVOICE: "invoice",
  RETURN: "return",
  ROLE: "role",
  TAX: "tax",
  USER: "user",
  PERMISSION: "permission",
  REPORT: "report",
};

export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
  IMPORT: "import",
  MANAGE: "manage",
  APPROVE: "approve",
  REJECT: "reject",
  PROCESS: "process",
  VIEW_ALL: "view_all", // For seeing all stores' data
  ASSIGN: "assign",
  REVOKE: "revoke",
};

export const ROLE_TEMPLATES = {
  STORE_MANAGER: "store_manager",
  CASHIER: "cashier",
  INVENTORY_MANAGER: "inventory_manager",
  ACCOUNTANT: "accountant",
  SALES_ASSOCIATE: "sales_associate",
  ADMIN: "admin",
  VIEWER: "viewer",
};

// Permission checking utilities
export const createPermissionKey = (resource, action, storeId = null) => {
  return `${resource}:${action}${storeId ? `:${storeId}` : ""}`;
};

export const parsePermissionKey = (key) => {
  const parts = key.split(":");
  return {
    resource: parts[0],
    action: parts[1],
    storeId: parts[2] || null,
  };
};

// Common permission sets for Accurack roles
export const PERMISSION_SETS = {
  [ROLE_TEMPLATES.STORE_MANAGER]: {
    description: "Full access to store operations",
    permissions: [
      { resource: RESOURCES.INVENTORY, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.SALES, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.CUSTOMER, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.EMPLOYEE, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
      { resource: RESOURCES.SUPPLIER, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.EXPENSE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.INVOICE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.RETURN, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.REPORT, actions: [ACTIONS.READ, ACTIONS.EXPORT] },
    ],
  },

  [ROLE_TEMPLATES.CASHIER]: {
    description: "Point of sale and basic customer operations",
    permissions: [
      {
        resource: RESOURCES.SALES,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.PROCESS],
      },
      {
        resource: RESOURCES.CUSTOMER,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
      },
      { resource: RESOURCES.INVENTORY, actions: [ACTIONS.READ] },
      {
        resource: RESOURCES.RETURN,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.PROCESS],
      },
      { resource: RESOURCES.INVOICE, actions: [ACTIONS.READ] },
    ],
  },

  [ROLE_TEMPLATES.INVENTORY_MANAGER]: {
    description: "Inventory and supplier management",
    permissions: [
      { resource: RESOURCES.INVENTORY, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.SUPPLIER, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.SALES, actions: [ACTIONS.READ] },
      { resource: RESOURCES.RETURN, actions: [ACTIONS.READ, ACTIONS.PROCESS] },
      { resource: RESOURCES.REPORT, actions: [ACTIONS.READ, ACTIONS.EXPORT] },
    ],
  },

  [ROLE_TEMPLATES.ACCOUNTANT]: {
    description: "Financial operations and reporting",
    permissions: [
      { resource: RESOURCES.EXPENSE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.INVOICE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.TAX, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.SALES, actions: [ACTIONS.READ] },
      { resource: RESOURCES.RETURN, actions: [ACTIONS.READ] },
      { resource: RESOURCES.REPORT, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.CUSTOMER, actions: [ACTIONS.READ] },
      { resource: RESOURCES.SUPPLIER, actions: [ACTIONS.READ] },
    ],
  },

  [ROLE_TEMPLATES.SALES_ASSOCIATE]: {
    description: "Sales and customer service",
    permissions: [
      { resource: RESOURCES.SALES, actions: [ACTIONS.CREATE, ACTIONS.READ] },
      {
        resource: RESOURCES.CUSTOMER,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
      },
      { resource: RESOURCES.INVENTORY, actions: [ACTIONS.READ] },
      { resource: RESOURCES.RETURN, actions: [ACTIONS.CREATE, ACTIONS.READ] },
      { resource: RESOURCES.INVOICE, actions: [ACTIONS.READ] },
    ],
  },

  [ROLE_TEMPLATES.ADMIN]: {
    description: "System administration",
    permissions: [
      { resource: RESOURCES.USER, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.ROLE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.PERMISSION, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.STORE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.EMPLOYEE, actions: [ACTIONS.MANAGE] },
      { resource: RESOURCES.REPORT, actions: [ACTIONS.MANAGE] },
    ],
  },

  [ROLE_TEMPLATES.VIEWER]: {
    description: "Read-only access",
    permissions: [
      { resource: RESOURCES.INVENTORY, actions: [ACTIONS.READ] },
      { resource: RESOURCES.SALES, actions: [ACTIONS.READ] },
      { resource: RESOURCES.CUSTOMER, actions: [ACTIONS.READ] },
      { resource: RESOURCES.SUPPLIER, actions: [ACTIONS.READ] },
      { resource: RESOURCES.REPORT, actions: [ACTIONS.READ] },
    ],
  },
};

// Validation utilities
export const validatePermission = (permission) => {
  const errors = [];

  if (
    !permission.resource ||
    !Object.values(RESOURCES).includes(permission.resource)
  ) {
    errors.push("Invalid or missing resource");
  }

  if (
    !permission.actions ||
    !Array.isArray(permission.actions) ||
    permission.actions.length === 0
  ) {
    errors.push("Actions must be a non-empty array");
  } else {
    const invalidActions = permission.actions.filter(
      (action) => !Object.values(ACTIONS).includes(action) && action !== "*"
    );
    if (invalidActions.length > 0) {
      errors.push(`Invalid actions: ${invalidActions.join(", ")}`);
    }
  }

  return errors;
};

export const validateRoleTemplate = (template) => {
  const errors = [];

  if (!template.name || typeof template.name !== "string") {
    errors.push("Role template name is required");
  }

  if (!template.description || typeof template.description !== "string") {
    errors.push("Role template description is required");
  }

  if (!template.permissions || !Array.isArray(template.permissions)) {
    errors.push("Permissions must be an array");
  } else {
    template.permissions.forEach((permission, index) => {
      const permissionErrors = validatePermission(permission);
      if (permissionErrors.length > 0) {
        errors.push(`Permission ${index + 1}: ${permissionErrors.join(", ")}`);
      }
    });
  }

  return errors;
};

// Helper functions for common permission patterns
export const hasInventoryAccess = (permissions, action, storeId = null) => {
  return hasPermission(permissions, RESOURCES.INVENTORY, action, storeId);
};

export const hasSalesAccess = (permissions, action, storeId = null) => {
  return hasPermission(permissions, RESOURCES.SALES, action, storeId);
};

export const hasCustomerAccess = (permissions, action, storeId = null) => {
  return hasPermission(permissions, RESOURCES.CUSTOMER, action, storeId);
};

export const hasEmployeeAccess = (permissions, action, storeId = null) => {
  return hasPermission(permissions, RESOURCES.EMPLOYEE, action, storeId);
};

export const hasReportAccess = (permissions, action, storeId = null) => {
  return hasPermission(permissions, RESOURCES.REPORT, action, storeId);
};

// Core permission checking function
export const hasPermission = (
  permissions,
  resource,
  action,
  storeId = null
) => {
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
};

// Generate permission summary for UI display
export const generatePermissionSummary = (permissions) => {
  if (!permissions || !permissions.permissions) {
    return { total: 0, byResource: {}, byStore: {} };
  }

  const summary = {
    total: permissions.permissions.length,
    byResource: {},
    byStore: {},
    globalPermissions: 0,
    storeSpecificPermissions: 0,
  };

  permissions.permissions.forEach((permission) => {
    // Count by resource
    if (!summary.byResource[permission.resource]) {
      summary.byResource[permission.resource] = 0;
    }
    summary.byResource[permission.resource]++;

    // Count by store
    if (permission.storeId) {
      if (!summary.byStore[permission.storeId]) {
        summary.byStore[permission.storeId] = 0;
      }
      summary.byStore[permission.storeId]++;
      summary.storeSpecificPermissions++;
    } else {
      summary.globalPermissions++;
    }
  });

  return summary;
};

export default {
  RESOURCES,
  ACTIONS,
  ROLE_TEMPLATES,
  PERMISSION_SETS,
  createPermissionKey,
  parsePermissionKey,
  validatePermission,
  validateRoleTemplate,
  hasPermission,
  hasInventoryAccess,
  hasSalesAccess,
  hasCustomerAccess,
  hasEmployeeAccess,
  hasReportAccess,
  generatePermissionSummary,
};
