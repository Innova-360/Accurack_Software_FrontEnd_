import React, { useState } from 'react';
import apiClient from '../services/api';
import toast from 'react-hot-toast';

interface TestResult {
  success: boolean;
  data?: any;
  error?: any;
  type?: string;
}

const EmployeeLoginTestHelper: React.FC = () => {
  const [testEmail, setTestEmail] = useState('mashood34@yopmail.com');
  const [testPassword, setTestPassword] = useState('Mashood@#12345');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testEmployeeLogin = async () => {
    setLoading(true);
    try {
      console.log("Testing employee login with:", testEmail);
      const response = await apiClient.post('/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      console.log("Test login success:", response.data);
      setTestResult({ success: true, data: response.data, type: 'login' });
      toast.success("Employee login test successful!");
    } catch (error: any) {
      console.error("Test login failed:", error);
      setTestResult({ 
        success: false, 
        error: error.response?.data || error.message,
        type: 'login'
      });
      toast.error("Employee login test failed!");
    } finally {
      setLoading(false);
    }
  };

  const checkEmployeeExists = async () => {
    setLoading(true);
    try {
      console.log("Checking if employee exists:", testEmail);
      const response = await apiClient.get(`/employees?email=${testEmail}`);
      console.log("Employee check result:", response.data);
      setTestResult({ 
        success: true, 
        type: 'check',
        data: response.data 
      });
      toast.success("Employee found in database!");
    } catch (error: any) {
      console.error("Employee check failed:", error);
      setTestResult({ 
        success: false, 
        type: 'check',
        error: error.response?.data || error.message 
      });
      toast.error("Employee not found in database!");
    } finally {
      setLoading(false);
    }
  };

  const testDirectEmployeeAuth = async () => {
    setLoading(true);
    try {
      console.log("Testing direct employee auth API:", testEmail);
      // Try different potential employee auth endpoints
      const endpoints = [
        '/auth/employee/login',
        '/employees/auth/login', 
        '/auth/login/employee',
        '/employee/login'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.post(endpoint, {
            email: testEmail,
            password: testPassword
          });
          console.log(`Success with endpoint ${endpoint}:`, response.data);
          setTestResult({ 
            success: true, 
            data: { endpoint, response: response.data },
            type: 'employee-auth'
          });
          toast.success(`Employee auth successful with ${endpoint}!`);
          return;
        } catch (err) {
          console.log(`Failed with endpoint ${endpoint}:`, err);
        }
      }
      
      setTestResult({ 
        success: false, 
        error: "No employee auth endpoints found",
        type: 'employee-auth'
      });
      toast.error("No working employee auth endpoints found!");
    } catch (error: any) {
      console.error("Employee auth test failed:", error);
      setTestResult({ 
        success: false, 
        error: error.response?.data || error.message,
        type: 'employee-auth'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 m-4">
      <h3 className="text-lg font-semibold mb-4 text-red-600">🔧 Employee Login Debug Helper</h3>
      
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testEmployeeLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Standard Login'}
          </button>
          
          <button
            onClick={checkEmployeeExists}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Employee Exists'}
          </button>

          <button
            onClick={testDirectEmployeeAuth}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Employee Auth APIs'}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-md border ${
            testResult.success 
              ? 'bg-green-100 border-green-400 text-green-800' 
              : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            <h4 className="font-medium mb-2">
              {testResult.success ? '✅ Success' : '❌ Error'} - {testResult.type}
            </h4>
            <pre className="text-sm overflow-auto max-h-60 bg-white p-2 rounded border">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-2">🚨 Backend Issues to Check:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Employee table में data properly save हो रहा है?</li>
            <li>2. Employee के login credentials अलग table में store हो रहे हैं?</li>
            <li>3. /auth/login API employee table को check कर रहा है?</li>
            <li>4. Employee का status 'active' set है?</li>
            <li>5. Password properly hash हो रहा है?</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginTestHelper;
