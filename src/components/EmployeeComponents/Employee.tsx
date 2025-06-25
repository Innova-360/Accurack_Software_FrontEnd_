import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
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
  FaUsers
} from 'react-icons/fa';
import { fetchEmployees, deleteEmployee } from '../../store/slices/employeeSlice';
import type { EmployeeAPIData } from '../../types/employee';

interface PermissionsProps {
  showHeader?: boolean;
  onEditEmployee?: (employeeData: any) => void;
  onAddEmployee?: () => void;
  onViewPermissions?: (employee: EmployeeAPIData) => void;
}

const Permissions: React.FC<PermissionsProps> = ({ 
  showHeader = true, 
  onEditEmployee, 
  onAddEmployee,
  onViewPermissions 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error } = useSelector((state: RootState) => state.employees);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch employees on component mount
  useEffect(() => {
    console.log('Fetching employees...', { storeId: undefined, page: currentPage, limit: itemsPerPage });
    dispatch(fetchEmployees({ 
      storeId: undefined, 
      page: currentPage, 
      limit: itemsPerPage 
    }));
  }, [dispatch, currentPage]);

  // Debug employees data when it changes
  useEffect(() => {
    console.log('Employees data updated:', employees);
    if (employees && employees.length > 0) {
      console.log('First employee sample:', employees[0]);
      console.log('All employee statuses:', employees.map(emp => ({
        id: emp.id,
        status: emp.status,
        statusType: typeof emp.status
      })));
    }
  }, [employees]);

  // Debug: Log employees data
  useEffect(() => {
    console.log('Employees state:', { employees, loading, error });
  }, [employees, loading, error]);

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`;
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  console.log('Paginated employees:', paginatedEmployees);
  const getRoleIcon = (roleName: string) => {
    console.log(roleName, 'Role name received in getRoleIcon');
    switch (roleName.toLowerCase()) {
      case 'administrator':
        return <FaUserShield className="w-5 h-5 text-red-600" />;
      case 'store manager':
        return <FaUserTie className="w-5 h-5 text-blue-600" />;
      case 'sales associate':
        return <FaUser className="w-5 h-5 text-green-600" />;
      case 'inventory specialist':
        return <FaBoxes className="w-5 h-5 text-orange-600" />;
      case 'analytics viewer':
        return <FaChartLine className="w-5 h-5 text-purple-600" />;
      case 'cashier':
        return <FaCashRegister className="w-5 h-5 text-indigo-600" />;
      default:
        return <FaUsers className="w-5 h-5 text-gray-600" />;
    }
  };

  // Convert employee data to employee form data for editing
  const convertEmployeeToFormData = (employee: EmployeeAPIData) => {
    return {
      id: employee?.id,
      firstName: employee?.firstName,
      lastName: employee?.lastName,
      role: employee?.role,
      status: employee?.status,
      employeeCode: employee?.employeeCode,
      position: employee?.position,
      department: employee?.department,
      phone: employee?.phone,
      email: employee?.email,
      joiningDate: employee?.joiningDate,
      password: '', // Empty for security
      permissions: employee?.permissions || []
    };
  };

  const handleEditEmployee = (employee: EmployeeAPIData) => {
    if (onEditEmployee) {
      const employeeData = convertEmployeeToFormData(employee);
      onEditEmployee(employeeData);
    }
  };

  const handleViewPermissions = (employee: EmployeeAPIData) => {
    if (onViewPermissions) {
      onViewPermissions(employee);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await dispatch(deleteEmployee(employeeId)).unwrap();
        // Refresh the list
        dispatch(fetchEmployees({ 
          storeId: undefined, 
          page: currentPage, 
          limit: itemsPerPage 
        }));
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPermissionCount = (permissions: any) => {
    if (!permissions || !Array.isArray(permissions)) return 0;
    return permissions.reduce((count, perm) => count + (perm.actions?.length || 0), 0); // Changed from 'action' to 'actions'
  };return (
    <div className={`${showHeader ? 'p-6 bg-gray-50 min-h-screen' : ''}`}>
      <div className="max-w-full mx-auto">
        {/* Header - only show if showHeader is true */}
        {showHeader && (
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                <p className="text-gray-600 mt-1">Manage access rights for users and roles across stores.</p>
              </div>
              <button 
                onClick={onAddEmployee}
                className="lg:inline-flex lg:items-center lg:px-6 lg:py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors"
              >
                <FaPlus className="w-4 h-4 lg:mr-2" />
                Add Role
              </button>
            </div>
          </div>
        )}{/* Filters */}
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

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[120px]"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>        
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Role Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Employee Name</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Employee ID</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Created Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Permissions</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees?.map((employee) => {
                    // Debug logging for employee status
                    console.log('Employee data:', employee);
                    console.log('Employee status:', employee?.status);
                    console.log('Employee status type:', typeof employee?.status);
                    console.log('Status field debug:', {
                      status: employee?.status,
                      statusType: typeof employee?.status,
                      isString: typeof employee?.status === 'string',
                      hasLowerCase: employee?.status && typeof employee?.status?.toLowerCase === 'function'
                    });
                    
                    return (
                    <tr key={employee?.id} className="hover:bg-gray-50">
                      {/* Role Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getRoleIcon(employee?.role+'hello role')}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{employee?.role}</span>
                        </div>
                      </td>

                      {/* Employee Name */}
                      <td className="py-4 px-4">
                        <span className="text-gray-600 text-sm">{`${employee?.firstName} ${employee?.lastName}`}</span>
                      </td>

                      {/* Employee ID */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-600 text-sm font-medium">{employee?.employeeCode}</span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-600 text-sm">{formatDate(employee?.joiningDate)}</span>
                      </td>

                      {/* Permissions */}
                      <td className="py-4 px-4">
                        <div className="flex justify-center items-center space-x-1">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {getPermissionCount(employee?.permissions)} permissions
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          employee?.status && typeof employee?.status === 'string' && employee?.status?.toLowerCase() === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee?.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => handleViewPermissions(employee)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Permissions"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Edit Employee"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee?.id!)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete Employee"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEmployees?.length)} of {filteredEmployees?.length} results
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded ${
                      currentPage === page
                        ? 'bg-[#45b14562] text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
