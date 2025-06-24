import React, { useState } from 'react';
import { 
    FaPlus, 
    FaEye, 
    FaEdit, 
    FaTrash, 
    FaDownload, 
    FaCog 
} from 'react-icons/fa';

interface EmployeeFormProps {
    onSubmit?: (data: EmployeeFormData) => void;
    initialData?: Partial<EmployeeFormData>;
    isEditMode?: boolean;
    onCancel?: () => void;
}

interface EmployeeFormData {
    id?: string; // Added for edit mode
    // Profile fields
    firstName: string;
    lastName: string;
    role: string;
    status: string;

    // Employee specific fields
    employeeCode: string;
    position: string;
    department: string;
    phone: string;
    joiningDate: string;
    password: string; // Password field for authentication
    // User/Auth fields
    email: string;

    // Additional fields for assignment
    //   storeAssigned: string;

    // Permissions Matrix
    permissions: {
        [resource: string]: {
            [action: string]: boolean;
        };
    };
}

// Define the permissions structure
const PERMISSIONS_MATRIX = {
    resources: [
        { id: 'inventory', name: 'Inventory' },
        { id: 'products', name: 'Products' },
        { id: 'orders', name: 'Orders' },
        { id: 'reports', name: 'Reports' },
        { id: 'users', name: 'Users' },
        { id: 'settings', name: 'Settings' },
    ],
    actions: [
        { id: 'create', name: 'Create' },
        { id: 'read', name: 'Read' },
        { id: 'update', name: 'Update' },
        { id: 'delete', name: 'Delete' },
        { id: 'export', name: 'Export' },
        { id: 'manage', name: 'Manage' },
    ]
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({
    onSubmit,
    initialData,
    isEditMode = false,
    onCancel
}) => {
    const [formData, setFormData] = useState<EmployeeFormData>({
        id: initialData?.id || '',
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        role: initialData?.role || '',
        status: initialData?.status || 'active',
        employeeCode: initialData?.employeeCode || '',
        position: initialData?.position || '',
        department: initialData?.department || '',
        phone: initialData?.phone || '',
        password: initialData?.password || '',
        joiningDate: initialData?.joiningDate || '',
        email: initialData?.email || '',
        permissions: initialData?.permissions || PERMISSIONS_MATRIX.resources.reduce((acc, resource) => {
            acc[resource.id] = PERMISSIONS_MATRIX.actions.reduce((actionAcc, action) => {
                actionAcc[action.id] = false;
                return actionAcc;
            }, {} as Record<string, boolean>);
            return acc;
        }, {} as Record<string, Record<string, boolean>>)
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (resource: string, action: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [resource]: {
                    ...prev.permissions[resource],
                    [action]: !prev.permissions[resource]?.[action]
                }
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditMode ? 'Edit Employee' : 'Employee Creation'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isEditMode 
                                ? 'Update employee information and permissions' 
                                : 'Create a new role with specific permissions for the inventory system'
                            }
                        </p>
                    </div>{/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6">                        {/* Personal Information Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium text-gray-900 mb-4">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Password */}
                                <div className="md:col-span-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>                        {/* Employee Information Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium text-gray-900 mb-4">
                                Employee Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Employee Code */}
                                <div>
                                    <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee Code
                                    </label>
                                    <input
                                        type="text"
                                        id="employeeCode"
                                        name="employeeCode"
                                        value={formData.employeeCode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Position */}
                                <div>
                                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Department */}
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select a role</option>
                                        <option value="ADMIN">Administrator</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="CASHIER">Cashier</option>
                                        <option value="INVENTORY_STAFF">Inventory Staff</option>
                                        <option value="SALES_ASSOCIATE">Sales Associate</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>

                                {/* Joining Date */}
                                <div>
                                    <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        id="joiningDate"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        placeholder="mm/dd/yyyy"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>                        {/* Permissions Matrix Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium text-gray-900 mb-4">
                                Permissions Matrix
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Select which actions this role can perform on each resource.</p>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left py-3 px-4 border border-gray-300 font-medium text-gray-700">
                                                Resource
                                            </th>
                                            <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <FaPlus className="w-4 h-4 mb-1" />
                                                    <span className="text-xs">Create</span>
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <FaEye className="w-4 h-4 mb-1" />
                                                    <span className="text-xs">Read</span>
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <FaEdit className="w-4 h-4 mb-1" />
                                                    <span className="text-xs">Update</span>
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <FaTrash className="w-4 h-4 mb-1" />
                                                    <span className="text-xs">Delete</span>
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <FaDownload className="w-4 h-4 mb-1" />
                                                    <span className="text-xs">Export</span>
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 border border-gray-300 font-medium text-gray-700 min-w-[80px]">
                                                <div className="flex flex-col items-center">
                                                    <FaCog className="w-4 h-4 mb-1" />
                                                    <span className="text-xs">Manage</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PERMISSIONS_MATRIX.resources.map((resource) => (
                                            <tr key={resource.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 border border-gray-300 font-medium text-gray-700 bg-white">
                                                    {resource.name}
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions[resource.id]?.['create'] || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'create')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions[resource.id]?.['read'] || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'read')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions[resource.id]?.['update'] || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'update')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions[resource.id]?.['delete'] || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'delete')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions[resource.id]?.['export'] || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'export')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions[resource.id]?.['manage'] || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'manage')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                {isEditMode ? 'Update Employee' : 'Save Role'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;
