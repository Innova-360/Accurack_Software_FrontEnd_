import React, { useState } from "react";
import {
  FaEdit,
  FaEye,
  FaCog,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaUser,
  FaSpinner,
} from "react-icons/fa";
import type { EmployeeAPIData } from "../../types/employee";

interface EmployeeTableProps {
  employees: EmployeeAPIData[];
  loading: boolean;
  onEdit: (employee: EmployeeAPIData) => void;
  onViewPermissions: (employee: EmployeeAPIData) => void;
  onActions: (employee: EmployeeAPIData) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  onEdit,
  onViewPermissions,
  onActions,
}) => {
  const [sortField, setSortField] =
    useState<keyof EmployeeAPIData>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (field: keyof EmployeeAPIData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedEmployees = React.useMemo(() => {
    let filtered = employees.filter(
      (employee) =>
        (employee.firstName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (employee.lastName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (employee.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (employee.employeeCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (employee.position || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (employee.department || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [employees, searchTerm, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: keyof EmployeeAPIData }) => {
    if (sortField !== field) {
      return <FaSort className="w-4 h-4 text-gray-400" />;
    }

    return sortDirection === "asc" ? (
      <FaSortUp className="w-4 h-4 text-[#043E49]" />
    ) : (
      <FaSortDown className="w-4 h-4 text-[#043E49]" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-[#043E49]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
              {/* <th
                onClick={() => handleSort('employeeCode')}
                className="px-6 py-3  text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                 <div className="flex items-center space-x-1">
                  <span>Employee Code</span>
                  <SortIcon field="employeeCode" />
                </div> *
              </th> */}
              <th
                onClick={() => handleSort("firstName")}
                className="px-6 py-3  text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1 ">
                  <span>Name</span>
                  <SortIcon field="firstName" />
                </div>
              </th>
              <th
                onClick={() => handleSort("email")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th
                onClick={() => handleSort("position")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Position</span>
                  <SortIcon field="position" />
                </div>
              </th>
              <th
                onClick={() => handleSort("department")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Department</span>
                  <SortIcon field="department" />
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stores
              </th> */}
              <th className="px-6 py-3 mr-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#043E49] bg-opacity-10 flex items-center justify-center">
                        <FaUser className="text-[white] w-5 h-5" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName || ""} {employee.lastName || ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.phone || ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.email || ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position || ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department || ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === "active"
                        ? "bg-[#043E49] bg-opacity-10 text-[white]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(employee)}
                      className="text-[#043E49] hover:text-white bg-white hover:bg-[#043E49] border border-[#043E49] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center"
                      title="Edit Employee"
                    >
                      <FaEdit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => onViewPermissions(employee)}
                      className="text-[#043E49] hover:text-white bg-white hover:bg-[#043E49] border border-[#043E49] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center"
                      title="View Permissions"
                    >
                      <FaEye className="w-3 h-3 mr-1" />
                      Permissions
                    </button>
                    <button
                      onClick={() => onActions(employee)}
                      className="text-[#043E49] hover:text-white bg-white hover:bg-[#043E49] border border-[#043E49] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center"
                      title="More Actions"
                    >
                      <FaCog className="w-3 h-3 mr-1" />
                      Actions
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedEmployees.length === 0 && (
        <div className="text-center py-12">
          <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No employees found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria."
              : "Get started by adding a new employee."}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
