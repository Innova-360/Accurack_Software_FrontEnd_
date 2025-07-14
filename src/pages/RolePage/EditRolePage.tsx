import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RoleForm, Permissions } from "../../components/RoleComponents";
import Header from "../../components/Header";
import { FaPlus, FaArrowLeft } from "react-icons/fa";

interface RoleFormData {
  id?: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: {
    resource: string;
    actions: string[];
    storeId: string;
  }[];
  storeIds: string[];
}

const EditRolePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<"list" | "edit">("list");
  const [editingRole, setEditingRole] = useState<RoleFormData | null>(null);

  // Check if we came from navigation with role data
  useEffect(() => {
    if (location.state?.roleData && location.state?.editMode) {
      setEditingRole(location.state.roleData);
      setCurrentView("edit");
    }
  }, [location.state]);

  const handleEditRole = (roleData: RoleFormData) => {
    setEditingRole(roleData);
    setCurrentView("edit");
  };
  const handleBackToList = () => {
    setCurrentView("list");
    setEditingRole(null);
    // Navigate back to permissions page with store context
    const urlParts = location.pathname.split("/");
    const storeIndex = urlParts.findIndex((part) => part === "store");
    if (storeIndex !== -1 && urlParts[storeIndex + 1]) {
      const storeId = urlParts[storeIndex + 1];
      navigate(`/store/${storeId}/role`);
    } else {
      navigate("/role");
    }
  };

  const handleSubmitRole = (data: RoleFormData) => {
    // Here you will integrate with your API

    // For now, just go back to the list
    // In future, you can make API call here:
    // updateRole(data.id, data).then(() => {
    //   handleBackToList();
    // });

    alert(`Role "${data.name}" updated successfully!`);
    handleBackToList();
  };

  const handleCancelEdit = () => {
    handleBackToList();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mt-[49px] p-6">
        <div className="max-w-7xl mx-auto">
          {currentView === "list" ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Roles & Permissions
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage access rights for users and roles across stores.
                    </p>
                  </div>
                  <button className="inline-flex items-center px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors">
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Role
                  </button>
                </div>
              </div>
              <Permissions showHeader={false} onEditEmployee={handleEditRole} />
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToList}
                    className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Back to Roles
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Edit Role
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Update role information and permissions.
                    </p>
                  </div>
                </div>
              </div>
              <RoleForm
                isEditMode={true}
                initialData={editingRole || undefined}
                onSubmit={handleSubmitRole}
                onCancel={handleCancelEdit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditRolePage;
