import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmployeeForm';
import EmployeeInviteModal from './EmployeeInviteModal';
import EmployeeActionsModal from './EmployeeActionsModal';
import EmployeePermissionsModal from './EmployeePermissionsModal';
import RoleTemplateManagement from './RoleTemplateManagement';
import type { EmployeeAPIData } from '../../types/employee';

type ViewMode = 'dashboard' | 'create' | 'edit' | 'roles';

const EmployeeDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error, pagination } = useSelector(
    (state: RootState) => state.employees
  );

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAPIData | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEmployees({ 
      storeId: undefined, 
      page: currentPage, 
      limit: 10 
    }));
  }, [dispatch, currentPage]);

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setCurrentView('create');
  };

  const handleEditEmployee = (employee: EmployeeAPIData) => {
    setSelectedEmployee(employee);
    setCurrentView('edit');
  };

  const handleViewPermissions = (employee: EmployeeAPIData) => {
    setSelectedEmployee(employee);
    setShowPermissionsModal(true);
  };

  const handleEmployeeActions = (employee: EmployeeAPIData) => {
    setSelectedEmployee(employee);
    setShowActionsModal(true);
  };

  const handleFormSubmit = () => {
    setCurrentView('dashboard');
    setSelectedEmployee(null);
    // Refresh the employee list
    dispatch(fetchEmployees({ 
      storeId: undefined, 
      page: currentPage, 
      limit: 10 
    }));
  };

  const handleFormCancel = () => {
    setCurrentView('dashboard');
    setSelectedEmployee(null);
  };

  const renderStats = () => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
    const totalStores = new Set(employees.flatMap(emp => emp.storeIds)).size;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-[#043E49]">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-[#043E49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-[#043E49]">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-[#043E49]">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveEmployees}</p>
            </div>
          </div>
        </div>

       
      </div>
    );
  };

  const renderNavigation = () => (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setCurrentView('dashboard')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'dashboard'
            ? 'bg-white text-[#043E49] shadow-sm'
            : 'text-[#043E49] hover:text-gray-900'
        }`}
      >
        Employee Management
      </button>
      <button
        onClick={() => setCurrentView('roles')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'roles'
            ? 'bg-white text-[#043E49] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Role Templates
      </button>
    </div>
  );

  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-3 mb-6">
      <button
        onClick={handleCreateEmployee}
        className="bg-[#043E49] text-white px-4 py-2 rounded-lg hover:bg-[#043E49] transition-colors flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Employee
      </button>
      
      {/* <button
        onClick={() => setShowInviteModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Invite Employee
      </button> */}
    </div>
  );

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === page
                    ? 'bg-[#043E49] text-white border-[#043E49]'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
            disabled={currentPage === pagination.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#043E49]">Employee & Role Management</h1>
          <p className="text-gray-600 mt-2">Manage your employees, roles, and permissions</p>
        </div>

        {renderNavigation()}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {currentView === 'dashboard' && (
          <>
            {renderStats()}
            {renderActionButtons()}
            <EmployeeTable
              employees={employees}
              loading={loading}
              onEdit={handleEditEmployee}
              onViewPermissions={handleViewPermissions}
              onActions={handleEmployeeActions}
            />
            {renderPagination()}
          </>
        )}

        {currentView === 'create' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Create New Employee</h2>
            <EmployeeForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isEditMode={false}
            />
          </div>
        )}

        {currentView === 'edit' && selectedEmployee && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
            <EmployeeForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              initialData={selectedEmployee}
              isEditMode={true}
            />
          </div>
        )}

        {currentView === 'roles' && <RoleTemplateManagement />}

        {/* Modals */}
        <EmployeeInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />

        <EmployeeActionsModal
          employee={selectedEmployee}
          isOpen={showActionsModal}
          onClose={() => setShowActionsModal(false)}
        />

        <EmployeePermissionsModal
          employee={selectedEmployee}
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;