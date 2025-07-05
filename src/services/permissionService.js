class PermissionService {
  constructor(apiClient) {
    this.api = apiClient;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Internal cache management
  _getCacheKey(userId, storeId = null) {
    return `permissions_${userId}_${storeId || "global"}`;
  }

  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Enhanced retry logic for better reliability
  async _apiCallWithRetry(apiCall, retries = this.retryAttempts) {
    try {
      return await apiCall();
    } catch (error) {
      if (retries > 0 && (error.response?.status >= 500 || !error.response)) {
        console.warn(`API call failed, retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this._apiCallWithRetry(apiCall, retries - 1);
      }
      throw error;
    }
  }

  // API methods with enhanced error handling
  async getUserPermissions(userId, storeId = null) {
    const cacheKey = this._getCacheKey(userId, storeId);
    const cached = this._getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this._apiCallWithRetry(async () => {
        const endpoint = storeId
          ? `/permissions/user/${userId}?storeId=${storeId}`
          : `/permissions/user/${userId}`;
        return await this.api.get(endpoint);
      });

      this._setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      // Return empty permissions on error rather than throwing
      return { permissions: [], roles: [] };
    }
  }

  async getMyPermissions(storeId = null) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        const endpoint = storeId
          ? `/permissions/my-permissions?storeId=${storeId}`
          : `/permissions/my-permissions`;
        return await this.api.get(endpoint);
      });

      return response.data;
    } catch (error) {
      console.error("Failed to fetch my permissions:", error);
      return { permissions: [], roles: [] };
    }
  }

  async checkPermission(resource, action, storeId = null) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.post("/permissions/check-my-permission", {
          resource,
          action,
          storeId,
        });
      });

      return response.data.hasPermission;
    } catch (error) {
      console.error("Permission check failed:", error);
      return false; // Fail-safe: deny access
    }
  }

  // Batch permission checking for better performance
  async checkMultiplePermissions(permissionChecks) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.post("/permissions/check-multiple", {
          checks: permissionChecks,
        });
      });

      return response.data.results;
    } catch (error) {
      console.error("Batch permission check failed:", error);
      // Return all false for safety
      return permissionChecks.reduce((acc, check, index) => {
        acc[index] = false;
        return acc;
      }, {});
    }
  }

  async assignPermission(permissionData) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.post("/permissions/assign", permissionData);
      });

      // Clear cache for affected user
      this.clearUserCache(permissionData.userId);

      return response.data;
    } catch (error) {
      console.error("Failed to assign permission:", error);
      throw error;
    }
  }

  async revokePermission(revokeData) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.delete("/permissions/revoke", {
          data: revokeData,
        });
      });

      // Clear cache for affected user
      this.clearUserCache(revokeData.userId);

      return response.data;
    } catch (error) {
      console.error("Failed to revoke permission:", error);
      throw error;
    }
  }

  async bulkAssignPermissions(bulkData) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.post("/permissions/bulk-assign", bulkData);
      });

      // Clear cache for all affected users
      bulkData.userIds.forEach((userId) => this.clearUserCache(userId));

      return response.data;
    } catch (error) {
      console.error("Failed to bulk assign permissions:", error);
      throw error;
    }
  }

  // Role template methods
  async getRoleTemplates() {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.get("/permissions/templates");
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch role templates:", error);
      return [];
    }
  }

  async createRoleTemplate(templateData) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.post("/permissions/templates", templateData);
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create role template:", error);
      throw error;
    }
  }

  async assignRoleTemplate(assignData) {
    try {
      const response = await this._apiCallWithRetry(async () => {
        return await this.api.post("/permissions/templates/assign", assignData);
      });

      // Clear cache for all affected users
      assignData.userIds.forEach((userId) => this.clearUserCache(userId));

      return response.data;
    } catch (error) {
      console.error("Failed to assign role template:", error);
      throw error;
    }
  }

  // Cache management
  clearUserCache(userId) {
    for (const key of this.cache.keys()) {
      if (key.includes(`permissions_${userId}`)) {
        this.cache.delete(key);
      }
    }
  }

  clearAllCache() {
    this.cache.clear();
  }

  // Utility methods for your Accurack-specific needs
  async getInventoryPermissions(storeId) {
    return await this.getResourcePermissions("inventory", storeId);
  }

  async getSalesPermissions(storeId) {
    return await this.getResourcePermissions("sales", storeId);
  }

  async getEmployeePermissions(storeId) {
    return await this.getResourcePermissions("employee", storeId);
  }

  async getResourcePermissions(resource, storeId = null) {
    try {
      const permissions = await this.getMyPermissions(storeId);
      return permissions.permissions.filter((p) => p.resource === resource);
    } catch (error) {
      console.error(`Failed to get ${resource} permissions:`, error);
      return [];
    }
  }
}

export default PermissionService;
