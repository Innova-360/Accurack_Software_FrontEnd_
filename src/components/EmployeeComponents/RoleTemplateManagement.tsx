import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchRoleTemplates,
  createRoleTemplate,
  updateRoleTemplate,
  deleteRoleTemplate,
  assignRoleTemplateToUsers,
} from "../../store/slices/employeeSlice";
import type { RoleTemplate } from "../../types/employee";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaSpinner,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const RoleTemplateManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roleTemplates, roleTemplatesLoading, roleTemplatesError } =
    useSelector((state: RootState) => state.employees);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoleTemplate | null>(
    null
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(
    null
  );

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
    if (window.confirm("Are you sure you want to delete this role template?")) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#043E49]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#043E49]">
              Role Templates
            </h2>
            <p className="text-gray-600 mt-1">
              Create and manage role templates for your employees
            </p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="bg-[#043E49] text-white px-4 py-2 rounded-lg hover:bg-[#032e36] transition-colors flex items-center"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      <div className="p-6">
        {roleTemplatesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {roleTemplatesError}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roleTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-[#043E49]">
                  {template.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-[#043E49] hover:text-[#032e36] p-1"
                    title="Edit"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {template.description}
              </p>

              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Permissions
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.permissions.slice(0, 3).map((perm, idx) => (
                    <span
                      key={idx}
                      className="bg-[#043E49] bg-opacity-10 text-[#043E49] px-2 py-1 rounded text-xs font-medium"
                    >
                      {perm.resource}:{perm.action}
                    </span>
                  ))}
                  {template.permissions.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{template.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    template.isActive
                      ? "bg-[#043E49] bg-opacity-10 text-[white]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {template.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => handleAssignTemplate(template)}
                  className="bg-[#043E49] text-white px-3 py-1 rounded text-sm hover:bg-[#032e36] transition-colors flex items-center"
                >
                  <FaUsers className="w-3 h-3 mr-1" />
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <RoleTemplateModal
          template={editingTemplate}
          onClose={() => setShowCreateModal(false)}
          onSave={(templateData) => {
            if (editingTemplate) {
              dispatch(
                updateRoleTemplate({ id: editingTemplate.id, templateData })
              );
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
            dispatch(
              assignRoleTemplateToUsers({
                userIds,
                roleTemplateId: selectedTemplate.id,
                storeId,
              })
            );
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
    name: template?.name || "",
    description: template?.description || "",
    permissions: template?.permissions || [],
    isDefault: template?.isDefault || false,
    priority: template?.priority || 0,
  });

  const [newPermission, setNewPermission] = useState({
    resource: "",
    action: "",
    scope: "store",
  });

  const resources = ["inventory", "sales", "product", "employee", "report"];
  const actions = ["create", "read", "update", "delete"];

  const handleAddPermission = () => {
    if (newPermission.resource && newPermission.action) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, { ...newPermission }],
      }));
      setNewPermission({ resource: "", action: "", scope: "store" });
    }
  };

  const handleRemovePermission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#043E49]">
            {template ? "Edit Role Template" : "Create Role Template"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="border border-gray-300 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <select
                  value={newPermission.resource}
                  onChange={(e) =>
                    setNewPermission((prev) => ({
                      ...prev,
                      resource: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
                >
                  <option value="">Select Resource</option>
                  {resources.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
                <select
                  value={newPermission.action}
                  onChange={(e) =>
                    setNewPermission((prev) => ({
                      ...prev,
                      action: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
                >
                  <option value="">Select Action</option>
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPermission}
                  className="bg-[#043E49] text-white px-3 py-1 rounded hover:bg-[#032e36] flex items-center justify-center"
                >
                  <FaPlus className="w-3 h-3 mr-1" />
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.permissions.map((perm, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                >
                  <span className="text-sm">
                    {perm.resource}:{perm.action} ({perm.scope})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePermission(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash className="w-3 h-3" />
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
                className="mr-2 h-4 w-4 text-[#043E49] focus:ring-[#043E49] border-gray-300 rounded"
              />
              Default Template
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: parseInt(e.target.value),
                  }))
                }
                className="w-20 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
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
              className="px-4 py-2 bg-[#043E49] text-white rounded-lg hover:bg-[#032e36] flex items-center"
            >
              <FaCheck className="w-4 h-4 mr-2" />
              {template ? "Update" : "Create"}
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
  const [storeId, setStoreId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length > 0 && storeId) {
      onAssign(selectedUsers, storeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#043E49]">
            Assign Role Template
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#043E49] bg-opacity-5 rounded-lg">
          <p className="text-sm text-gray-600">Assigning role template:</p>
          <p className="font-semibold text-[#043E49]">{template.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store ID
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
              placeholder="Enter store ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User IDs
            </label>
            <textarea
              value={selectedUsers.join(", ")}
              onChange={(e) =>
                setSelectedUsers(
                  e.target.value
                    .split(",")
                    .map((id) => id.trim())
                    .filter((id) => id)
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#043E49] focus:border-transparent"
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
              className="px-4 py-2 bg-[#043E49] text-white rounded-lg hover:bg-[#032e36] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FaUsers className="w-4 h-4 mr-2" />
              Assign ({selectedUsers.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleTemplateManagement;
