import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EmployeeForm, Permissions } from '../../components/EmployeeComponents';
import Header from '../../components/Header';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

interface EmployeeData {
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  employeeCode: string;
  position: string;
  department: string;
  phone: string;
  joiningDate: string;
  password: string;
  email: string;
  permissions: {
    [resource: string]: {
      [action: string]: boolean;
    };
  };
}

const EditEmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);

  // Check if we came from navigation with employee data
  useEffect(() => {
    if (location.state?.employeeData && location.state?.editMode) {
      setEditingEmployee(location.state.employeeData);
      setCurrentView('edit');
    }
  }, [location.state]);

  const handleEditEmployee = (employeeData: EmployeeData) => {
    setEditingEmployee(employeeData);
    setCurrentView('edit');
  };
  const handleBackToList = () => {
    setCurrentView('list');
    setEditingEmployee(null);
    // Navigate back to permissions page
    navigate('/permissions');
  };

  const handleSubmitEmployee = (data: EmployeeData) => {
    // Here you will integrate with your API
    console.log('Employee data to be updated:', data);
    
    // For now, just go back to the list
    // In future, you can make API call here:
    // updateEmployee(data.id, data).then(() => {
    //   handleBackToList();
    // });
    
    alert(`Employee ${data.firstName} ${data.lastName} updated successfully!`);
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
          {currentView === 'list' ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-600 mt-1">Manage access rights for users and roles across stores.</p>
                  </div>
                  <button className="inline-flex items-center px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors">
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Role
                  </button>
                </div>
              </div>
              <Permissions showHeader={false} onEditEmployee={handleEditEmployee} />
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
                    <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
                    <p className="text-gray-600 mt-1">Update employee information and permissions.</p>
                  </div>
                </div>
              </div>
              <EmployeeForm 
                isEditMode={true}
                initialData={editingEmployee || undefined}
                onSubmit={handleSubmitEmployee}
                onCancel={handleCancelEdit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEmployeePage;
