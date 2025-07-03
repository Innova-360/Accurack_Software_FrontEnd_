import React from 'react';
import { FaTimes, FaUserShield, FaUser, FaEye } from 'react-icons/fa';
import type { EmployeeAPIData } from '../../types/employee';

interface EmployeePermissionsModalProps {
  employee: EmployeeAPIData | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeePermissionsModal: React.FC<EmployeePermissionsModalProps> = ({
  employee,
  isOpen,
  onClose
}) => {
  if (!isOpen || !employee) return null;

  const getPermissionBadgeColor = () => {
    // Use only approved colors - dark green and white
    return 'bg-[#043E49] bg-opacity-10 text-[#043E49]';
  };

  return (
    <div className="fixed inset-0 backdrop-filter backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaUser className="w-8 h-8 text-[#043E49]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Employee Permissions
              </h2>
              <p className="text-sm text-gray-600">
                {employee.firstName} {employee.lastName} 
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Employee Info */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Role:</span>
                <span className="ml-2 text-gray-600">{employee.role}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Department:</span>
                <span className="ml-2 text-gray-600">{employee.department}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  employee.status.toLowerCase() === 'active'
                    ? 'bg-[#043E49] bg-opacity-10 text-[white]'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {employee.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-600">{employee.email}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaUserShield className="w-5 h-5 mr-2 text-[#043E49]" />
              Permissions
            </h3>
            
            {employee.permissions && employee.permissions.length > 0 ? (
              <div className="space-y-4">
                {employee.permissions.map((permission, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {permission.resource}
                      </h4>
                      
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {permission.actions.map((action) => ( // Changed from 'action' to 'actions'
                        <span
                          key={action}
                          className={`inline-flex text-white items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionBadgeColor()}`}
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaEye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No permissions assigned</p>
              </div>
            )}
          </div>
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#043E49] hover:bg-[#032e36] text-white font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default EmployeePermissionsModal;
