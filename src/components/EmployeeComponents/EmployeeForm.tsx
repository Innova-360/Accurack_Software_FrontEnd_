import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
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
  FaTimes,
  FaRocket,
  FaKey,
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
    name: "",
    description: "",
    isDefault: false,
    priority: 0,
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
        scope: "store",
      }));

    const rolePayload = {
      ...newRoleData,
      permissions,
    };

    try {
      const newRole = await dispatch(createRoleTemplate(rolePayload)).unwrap();
      await dispatch(fetchRoleTemplates());
      setFormData((prev) => ({ ...prev, roleTemplateId: newRole.id }));
      setShowCreateRole(false);
      setNewRoleData({
        name: "",
        description: "",
        isDefault: false,
        priority: 0,
      });
    } catch (error) {
      console.error("Failed to create role:", error);
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
        console.log("Create data being sent:", submitData);
        console.log(
          "Password being sent:",
          formData.password || "TempPassword123!"
        );

        // Creating new employee
        const result = await dispatch(createEmployee(submitData)).unwrap();
        console.log("Employee creation result:", result);
        console.log(
          "Employee ID from result:",
          result.id || result.data?.id || result.employee?.id
        );

        // Send email invite after employee creation with login credentials
        try {
          const employeeId =
            result.id || result.data?.id || result.employee?.id;
          const invitePayload = {
            employeeId: employeeId,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            password: formData.password || "TempPassword123!", // Send temp password if none provided
            storeId: id,
            employeeCode: formData.employeeCode,
            position: formData.position,
            department: formData.department,
            // Include login URL for employee
            loginUrl: `${window.location.origin}/login`,
            dashboardUrl: `${window.location.origin}/store/${id}/employee/${employeeId}`,
            // Additional info for email template
            storeName: "Your Store", // You can get this from store context if available
            companyName: "Accurack",
          };

          console.log("Sending invitation email with payload:", invitePayload);
          console.log("Email credentials that will be sent:");
          console.log("- Email:", formData.email);
          console.log("- Password:", formData.password || "TempPassword123!");
          console.log("- Employee ID:", employeeId);
          console.log("- Store ID:", id);

          await apiClient.post("/employees/invite", invitePayload);
          console.log("Email invite sent successfully with login credentials");

          // Verify that employee was created properly for login
          try {
            console.log("Verifying employee creation for login...");
            const verifyResponse = await apiClient.get(
              `/employees/${employeeId}`
            );
            console.log("Employee verification response:", verifyResponse.data);

            if (
              verifyResponse.data &&
              verifyResponse.data.status === "active"
            ) {
              console.log("Employee is active and ready for login");
            } else {
              console.warn(
                "Employee created but may not be active:",
                verifyResponse.data
              );
            }
          } catch (verifyError) {
            console.error("Failed to verify employee creation:", verifyError);
          }

          toast.success(
            "Employee created and invitation email sent successfully!"
          );
        } catch (inviteError) {
          console.error("Failed to send email invite:", inviteError);
          // toast.error('Employee created but failed to send invitation email');
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6fa] to-[#e8eaf6]">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* <img
                src="/accuracklogo.png"
                alt="Accurack Logo"
                className="h-10 w-auto mr-4"
              /> */}
              <div>
                <h1 className="text-2xl font-bold text-[#043E49]">
                  {isEditMode ? "Edit Employee" : "Create New Employee"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Update employee information and permissions"
                    : "Add a new team member with specific permissions"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-[#043E49] bg-white border border-[#043E49] rounded-lg hover:bg-[#043E49] hover:text-white transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-[#043E49] to-[#0a5d5c] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#043E49] font-semibold text-sm">
                    1
                  </div>
                  <span className="ml-2 text-white font-medium">
                    Personal Info
                  </span>
                </div>
                <div className="w-16 h-0.5 bg-white opacity-30"></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#043E49] to-[#0a5d5c] rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#043E49]">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Password - only for new employees */}
                {!isEditMode && (
                  <div className="lg:col-span-2 space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Employee Information Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#043E49] to-[#0a5d5c] rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#043E49]">
                  Employee Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Employee Code */}
                <div className="space-y-2">
                  <label
                    htmlFor="employeeCode"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Employee Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="employeeCode"
                      name="employeeCode"
                      value={formData.employeeCode}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Auto-generated"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <FaKey className="w-3 h-3 mr-1" />
                    Auto-generated 6-digit code
                  </p>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label
                    htmlFor="position"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                    placeholder="e.g. Sales Manager"
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label
                    htmlFor="department"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49]"
                    placeholder="e.g. Sales"
                    required
                  />
                </div>

                {/* Role Template */}
                <div className="md:col-span-2 lg:col-span-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="roleTemplateId"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Role <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCreateRole(!showCreateRole)}
                      className="bg-gradient-to-r from-[#043E49] to-[#0a5d5c] hover:from-[#032e36] hover:to-[#084847] text-white text-xs font-medium px-6 py-1.5 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      {showCreateRole ? (
                        <>
                          <FaTimes className="w-3 h-3 mr-1" />
                          Cancel
                        </>
                      ) : (
                        <div className="flex justify-center items-center space-x-1">
                          <FaPlus className="w-3 h-3 " />
                          <span>Add Role</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {!showCreateRole ? (
                    <select
                      id="roleTemplateId"
                      name="roleTemplateId"
                      value={formData.roleTemplateId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49] bg-white"
                      required
                    >
                      <option value="" disabled>
                        Select a role
                      </option>
                      {roleTemplatesLoading && (
                        <option>Loading roles...</option>
                      )}
                      {roleTemplates &&
                        roleTemplates.map((role: any) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <div className="bg-white border-2 border-[#043E49] rounded-xl p-4 space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Role Name"
                          value={newRoleData.name}
                          onChange={(e) =>
                            setNewRoleData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Role Description"
                          value={newRoleData.description}
                          onChange={(e) =>
                            setNewRoleData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={newRoleData.isDefault}
                            onChange={(e) =>
                              setNewRoleData((prev) => ({
                                ...prev,
                                isDefault: e.target.checked,
                              }))
                            }
                            className="mr-2 h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
                          />
                          Default Role
                        </label>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">
                            Priority:
                          </label>
                          <input
                            type="number"
                            value={newRoleData.priority}
                            onChange={(e) =>
                              setNewRoleData((prev) => ({
                                ...prev,
                                priority: parseInt(e.target.value),
                              }))
                            }
                            className="w-16 px-2 py-1 border-2 border-gray-200 rounded-lg focus:ring-[#043E49] focus:border-[#043E49]"
                            min="0"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateRole}
                        className="w-full bg-[#043E49] text-white py-3 rounded-lg hover:bg-[#032e36] transition-all duration-200 font-medium flex items-center justify-center"
                      >
                        <FaRocket className="w-4 h-4 mr-2" />
                        Create Role
                      </button>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043E49] focus:border-transparent transition-all duration-200 hover:border-[#043E49] bg-white"
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
                {showCreateRole
                  ? "Role Permissions (will be saved with role)"
                  : "Employee Permissions"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {showCreateRole
                  ? "These permissions will be included when creating the new role."
                  : "Select which actions this employee can perform on each resource."}
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
                            className="h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
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
                            className="h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
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
                            className="h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
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
                            className="h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
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
                            className="h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
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
                            className="h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
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
                className="px-6 py-2 text-gray-700 bg-white border-[1px] border-[#D1D5DB] rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#043E49] focus:border-[#043E49] transition-colors"
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
