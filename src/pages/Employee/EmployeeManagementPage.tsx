import React from 'react';
import { EmployeeDashboard } from '../../components/EmployeeComponents';
import Header from '../../components/Header';

const EmployeeManagementPage: React.FC = () => {
  return (
    <>
      <Header />
      <br />
      <EmployeeDashboard />
    </>
  );
};

export default EmployeeManagementPage;