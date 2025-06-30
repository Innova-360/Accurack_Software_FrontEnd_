import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { inviteEmployee, fetchRoleTemplates } from '../../store/slices/employeeSlice';

interface EmployeeInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeInviteModal: React.FC<EmployeeInviteModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  // const { loading, roleTemplates } = useSelector((state: RootState) => state.employees);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    roleTemplateId: '',
    storeIds: ['']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRoleTemplates());
    }
  }, [isOpen, dispatch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.roleTemplateId) newErrors.roleTemplateId = 'Role template is required';
    if (!formData.storeIds[0]) newErrors.storeIds = 'At least one store is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await dispatch(inviteEmployee(formData)).unwrap();
      onClose();
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        position: '',
        department: '',
        roleTemplateId: '',
        storeIds: ['']
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to invite employee:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleStoreChange = (index: number, value: string) => {
    const newStoreIds = [...formData.storeIds];
    newStoreIds[index] = value;
    setFormData(prev => ({ ...prev, storeIds: newStoreIds }));
  };

  const addStoreField = () => {
    setFormData(prev => ({ ...prev, storeIds: [...prev.storeIds, ''] }));
  };

  const removeStoreField = (index: number) => {
    if (formData.storeIds.length > 1) {
      const newStoreIds = formData.storeIds.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, storeIds: newStoreIds }));
    }
  };

  if (!isOpen) return null;

  
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    //   <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
    //     <div className="flex justify-between items-center mb-4">
    //       <h2 className="text-xl font-bold text-gray-900">Invite Employee</h2>
    //       <button
    //         onClick={onClose}
    //         className="text-gray-400 hover:text-gray-600"
    //       >
    //         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //         </svg>
    //       </button>
    //     </div>

    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Email Address *
    //         </label>
    //         <input
    //           type="email"
    //           value={formData.email}
    //           onChange={(e) => handleInputChange('email', e.target.value)}
    //           className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
    //             errors.email ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           placeholder="employee@example.com"
    //         />
    //         {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
    //       </div>

    //       <div className="grid grid-cols-2 gap-4">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             First Name *
    //           </label>
    //           <input
    //             type="text"
    //             value={formData.firstName}
    //             onChange={(e) => handleInputChange('firstName', e.target.value)}
    //             className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
    //               errors.firstName ? 'border-red-500' : 'border-gray-300'
    //             }`}
    //             placeholder="John"
    //           />
    //           {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
    //         </div>

    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Last Name *
    //           </label>
    //           <input
    //             type="text"
    //             value={formData.lastName}
    //             onChange={(e) => handleInputChange('lastName', e.target.value)}
    //             className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
    //               errors.lastName ? 'border-red-500' : 'border-gray-300'
    //             }`}
    //             placeholder="Doe"
    //           />
    //           {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
    //         </div>
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Position *
    //         </label>
    //         <input
    //           type="text"
    //           value={formData.position}
    //           onChange={(e) => handleInputChange('position', e.target.value)}
    //           className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
    //             errors.position ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           placeholder="Sales Manager"
    //         />
    //         {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Department *
    //         </label>
    //         <select
    //           value={formData.department}
    //           onChange={(e) => handleInputChange('department', e.target.value)}
    //           className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
    //             errors.department ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         >
    //           <option value="">Select Department</option>
    //           <option value="Sales">Sales</option>
    //           <option value="Engineering">Engineering</option>
    //           <option value="Marketing">Marketing</option>
    //           <option value="Operations">Operations</option>
    //           <option value="HR">Human Resources</option>
    //           <option value="Finance">Finance</option>
    //         </select>
    //         {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Role Template *
    //         </label>
    //         <select
    //           value={formData.roleTemplateId}
    //           onChange={(e) => handleInputChange('roleTemplateId', e.target.value)}
    //           className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
    //             errors.roleTemplateId ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         >
    //           <option value="">Select Role Template</option>
    //           {roleTemplates.map((template) => (
    //             <option key={template.id} value={template.id}>
    //               {template.name}
    //             </option>
    //           ))}
    //         </select>
    //         {errors.roleTemplateId && <p className="text-red-500 text-xs mt-1">{errors.roleTemplateId}</p>}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">
    //           Store IDs *
    //         </label>
    //         {formData.storeIds.map((storeId, index) => (
    //           <div key={index} className="flex gap-2 mb-2">
    //             <input
    //               type="text"
    //               value={storeId}
    //               onChange={(e) => handleStoreChange(index, e.target.value)}
    //               className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
    //               placeholder="store-123"
    //             />
    //             {formData.storeIds.length > 1 && (
    //               <button
    //                 type="button"
    //                 onClick={() => removeStoreField(index)}
    //                 className="text-red-600 hover:text-red-800 px-2"
    //               >
    //                 Remove
    //               </button>
    //             )}
    //           </div>
    //         ))}
    //         <button
    //           type="button"
    //           onClick={addStoreField}
    //           className="text-blue-600 hover:text-blue-800 text-sm"
    //         >
    //           + Add Store
    //         </button>
    //         {errors.storeIds && <p className="text-red-500 text-xs mt-1">{errors.storeIds}</p>}
    //       </div>

    //       <div className="flex justify-end space-x-3 pt-4">
    //         <button
    //           type="button"
    //           onClick={onClose}
    //           className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    //         >
    //           {loading ? 'Sending...' : 'Send Invitation'}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>);
};

export default EmployeeInviteModal;