import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Permissions } from "../../components/EmployeeComponents";
import Header from "../../components/Header";
import { FaPlus } from "react-icons/fa";

const PermissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleAddEmployee = () => {
    // Navigate to create employee page with store context
    if (id) {
      navigate(`/store/${id}/employee/create`);
    } else {
      navigate("/employee");
    }
  };

  const handleEditEmployee = (employeeData: any) => {
    // Navigate to EditEmployeePage with the employee data
    if (id) {
      navigate(`/store/${id}/edit-employee`, {
        state: { employeeData, editMode: true },
      });
    } else {
      navigate("/edit-employee", { state: { employeeData, editMode: true } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mt-[30px] mb-[15px] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                <p className="text-gray-600 mt-1">
                  Manage access rights for users and roles across stores.
                </p>
              </div>
              <button
                onClick={handleAddEmployee}
                className="inline-flex items-center px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Role
              </button>
            </div>
          </div>
          <Permissions
            showHeader={false}
            onEditEmployee={handleEditEmployee}
            onAddEmployee={handleAddEmployee}
          />
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
