// Employee API Service - Future Integration
// This file shows how you can structure your API calls for employee management

export interface EmployeeAPIData {
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
  email: string;
  permissions: {
    [resource: string]: {
      [action: string]: boolean;
    };
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  usersAssigned: number;
  avatars: string[];
  createdDate: string;
  permissions: any[];
  status: 'Active' | 'Inactive';
}

class EmployeeAPIService {
  private baseURL = 'http://localhost:3001/api'; // You can change this to your actual API URL

  // Get all employees/roles
  async getEmployees(): Promise<Role[]> {
    try {
      const response = await fetch(`${this.baseURL}/employees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Get single employee by ID
  async getEmployeeById(id: string): Promise<EmployeeAPIData> {
    try {
      const response = await fetch(`${this.baseURL}/employees/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  // Create new employee
  async createEmployee(employeeData: EmployeeAPIData): Promise<EmployeeAPIData> {
    try {
      const response = await fetch(`${this.baseURL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(employeeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // Update existing employee
  async updateEmployee(id: string, employeeData: EmployeeAPIData): Promise<EmployeeAPIData> {
    try {
      const response = await fetch(`${this.baseURL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(employeeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee
  async deleteEmployee(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // Update employee permissions
  async updateEmployeePermissions(id: string, permissions: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/employees/${id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ permissions })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee permissions');
      }
    } catch (error) {
      console.error('Error updating employee permissions:', error);
      throw error;
    }
  }
}

export const employeeAPI = new EmployeeAPIService();

/* 
HOW TO USE THIS API SERVICE:

1. In your components, import the service:
   import { employeeAPI } from '../services/employeeAPI';

2. For getting all employees:
   const employees = await employeeAPI.getEmployees();

3. For updating an employee:
   await employeeAPI.updateEmployee(employeeId, updatedData);

4. For creating a new employee:
   const newEmployee = await employeeAPI.createEmployee(employeeData);

5. Example in your component:
   
   const handleSubmitEmployee = async (data: EmployeeAPIData) => {
     try {
       if (data.id) {
         // Update existing employee
         await employeeAPI.updateEmployee(data.id, data);
         alert('Employee updated successfully!');
       } else {
         // Create new employee
         await employeeAPI.createEmployee(data);
         alert('Employee created successfully!');
       }
       handleBackToList();
     } catch (error) {
       alert('Error saving employee: ' + error.message);
     }
   };

6. For loading data:
   
   useEffect(() => {
     const loadEmployees = async () => {
       try {
         const employees = await employeeAPI.getEmployees();
         setEmployees(employees);
       } catch (error) {
         console.error('Error loading employees:', error);
       }
     };
     
     loadEmployees();
   }, []);
*/
