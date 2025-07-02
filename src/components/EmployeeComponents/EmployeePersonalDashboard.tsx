import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchEmployeeById } from '../../store/slices/employeeSlice';
import type { EmployeeAPIData } from '../../types/employee';

const EmployeePersonalDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { storeId, employeeId } = useParams<{ storeId: string; employeeId: string }>();
  const { currentEmployee, loading, error } = useSelector(
    (state: RootState) => state.employees
  );

  console.log("EmployeePersonalDashboard - URL params:", { storeId, employeeId });
  console.log("EmployeePersonalDashboard - Current employee:", currentEmployee);

  useEffect(() => {
    if (employeeId) {
      console.log("Fetching employee by ID:", employeeId);
      dispatch(fetchEmployeeById(employeeId));
    }
  }, [dispatch, employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#043E49]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
          <p>The requested employee could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="/accuracklogo.png"
                alt="Accurack Logo"
                className="h-10 w-auto mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {currentEmployee.firstName} {currentEmployee.lastName}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentEmployee.position} • {currentEmployee.department}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentEmployee.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentEmployee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Employee Code</label>
                <p className="text-gray-900">{currentEmployee.employeeCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{currentEmployee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{currentEmployee.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Position</label>
                <p className="text-gray-900">{currentEmployee.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Department</label>
                <p className="text-gray-900">{currentEmployee.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-900">{currentEmployee.role}</p>
              </div>
            </div>
          </div>

          {/* Permissions Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-2">
              {currentEmployee.permissions && currentEmployee.permissions.length > 0 ? (
                currentEmployee.permissions.map((permission, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{permission.resource}</span>
                    <div className="flex space-x-1">
                      {permission.actions?.map((action, actionIndex) => (
                        <span
                          key={actionIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No permissions assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Inventory Access */}
            {currentEmployee.permissions?.some(p => p.resource === 'inventory') && (
              <a
                href={`/store/${storeId}/inventory`}
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Inventory</p>
                  <p className="text-sm text-gray-600">Manage products</p>
                </div>
              </a>
            )}

            {/* Sales Access */}
            {currentEmployee.permissions?.some(p => p.resource === 'sales') && (
              <a
                href={`/store/${storeId}/sales`}
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sales</p>
                  <p className="text-sm text-gray-600">Process sales</p>
                </div>
              </a>
            )}

            {/* Customer Access */}
            {currentEmployee.permissions?.some(p => p.resource === 'customer') && (
              <a
                href={`/store/${storeId}/customer`}
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Customers</p>
                  <p className="text-sm text-gray-600">Manage customers</p>
                </div>
              </a>
            )}

            {/* Supplier Access */}
            {currentEmployee.permissions?.some(p => p.resource === 'supplier') && (
              <a
                href={`/store/${storeId}/supplier`}
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Suppliers</p>
                  <p className="text-sm text-gray-600">Manage suppliers</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePersonalDashboard;
