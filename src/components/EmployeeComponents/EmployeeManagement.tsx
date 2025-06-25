import React, { useState } from 'react';
import Employee from './Employee';
import EmployeeForm from './EmployeeForm.tsx';
import EmployeePermissionsModal from './EmployeePermissionsModal';
import type { EmployeeAPIData } from '../../types/employee';

interface EmployeeManagementProps {
  // Optional props for customization
}

type ViewMode = 'list' | 'create' | 'edit';

const EmployeeManagement: React.FC<EmployeeManagementProps> = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [viewPermissionsEmployee, setViewPermissionsEmployee] = useState<EmployeeAPIData | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setCurrentView('create');
  };

  const handleEditEmployee = (employeeData: any) => {
    setSelectedEmployee(employeeData);
    setCurrentView('edit');
  };

  const handleViewPermissions = (employee: EmployeeAPIData) => {
    setViewPermissionsEmployee(employee);
    setIsPermissionsModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Employee data submitted:', data);
    // After successful submission, go back to list view
    setCurrentView('list');
    setSelectedEmployee(null);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setSelectedEmployee(null);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setViewPermissionsEmployee(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <EmployeeForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isEditMode={false}
          />
        );
      
      case 'edit':
        return (
          <EmployeeForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={selectedEmployee}
            isEditMode={true}
          />
        );
      
      case 'list':
      default:
        return (
          <Employee
            showHeader={true}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onViewPermissions={handleViewPermissions}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderCurrentView()}
      
      {/* Permissions Modal */}
      <EmployeePermissionsModal
        employee={viewPermissionsEmployee}
        isOpen={isPermissionsModalOpen}
        onClose={handleClosePermissionsModal}
      />
    </div>
  );
};

export default EmployeeManagement;
