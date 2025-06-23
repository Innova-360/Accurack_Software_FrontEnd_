import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { SpecialButton } from '../buttons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteSupplier } from '../../store/slices/supplierSlice';
import type { Supplier } from '../../types/supplier';

interface DeleteSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  isDeleteAll?: boolean;
  supplierCount?: number;
}

const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  isDeleteAll = false,
  supplierCount = 0
}) => {
  const dispatch = useAppDispatch();
  const { currentStore } = useAppSelector((state) => state.stores);
  const { loading } = useAppSelector((state) => state.suppliers);

  if (!isOpen) return null;
  if (!isDeleteAll && !supplier) return null;

  const handleDelete = async () => {
    if (!currentStore) return;
    
    try {
      if (isDeleteAll) {
        // TODO: Implement bulk delete API endpoint when available
        console.log('Bulk delete not implemented yet');
        onClose();
      } else if (supplier) {
        await dispatch(deleteSupplier({
          id: supplier.supplier_id,
          storeId: currentStore.id
        })).unwrap();
        
        onClose();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaTrash className="text-red-600" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isDeleteAll ? 'Delete All Suppliers' : 'Delete Supplier'}
              </h2>
              <p className="text-sm text-gray-600">
                {isDeleteAll 
                  ? 'This action cannot be undone' 
                  : 'This action cannot be undone'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            {isDeleteAll ? (
              <div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete all <span className="font-semibold">{supplierCount}</span> suppliers? 
                  This will permanently remove all supplier data including their contact information, 
                  business details, and product relationships.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ Warning: This action is irreversible
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    All supplier data will be permanently deleted and cannot be recovered.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete the supplier <span className="font-semibold">"{supplier?.name}"</span>? 
                  This will permanently remove all their information including contact details, 
                  business relationship, and product associations.
                </p>
                  {supplier && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Supplier Details:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">ID:</span> {supplier.supplier_id}</p>
                      <p><span className="font-medium">Name:</span> {supplier.name}</p>
                      <p><span className="font-medium">Email:</span> {supplier.email}</p>
                      <p><span className="font-medium">Phone:</span> {supplier.phone}</p>
                      <p><span className="font-medium">Address:</span> {supplier.address}</p>
                      {supplier.createdAt && (
                        <p><span className="font-medium">Created:</span> {new Date(supplier.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ Warning: This action is irreversible
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    The supplier data will be permanently deleted and cannot be recovered.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <SpecialButton
              variant="modal-cancel"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </SpecialButton>            <SpecialButton
              variant="modal-delete"
              onClick={handleDelete}
              fullWidth
              disabled={loading}
            >
              {loading 
                ? (isDeleteAll ? 'Deleting All...' : 'Deleting...') 
                : (isDeleteAll ? 'Delete All Suppliers' : 'Delete Supplier')
              }
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSupplierModal;
