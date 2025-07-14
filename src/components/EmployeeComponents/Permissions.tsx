import React, { useState } from "react";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUser,
  FaUserShield,
  FaUserTie,
  FaCashRegister,
  FaBoxes,
  FaChartLine,
  FaUsers,
  FaCog,
} from "react-icons/fa";

interface Permission {
  id: string;
  name: string;
  icon: React.ReactElement;
}

interface Role {
  id: string;
  name: string;
  employeeName: string;
  employeeId: string;
  avatars: string[];
  createdDate: string;
  permissions: Permission[];
  status: "Active" | "Inactive";
}

interface PermissionsProps {
  showHeader?: boolean;
  onEditEmployee?: (roleData: any) => void; // Function to handle edit action
}

const PERMISSIONS: Permission[] = [
  {
    id: "create",
    name: "Create",
    icon: <FaPlus className="w-4 h-4 text-green-600" />,
  },
  {
    id: "read",
    name: "Read",
    icon: <FaEye className="w-4 h-4 text-blue-600" />,
  },
  {
    id: "update",
    name: "Update",
    icon: <FaEdit className="w-4 h-4 text-orange-600" />,
  },
  {
    id: "delete",
    name: "Delete",
    icon: <FaTrash className="w-4 h-4 text-red-600" />,
  },
  {
    id: "export",
    name: "Export",
    icon: <FaChartLine className="w-4 h-4 text-purple-600" />,
  },
  {
    id: "manage",
    name: "Manage",
    icon: <FaUserShield className="w-4 h-4 text-indigo-600" />,
  },
];

const MOCK_ROLES: Role[] = [
  {
    id: "1",
    name: "Administrator",
    employeeName: "John Smith",
    employeeId: "EMP-001",
    avatars: ["👤"],
    createdDate: "May 12, 2023",
    permissions: PERMISSIONS.slice(0, 4),
    status: "Active",
  },
  {
    id: "2",
    name: "Store Manager",
    employeeName: "Sarah Johnson",
    employeeId: "EMP-002",
    avatars: ["👤"],
    createdDate: "Jun 24, 2023",
    permissions: PERMISSIONS.slice(0, 4),
    status: "Active",
  },
  {
    id: "3",
    name: "Sales Associate",
    employeeName: "Mike Wilson",
    employeeId: "EMP-003",
    avatars: ["👤"],
    createdDate: "Jul 05, 2023",
    permissions: PERMISSIONS.slice(0, 4),
    status: "Active",
  },
  {
    id: "4",
    name: "Inventory Specialist",
    employeeName: "Lisa Davis",
    employeeId: "EMP-004",
    avatars: ["👤"],
    createdDate: "Aug 18, 2023",
    permissions: PERMISSIONS.slice(0, 4),
    status: "Active",
  },
  {
    id: "5",
    name: "Analytics Viewer",
    employeeName: "David Brown",
    employeeId: "EMP-005",
    avatars: ["👤"],
    createdDate: "Sep 02, 2023",
    permissions: PERMISSIONS.slice(0, 4),
    status: "Inactive",
  },
  {
    id: "6",
    name: "Cashier",
    employeeName: "Emily Taylor",
    employeeId: "EMP-006",
    avatars: ["👤"],
    createdDate: "Oct 15, 2023",
    permissions: PERMISSIONS.slice(0, 4),
    status: "Active",
  },
];

const Permissions: React.FC<PermissionsProps> = ({
  showHeader = true,
  onEditEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const filteredRoles = MOCK_ROLES.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "administrator":
        return <FaUserShield className="w-5 h-5 text-red-600 " />;
      case "store manager":
        return <FaUserTie className="w-5 h-5 text-blue-600" />;
      case "sales associate":
        return <FaUser className="w-5 h-5 text-green-600" />;
      case "inventory specialist":
        return <FaBoxes className="w-5 h-5 text-orange-600" />;
      case "analytics viewer":
        return <FaChartLine className="w-5 h-5 text-purple-600" />;
      case "cashier":
        return <FaCashRegister className="w-5 h-5 text-indigo-600" />;
      default:
        return <FaUsers className="w-5 h-5 text-gray-600" />;
    }
  };

  // Convert role data to employee form data for editing
  const convertRoleToEmployeeData = (role: Role) => {
    // Convert permissions array to object format expected by EmployeeForm
    const permissionsObject = role.permissions.reduce(
      (acc, permission) => {
        const resourceName = "inventory"; // Default resource for demo
        if (!acc[resourceName]) {
          acc[resourceName] = {};
        }
        acc[resourceName][permission.id] = true;
        return acc;
      },
      {} as Record<string, Record<string, boolean>>
    );

    return {
      id: role.id,
      firstName: role.name.split(" ")[0] || "",
      lastName: role.name.split(" ").slice(1).join(" ") || "",
      role: role.name,
      status: role.status.toLowerCase(),
      employeeCode: `EMP-${role.id.padStart(3, "0")}`,
      position: role.name,
      department: "Operations", // Default department
      phone: "+1234567890", // Default phone
      email: `${role.name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
      // joiningDate: '2023-01-01', // Default joining date
      password: "", // Empty for security
      permissions: permissionsObject,
    };
  };

  const handleEditRole = (role: Role) => {
    if (onEditEmployee) {
      const employeeData = convertRoleToEmployeeData(role);
      onEditEmployee(employeeData);
    }
  };
  return (
    <div className={`${showHeader ? "p-6 bg-gray-50 min-h-screen" : ""}`}>
      <div className="max-w-full mx-auto">
        {/* Header - only show if showHeader is true */}
        {showHeader && (
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Roles & Permissions
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage access rights for users and roles across stores.
                </p>
              </div>
              <button className="lg:inline-flex lg:items-center lg:px-6 lg:py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors">
                <FaPlus className="w-4 h-4 lg:mr-2" />
                Add Role
              </button>
            </div>
          </div>
        )}
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* <div className="relative">
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[120px]"
            >
              <option>All Stores</option>
              <option>Main Store</option>
              <option>Branch Store</option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
          </div> */}

          {/* <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[120px]"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
          </div> */}
        </div>
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {" "}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    Role Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    Employee Name
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">
                    Employee ID
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">
                    Created Date
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">
                    Permissions
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    {" "}
                    {/* Role Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getRoleIcon(role.name)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    {/* Employee Name */}
                    <td className="py-4 px-4">
                      <span className="text-gray-600 text-sm">
                        {role.employeeName}
                      </span>
                    </td>
                    {/* Employee ID */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {role.employeeId}
                      </span>
                    </td>
                    {/* Created Date */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600 text-sm">
                        {role.createdDate}
                      </span>
                    </td>
                    {/* Permissions */}
                    <td className="py-4 px-4">
                      <div className="flex justify-center items-center space-x-2">
                        {role.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex-shrink-0"
                            title={permission.name}
                          >
                            {permission.icon}
                          </div>
                        ))}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          role.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {role.status}
                      </span>
                    </td>{" "}
                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-1">
                        <button
                          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Edit Role"
                          onClick={() => handleEditRole(role)}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredRoles.length)} of{" "}
                {filteredRoles.length} results
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded ${
                        currentPage === page
                          ? "bg-[#45b14562] text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
