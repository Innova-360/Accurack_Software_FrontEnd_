import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store";
import {
  createEmployee,
  updateEmployee,
  fetchRoleTemplates,
  createRoleTemplate,
} from "../../store/slices/employeeSlice";
import apiClient from "../../services/api";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCog,
} from "react-icons/fa";


interface EmployeeFormProps {
  onSubmit?: (data: EmployeeFormData) => void;
  initialData?: Partial<EmployeeFormData>;
  isEditMode?: boolean;
  onCancel?: () => void;
}

interface EmployeeFormData {
  roleTemplateId: string;
  id?: string;
  employeeCode: string; // 6-digit employee code (backend field name)
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  position: string;
  department: string;
  phone: string;

  email: string;
  // Note: password field for creation only
  password?: string;
  permissions: [
    {
      resource: string;
      actions: string[]; // Changed from 'action' to 'actions'
      storeId: string;
    },
  ];
  storeIds: string[];
}

// Define the permissions structure based on backend validation
const PERMISSIONS_MATRIX = {
  resources: [
    { id: "store", name: "Store" },
    { id: "inventory", name: "Inventory" },
    { id: "product", name: "Product" },
    { id: "supplier", name: "Supplier" },
    { id: "customer", name: "Customer" },
    // { id: "order", name: "Order" },
    { id: "user", name: "User" },
    // { id: "report", name: "Report" },
    // { id: "setting", name: "Setting" },
    // { id: "transaction", name: "Transaction" },
    { id: "category", name: "Category" },
    // { id: "brand", name: "Brand" },
  ],
  actions: [
    { id: "create", name: "Create" },
    { id: "read", name: "Read" },
    { id: "update", name: "Update" },
    { id: "delete", name: "Delete" },
    { id: "export", name: "Export" },
    { id: "manage", name: "Manage" },
  ],
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { loading, error, roleTemplates, roleTemplatesLoading } = useSelector(
    (state: RootState) => state.employees
  );

  // Fetch role templates on mount
  React.useEffect(() => {
    dispatch(fetchRoleTemplates());
  }, [dispatch]);

  // Helper function to generate 6-digit employee code
  const generateEmployeeCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates 6-digit number
  };

  // Helper function to get current date in ISO format
  const getCurrentDate = () => {
    return new Date().toISOString();
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  console.log("EmployeeForm props:", {
    isEditMode,
    initialData,
    onSubmit,
    onCancel,
  });
  console.log("URL params:", { id });
  console.log("Form will be in edit mode:", isEditMode);
  console.log("Initial data received:", initialData);

  const [formData, setFormData] = useState<EmployeeFormData>({
    id: initialData?.id || "",
    roleTemplateId: initialData?.roleTemplateId || "", // <-- Added this line
    employeeCode: isEditMode
      ? initialData?.employeeCode || generateEmployeeCode()
      : generateEmployeeCode(), // Auto-generate 6-digit code for new employees
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    role: initialData?.role || "",
    status: initialData?.status || "active",
    position: initialData?.position || "",
    department: initialData?.department || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",

    password: "", // Always empty for security
    permissions: initialData?.permissions || [
      {
        resource: "inventory",
        actions: ["read"], // Changed from 'action' to 'actions'
        storeId: id || "", // Use current store ID from URL params
      },
    ],
    storeIds: initialData?.storeIds || (id ? [id] : []), // Include current store ID if available
  });

  // Initialize selectedPermissions from initialData
  const initializePermissions = () => {
    const initialPerms: { [key: string]: string[] } = {
      store: [],
      inventory: [],
      product: [],
      supplier: [],
      customer: [],
      order: [],
      user: [],
      report: [],
      setting: [],
      transaction: [],
      category: [],
      brand: [],
    };

    if (initialData?.permissions) {
      initialData.permissions.forEach((perm) => {
        if (initialPerms[perm.resource]) {
          initialPerms[perm.resource] = perm.actions; // Changed from 'action' to 'actions'
        }
      });
    }

    return initialPerms;
  };

  const [selectedPermissions, setSelectedPermissions] = useState<{
    [key: string]: string[];
  }>(initializePermissions());

  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    name: '',
    description: '',
    isDefault: false,
    priority: 0
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Prevent changes to employeeCode as it is auto-generated
    if (name === "employeeCode") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleCreateRole = async () => {
    if (!newRoleData.name) return;
    
    const permissions = Object.entries(selectedPermissions)
      .filter(([_, actions]) => actions.length > 0)
      .map(([resource, actions]) => ({
        resource,
        action: actions[0], // API expects single action, not array
        scope: 'store'
      }));

    const rolePayload = {
      ...newRoleData,
      permissions
    };

    try {
      const newRole = await dispatch(createRoleTemplate(rolePayload)).unwrap();
      await dispatch(fetchRoleTemplates());
      setFormData(prev => ({ ...prev, roleTemplateId: newRole.id }));
      setShowCreateRole(false);
      setNewRoleData({ name: '', description: '', isDefault: false, priority: 0 });
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert selectedPermissions to API format
    const permissions = Object.entries(selectedPermissions)
      .filter(([_, actions]) => actions.length > 0)
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



    console.log("Submitting employee data:", submitData);
    console.log("Current store ID from URL:", id);
    console.log("Permissions with store IDs:", permissions);

    // Remove password field if editing or if password is empty
    if (isEditMode || !submitData.password) {
      delete submitData.password;
    }

    try {
      if (isEditMode && formData.id) {
        console.log("Editing employee with ID:", formData.id);
        console.log("Update data:", submitData);
        await dispatch(
          updateEmployee({ id: formData.id, employeeData: submitData })
        ).unwrap();
        console.log("Employee updated successfully");
        // For edit mode, call onSubmit if provided
        if (onSubmit) {
          onSubmit(submitData);
        }
      } else {
        console.log("Creating new employee");
        console.log("Create data:", submitData);
        // Creating new employee
        const result = await dispatch(createEmployee(submitData)).unwrap();
        
        // Send email invite after employee creation
        try {
          await apiClient.post('/employees/invite', {
            employeeId: result.id || result.data?.id,
            email: formData.email,
            storeId: id
          });
          console.log('Email invite sent successfully');
        } catch (inviteError) {
          console.error('Failed to send email invite:', inviteError);
        }
        console.log("Employee created successfully");

        // Redirect to employee list/permissions page
        if (id) {
          // If we have a store ID, redirect to store-specific employee page
          navigate(`/store/${id}/employee`);
        } else {
          // Otherwise redirect to general employee/permissions page
          navigate("/permissions");
        }

        // Call onSubmit if provided (for parent component handling)
        if (onSubmit) {
          onSubmit(submitData);
        }
      }
    } catch (error) {
      console.error("Failed to save employee:", error);
      // Don't redirect on error - let user see the error and try again
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Employee" : "Employee Creation"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode
                ? "Update employee information and permissions"
                : "Create a new role with specific permissions for the inventory system"}
            </p>
           
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Password - only required for new employees */}
                {!isEditMode && (
                  <div className="md:col-span-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Employee Information Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Employee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Employee Code - Auto-generated, Read-only */}
                <div>
                  <label
                    htmlFor="employeeCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Employee Code
                  </label>
                  <input
                    type="text"
                    id="employeeCode"
                    name="employeeCode"
                    value={formData.employeeCode}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-generated"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated 6-digit code
                  </p>
                </div>

                {/* Position */}
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Role Template Dropdown with Add Role Button */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="roleTemplateId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Role
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCreateRole(!showCreateRole)}
                      className="bg-[#043E49] hover:bg-[#032B2E] text-sm font-medium text-white px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      {showCreateRole ? 'Cancel' : '+ Add Role'}
                    </button>
                  </div>
                  
                  {!showCreateRole ? (
                    <select
                      id="roleTemplateId"
                      name="roleTemplateId"
                      value={formData.roleTemplateId || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    >
                      <option value="" disabled>
                        Select a role
                      </option>
                      {roleTemplatesLoading && <option>Loading...</option>}
                      {roleTemplates &&
                        roleTemplates.map((role: any) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <div className="space-y-3 p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div>
                        <input
                          type="text"
                          placeholder="Role Name"
                          value={newRoleData.name}
                          onChange={(e) => setNewRoleData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Role Description"
                          value={newRoleData.description}
                          onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={newRoleData.isDefault}
                            onChange={(e) => setNewRoleData(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="mr-2"
                          />
                          Default Role
                        </label>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">Priority:</label>
                          <input
                            type="number"
                            value={newRoleData.priority}
                            onChange={(e) => setNewRoleData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                            min="0"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateRole}
                        className="w-full bg-[#043E49] text-white py-2 rounded-md hover:bg-[#032B2E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Role 
                      </button>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>


              </div>
            </div>

            {/* Permissions Matrix Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                {showCreateRole ? 'Role Permissions (will be saved with role)' : 'Employee Permissions'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {showCreateRole 
                  ? 'These permissions will be included when creating the new role.' 
                  : 'Select which actions this employee can perform on each resource.'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 border border-gray-300 font-medium text-gray-700">
                        Resource
                      </th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <FaPlus className="w-4 h-4 mb-1" />
                          <span className="text-xs">Create</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <FaEye className="w-4 h-4 mb-1" />
                          <span className="text-xs">Read</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <FaEdit className="w-4 h-4 mb-1" />
                          <span className="text-xs">Update</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <FaTrash className="w-4 h-4 mb-1" />
                          <span className="text-xs">Delete</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <FaDownload className="w-4 h-4 mb-1" />
                          <span className="text-xs">Export</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <FaCog className="w-4 h-4 mb-1" />
                          <span className="text-xs">Manage</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSIONS_MATRIX.resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border border-gray-300 font-medium text-gray-700 bg-white">
                          {resource.name}
                        </td>
                        <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={
                              selectedPermissions[resource.id]?.includes(
                                "create"
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionChange(resource.id, "create")
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={
                              selectedPermissions[resource.id]?.includes(
                                "read"
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionChange(resource.id, "read")
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={
                              selectedPermissions[resource.id]?.includes(
                                "update"
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionChange(resource.id, "update")
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={
                              selectedPermissions[resource.id]?.includes(
                                "delete"
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionChange(resource.id, "delete")
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={
                              selectedPermissions[resource.id]?.includes(
                                "export"
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionChange(resource.id, "export")
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={
                              selectedPermissions[resource.id]?.includes(
                                "manage"
                              ) || false
                            }
                            onChange={() =>
                              handlePermissionChange(resource.id, "manage")
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 bg-white border-[1px] border-[#D1D5DB] rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#043E49] hover:bg-[#032e36] disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {loading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Employee"
                    : "Create Employee"}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error}
              </div>
            )}
          </form>
        </div>


      </div>
    </div>
  );
};

export default EmployeeForm;
