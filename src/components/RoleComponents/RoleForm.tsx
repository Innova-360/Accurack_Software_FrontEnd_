import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCog,
} from "react-icons/fa";

interface RoleFormProps {
  onSubmit?: (data: RoleFormData) => void;
  initialData?: Partial<RoleFormData>;
  isEditMode?: boolean;
  onCancel?: () => void;
}

interface RoleFormData {
  id?: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: {
    resource: string;
    actions: string[];
    storeId: string;
  }[];
  storeIds: string[];
}

const PERMISSIONS_MATRIX = {
  resources: [
    { id: "inventory", name: "Inventory" },
    { id: "products", name: "Products" },
    { id: "orders", name: "Orders" },
    { id: "reports", name: "Reports" },
    { id: "users", name: "Users" },
    { id: "settings", name: "Settings" },
  ],
  actions: [
    { id: "create", name: "Create", icon: <FaPlus className="w-4 h-4 mb-1" /> },
    { id: "read", name: "Read", icon: <FaEye className="w-4 h-4 mb-1" /> },
    { id: "update", name: "Update", icon: <FaEdit className="w-4 h-4 mb-1" /> },
    {
      id: "delete",
      name: "Delete",
      icon: <FaTrash className="w-4 h-4 mb-1" />,
    },
    {
      id: "export",
      name: "Export",
      icon: <FaDownload className="w-4 h-4 mb-1" />,
    },
    { id: "manage", name: "Manage", icon: <FaCog className="w-4 h-4 mb-1" /> },
  ],
};

const RoleForm: React.FC<RoleFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { loading, error } = useSelector((state: RootState) => state.employees);

  const [formData, setFormData] = useState<RoleFormData>({
    id: initialData?.id || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    isDefault: initialData?.isDefault || false,
    permissions: initialData?.permissions || [
      {
        resource: "inventory",
        actions: ["read"],
        storeId: id || "",
      },
    ],
    storeIds: initialData?.storeIds || (id ? [id] : []),
  });

  // Initialize selectedPermissions from initialData
  const initializePermissions = () => {
    const initialPerms: { [key: string]: string[] } = {
      inventory: [],
      products: [],
      orders: [],
      reports: [],
      users: [],
      settings: [],
    };

    if (initialData?.permissions) {
      initialData.permissions.forEach((perm) => {
        if (initialPerms[perm.resource]) {
          initialPerms[perm.resource] = perm.actions;
        }
      });
    }

    return initialPerms;
  };

  const [selectedPermissions, setSelectedPermissions] = useState<{
    [key: string]: string[];
  }>(initializePermissions());

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePermissionChange = (resource: string, action: string) => {
    setSelectedPermissions((prev) => {
      const currentActions = prev[resource] || [];
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action];

      return {
        ...prev,
        [resource]: updatedActions,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert selected permissions to the format expected by backend
    const permissions = Object.entries(selectedPermissions)
      .filter(([, actions]) => actions.length > 0)
      .map(([resource, actions]) => ({
        resource,
        actions: actions,
        storeId: id || "",
      }));

    // Prepare submit data with proper formatting
    const submitData = {
      ...formData,
      permissions: permissions as any,
      storeIds: id ? [id] : formData.storeIds,
    };

    if (onSubmit) {
      onSubmit(submitData);
    }

    alert(
      `Role "${formData.name}" ${isEditMode ? "updated" : "created"} successfully!`
    );
    if (id) {
      navigate(`/store/${id}/role`);
    } else {
      navigate("/permissions");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Role" : "Add New Role"}
            </h2>
          </div>
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Role Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Store Manager"
                required
              />
            </div>
            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the role's responsibilities..."
              />
            </div>
            {/* Default Role Checkbox */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Default Role (auto-assign to new users)
                </span>
              </label>
            </div>
            {/* Permissions Matrix Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Permissions Matrix
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select which actions this role can perform on each resource.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 border border-gray-300 font-medium text-gray-700">
                        Resource
                      </th>
                      {PERMISSIONS_MATRIX.actions.map((action) => (
                        <th
                          key={action.id}
                          className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]"
                        >
                          <div className="flex flex-col items-center">
                            {action.icon}
                            <span className="text-xs">{action.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSIONS_MATRIX.resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border border-gray-300 font-medium text-gray-700 bg-white">
                          {resource.name}
                        </td>
                        {PERMISSIONS_MATRIX.actions.map((action) => (
                          <td
                            key={action.id}
                            className="py-3 px-4 border border-gray-300 text-center bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedPermissions[resource.id]?.includes(
                                  action.id
                                ) || false
                              }
                              onChange={() =>
                                handlePermissionChange(resource.id, action.id)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error}
              </div>
            )}
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Role"
                    : "Save Role"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
