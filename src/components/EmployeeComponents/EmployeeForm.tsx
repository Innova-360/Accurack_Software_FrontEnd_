import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { createEmployee, updateEmployee } from '../../store/slices/employeeSlice';
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
    id?: string;
    employeeId: string;
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
    // Note: password field for creation only
    password?: string;
    permissions: [
        {
            resource: string;
            actions: string[]; // Changed from 'action' to 'actions'
            storeId: string;
        }
    ];
    storeIds: string[];
}

// Define the permissions structure based on backend validation
const PERMISSIONS_MATRIX = {
    resources: [
        { id: 'store', name: 'Store' },
        { id: 'inventory', name: 'Inventory' },
        { id: 'product', name: 'Product' },
        { id: 'supplier', name: 'Supplier' },
        { id: 'customer', name: 'Customer' },
        { id: 'order', name: 'Order' },
        { id: 'user', name: 'User' },
        { id: 'report', name: 'Report' },
        { id: 'setting', name: 'Setting' },
        { id: 'transaction', name: 'Transaction' },
        { id: 'category', name: 'Category' },
        { id: 'brand', name: 'Brand' },
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
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const { loading, error } = useSelector((state: RootState) => state.employees);
    
    const [formData, setFormData] = useState<EmployeeFormData>({
        id: initialData?.id || '',
        employeeId: initialData?.employeeId || '',
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        role: initialData?.role || '',
        status: initialData?.status || 'active',
        employeeCode: initialData?.employeeCode || '',
        position: initialData?.position || '',
        department: initialData?.department || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        joiningDate: initialData?.joiningDate || '',
        password: '', // Always empty for security
        permissions: initialData?.permissions || [{
            resource: 'inventory',
            actions: ['read'], // Changed from 'action' to 'actions'
            storeId: id || '' // Use current store ID from URL params
        }],
        storeIds: initialData?.storeIds || (id ? [id] : []) // Include current store ID if available
    });

    // Initialize selectedPermissions from initialData
    const initializePermissions = () => {
        const initialPerms: {[key: string]: string[]} = {
            store: [],
            inventory: [],
            product: [],
            supplier: [],
            customer: [],
            order: [],
            user: [],
            report: [],
            setting: [],
            transaction: [],
            category: [],
            brand: []
        };
        
        if (initialData?.permissions) {
            initialData.permissions.forEach(perm => {
                if (initialPerms[perm.resource]) {
                    initialPerms[perm.resource] = perm.actions; // Changed from 'action' to 'actions'
                }
            });
        }
        
        return initialPerms;
    };

    const [selectedPermissions, setSelectedPermissions] = useState<{[key: string]: string[]}>(
        initializePermissions()
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (resource: string, action: string) => {
        setSelectedPermissions(prev => {
            const currentActions = prev[resource] || [];
            const updatedActions = currentActions.includes(action)
                ? currentActions.filter(a => a !== action)
                : [...currentActions, action];
            
            return {
                ...prev,
                [resource]: updatedActions
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert selectedPermissions to API format
        const permissions = Object.entries(selectedPermissions)
            .filter(([_, actions]) => actions.length > 0)
            .map(([resource, actions]) => ({
                resource,
                actions: actions, // Changed from 'action' to 'actions'
                storeId: id || '' // Use current store ID from URL params
            }));

        const submitData = {
            ...formData,
            permissions: permissions as any,
            storeIds: id ? [id] : formData.storeIds // Ensure current store ID is in storeIds
        };
        console.log('Submitting employee data:', submitData);
        console.log('Current store ID from URL:', id);
        console.log('Permissions with store IDs:', permissions);

        // Remove password field if editing or if password is empty
        if (isEditMode || !submitData.password) {
            delete submitData.password;
        }

        try {
            if (isEditMode && formData.id) {
                await dispatch(updateEmployee({ id: formData.id, employeeData: submitData })).unwrap();
                // For edit mode, call onSubmit if provided
                if (onSubmit) {
                    onSubmit(submitData);
                }
            } else {
                // Creating new employee
                await dispatch(createEmployee(submitData)).unwrap()
                
                // Redirect to employee list/permissions page
                if (id) {
                    // If we have a store ID, redirect to store-specific employee page
                    navigate(`/store/${id}/employee`);
                } else {
                    // Otherwise redirect to general employee/permissions page
                    navigate('/permissions');
                }
                
                // Call onSubmit if provided (for parent component handling)
                if (onSubmit) {
                    onSubmit(submitData);
                }
            }
        } catch (error) {
            console.error('Failed to save employee:', error);
            // Don't redirect on error - let user see the error and try again
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header */}
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
                        {id && (
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Store Context: {id}
                            </div>
                        )}
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Personal Information Section */}
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

                                {/* Password - only required for new employees */}
                                {!isEditMode && (
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
                                )}
                            </div>
                        </div>

                        {/* Employee Information Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium text-gray-900 mb-4">
                                Employee Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Employee ID */}
                                <div>
                                    <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee ID
                                    </label>
                                    <input
                                        type="text"
                                        id="employeeId"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        placeholder="e.g., EMP001"
                                    />
                                </div>

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
                                        placeholder="e.g., EC001"
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
                        </div>

                        {/* Permissions Matrix Section */}
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
                                                        checked={selectedPermissions[resource.id]?.includes('create') || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'create')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions[resource.id]?.includes('read') || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'read')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions[resource.id]?.includes('update') || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'update')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions[resource.id]?.includes('delete') || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'delete')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions[resource.id]?.includes('export') || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'export')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300 text-center bg-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions[resource.id]?.includes('manage') || false}
                                                        onChange={() => handlePermissionChange(resource.id, 'manage')}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 text-gray-700 bg-white border-[1px] border-[#D1D5DB] rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-[#043E49] hover:bg-[#032e36] disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                {loading 
                                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                                    : (isEditMode ? 'Update Employee' : 'Create Employee')
                                }
                            </button>
                        </div>
                        
                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                Error: {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;