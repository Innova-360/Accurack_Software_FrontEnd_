import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import {
  deactivateEmployee,
  resetEmployeePassword,
  updateEmployeeStores,
  updateEmployeePermissions,
} from '../../store/slices/employeeSlice';
import type { EmployeeAPIData } from '../../types/employee';
import { 
  FaTimes, 
  FaUserMinus, 
  FaKey, 
  FaStore, 
  FaUserShield, 
  FaCog,
  FaPlus,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';

interface EmployeeActionsModalProps {
  employee: EmployeeAPIData | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeActionsModal: React.FC<EmployeeActionsModalProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'stores' | 'permissions' | 'actions'>('actions');
  const [loading, setLoading] = useState(false);

  // Store management state
  const [storeIds, setStoreIds] = useState<string[]>(employee?.storeIds || ['']);

  // Permissions management state
  type Permission = {
    resource: string;
    actions: string[];
    storeId: string;
  };
  const [permissions, setPermissions] = useState<Permission[]>(employee?.permissions || []);
  const [newPermission, setNewPermission] = useState<Permission>({
    resource: '',
    actions: [''],
    storeId: ''
  });

  if (!isOpen || !employee) return null;

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      setLoading(true);
      try {
        await dispatch(deactivateEmployee(employee.id!)).unwrap();
        onClose();
      } catch (error) {
        console.error('Failed to deactivate employee:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm('Are you sure you want to reset this employee\'s password?')) {
      setLoading(true);
      try {
        await dispatch(resetEmployeePassword(employee.id!)).unwrap();
        alert('Password reset email sent successfully!');
      } catch (error) {
        console.error('Failed to reset password:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateStores = async () => {
    const validStoreIds = storeIds.filter(id => id.trim() !== '');
    if (validStoreIds.length === 0) {
      alert('Please provide at least one store ID');
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateEmployeeStores({
        id: employee.id!,
        storeIds: validStoreIds
      })).unwrap();
      alert('Store assignments updated successfully!');
    } catch (error) {
      console.error('Failed to update stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    setLoading(true);
    try {
      await dispatch(updateEmployeePermissions({
        id: employee.id!,
        permissions
      })).unwrap();
      alert('Permissions updated successfully!');
    } catch (error) {
      console.error('Failed to update permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStoreField = () => {
    setStoreIds([...storeIds, '']);
  };

  const removeStoreField = (index: number) => {
    if (storeIds.length > 1) {
      setStoreIds(storeIds.filter((_, i) => i !== index));
    }
  };

  const updateStoreId = (index: number, value: string) => {
    const newStoreIds = [...storeIds];
    newStoreIds[index] = value;
    setStoreIds(newStoreIds);
  };

  const addPermission = () => {
    if (newPermission.resource && newPermission.actions[0] && newPermission.storeId) {
      setPermissions([...permissions, { ...newPermission }]);
      setNewPermission({ resource: '', actions: [''], storeId: '' });
    }
  };

  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index));
  };

  const resources = ['inventory', 'sales', 'product', 'employee', 'report'];
  const actions = ['create', 'read', 'update', 'delete'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Employee Actions - {employee.firstName} {employee.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === 'actions'
                ? 'text-[#043E49] border-b-2 border-[#043E49]'
                : 'text-gray-600 hover:text-[#043E49]'
            }`}
          >
            <FaCog className="w-4 h-4 mr-2" />
            Actions
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === 'stores'
                ? 'text-[#043E49] border-b-2 border-[#043E49]'
                : 'text-gray-600 hover:text-[#043E49]'
            }`}
          >
            <FaStore className="w-4 h-4 mr-2" />
            Store Management
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === 'permissions'
                ? 'text-[#043E49] border-b-2 border-[#043E49]'
                : 'text-gray-600 hover:text-[#043E49]'
            }`}
          >
            <FaUserShield className="w-4 h-4 mr-2" />
            Permissions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Employee Code:</span>
                  <span className="ml-2 font-medium">{employee.employeeCode}</span>
                </div>
                <div>
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2 font-medium">{employee.position}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium">{employee.department}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    employee.status === 'active' 
                      ? 'bg-[#043E49] bg-opacity-10 text-[#043E49]' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-[#043E49] text-white py-2 px-4 rounded-lg hover:bg-[#032e36] disabled:opacity-50 flex items-center justify-center"
              >
                <FaKey className="w-5 h-5 mr-2" />
                Reset Password
              </button>

              <button
                onClick={handleDeactivate}
                disabled={loading || employee.status === 'inactive'}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
              >
                <FaUserMinus className="w-5 h-5 mr-2" />
                Deactivate Employee
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Manage Store Assignments</h3>
            
            {storeIds.map((storeId, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={storeId}
                  onChange={(e) => updateStoreId(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="store-123"
                />
                {storeIds.length > 1 && (
                  <button
                    onClick={() => removeStoreField(index)}
                    className="text-red-600 hover:text-red-800 px-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addStoreField}
              className="text-[#043E49] hover:text-[#032e36] text-sm flex items-center"
            >
              <FaPlus className="inline-block mr-1" />
              Add Store
            </button>

            <button
              onClick={handleUpdateStores}
              disabled={loading}
              className="w-full bg-[#043E49] text-white py-2 px-4 rounded-lg hover:bg-[#032e36] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <FaSpinner className="animate-spin w-5 h-5 mr-2" /> : 'Update Store Assignments'}
            </button>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Manage Permissions</h3>
            
            {/* Add New Permission */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add New Permission</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <select
                  value={newPermission.resource}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, resource: e.target.value }))}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Resource</option>
                  {resources.map(resource => (
                    <option key={resource} value={resource}>{resource}</option>
                  ))}
                </select>
                
                <select
                  value={newPermission.actions[0]}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, actions: [e.target.value] }))}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Action</option>
                  {actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={newPermission.storeId}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, storeId: e.target.value }))}
                  className="border border-gray-300 rounded px-2 py-1"
                  placeholder="Store ID"
                />
              </div>
              <button
                onClick={addPermission}
                className="bg-[#043E49] text-white px-3 py-1 rounded hover:bg-[#032e36] flex items-center"
              >
                <FaPlus className="inline-block mr-1" />
                Add Permission
              </button>
            </div>

            {/* Current Permissions */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="font-medium">Current Permissions</h4>
              {permissions.map((perm, index) => (
                <div key={index} className="flex justify-between items-center bg-white border rounded p-3">
                  <div>
                    <span className="font-medium">{perm.resource}</span>
                    <span className="text-gray-500 mx-2">•</span>
                    <span className="text-[#043E49]">{perm.actions.join(', ')}</span>
                    <span className="text-gray-500 mx-2">•</span>
                    <span className="text-gray-600">{perm.storeId}</span>
                  </div>
                  <button
                    onClick={() => removePermission(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpdatePermissions}
              disabled={loading}
              className="w-full bg-[#043E49] text-white py-2 px-4 rounded-lg hover:bg-[#032e36] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <FaSpinner className="animate-spin w-5 h-5 mr-2" /> : 'Update Permissions'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeActionsModal;