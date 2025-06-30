import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchRoleTemplates,
  createRoleTemplate,
  updateRoleTemplate,
  deleteRoleTemplate,
  assignRoleTemplateToUsers,
} from '../../store/slices/employeeSlice';
import type { RoleTemplate } from '../../types/employee';

const RoleTemplateManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roleTemplates, roleTemplatesLoading, roleTemplatesError } = useSelector(
    (state: RootState) => state.employees
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoleTemplate | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);

  useEffect(() => {
    dispatch(fetchRoleTemplates());
  }, [dispatch]);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: RoleTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role template?')) {
      await dispatch(deleteRoleTemplate(id));
    }
  };

  const handleAssignTemplate = (template: RoleTemplate) => {
    setSelectedTemplate(template);
    setShowAssignModal(true);
  };

  if (roleTemplatesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Role Templates</h2>
        <button
          onClick={handleCreateTemplate}
          className="bg-[#043E49] text-white px-4 py-2 rounded-lg hover:bg-[#043E49] transition-colors"
        >
          Create Template
        </button>
      </div>

      {roleTemplatesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {roleTemplatesError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 border-[#E5E7EB] ">
        {roleTemplates.map((template) => (
          <div key={template.id} className="border-[#E5E7EB] rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
            
            <div className="mb-3">
              <span className="text-xs font-medium text-gray-500">Permissions:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {template.permissions.slice(0, 3).map((perm, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {perm.resource}:{perm.action}
                  </span>
                ))}
                {template.permissions.length > 3 && (
                  <span className="text-gray-500 text-xs">+{template.permissions.length - 3} more</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs ${
                template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => handleAssignTemplate(template)}
                className=" text-white px-3 py-1 rounded text-sm bg-[#043E49] transition-colors disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <RoleTemplateModal
          template={editingTemplate}
          onClose={() => setShowCreateModal(false)}
          onSave={(templateData) => {
            if (editingTemplate) {
              dispatch(updateRoleTemplate({ id: editingTemplate.id, templateData }));
            } else {
              dispatch(createRoleTemplate(templateData));
            }
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedTemplate && (
        <AssignTemplateModal
          template={selectedTemplate}
          onClose={() => setShowAssignModal(false)}
          onAssign={(userIds, storeId) => {
            dispatch(assignRoleTemplateToUsers({
              userIds,
              roleTemplateId: selectedTemplate.id,
              storeId
            }));
            setShowAssignModal(false);
          }}
        />
      )}
    </div>
  );
};

// Role Template Modal Component
const RoleTemplateModal: React.FC<{
  template: RoleTemplate | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ template, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    permissions: template?.permissions || [],
    isDefault: template?.isDefault || false,
    priority: template?.priority || 0,
  });

  const [newPermission, setNewPermission] = useState({
    resource: '',
    action: '',
    scope: 'store'
  });

  const resources = ['inventory', 'sales', 'product', 'employee', 'report'];
  const actions = ['create', 'read', 'update', 'delete'];

  const handleAddPermission = () => {
    if (newPermission.resource && newPermission.action) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, { ...newPermission }]
      }));
      setNewPermission({ resource: '', action: '', scope: 'store' });
    }
  };

  const handleRemovePermission = (index: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {template ? 'Edit Role Template' : 'Create Role Template'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="border rounded-lg p-3 mb-3">
              <div className="grid grid-cols-3 gap-2 mb-2">
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
                  value={newPermission.action}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, action: e.target.value }))}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Action</option>
                  {actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPermission}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.permissions.map((perm, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{perm.resource}:{perm.action} ({perm.scope})</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePermission(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="mr-2"
              />
              Default Template
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-20 border border-gray-300 rounded px-2 py-1"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assign Template Modal Component
const AssignTemplateModal: React.FC<{
  template: RoleTemplate;
  onClose: () => void;
  onAssign: (userIds: string[], storeId: string) => void;
}> = ({ template, onClose, onAssign }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [storeId, setStoreId] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length > 0 && storeId) {
      onAssign(selectedUsers, storeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Assign Role Template</h3>
        <p className="text-gray-600 mb-4">Assigning: <strong>{template.name}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter store ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User IDs</label>
            <textarea
              value={selectedUsers.join(', ')}
              onChange={(e) => setSelectedUsers(e.target.value.split(',').map(id => id.trim()).filter(id => id))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user IDs separated by commas"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedUsers.length === 0 || !storeId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Assign ({selectedUsers.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleTemplateManagement;