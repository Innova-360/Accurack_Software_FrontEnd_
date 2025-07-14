import React, { useState } from 'react';
import apiClient from '../services/api';

const EmployeeTestHelper: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const testEmployeeLogin = async () => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      setTestResult({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Test login failed:", error);
      setTestResult({ 
        success: false, 
        error: error.response?.data || error.message 
      });
    }
  };

  const checkEmployeeExists = async () => {
    try {
      const response = await apiClient.get(`/employees?email=${testEmail}`);
      setTestResult({ 
        success: true, 
        type: 'check',
        data: response.data 
      });
    } catch (error: any) {
      console.error("Employee check failed:", error);
      setTestResult({ 
        success: false, 
        type: 'check',
        error: error.response?.data || error.message 
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 m-4">
      <h3 className="text-lg font-semibold mb-4">Employee Login Test Helper</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Email
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="employee@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Password from email"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={testEmployeeLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Login
          </button>
          
          <button
            onClick={checkEmployeeExists}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Check Employee Exists
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-md ${
            testResult.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
          }`}>
            <h4 className="font-medium mb-2">
              {testResult.success ? 'Success' : 'Error'}
            </h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTestHelper;
