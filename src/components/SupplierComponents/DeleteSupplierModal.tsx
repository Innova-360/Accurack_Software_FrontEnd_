import React from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { SpecialButton } from "../buttons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteSupplier,
  deleteAllSuppliers,
} from "../../store/slices/supplierSlice";
import type { Supplier } from "../../types/supplier";
import useRequireStore from "../../hooks/useRequireStore";

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
  supplierCount = 0,
}) => {
  const dispatch = useAppDispatch();
  const currentStore = useRequireStore();
  const { loading } = useAppSelector((state) => state.suppliers);

  if (!isOpen) return null;
  if (!isDeleteAll && !supplier) return null;

  // Helper function to detect if supplier is sample data
  const isSampleData = (supplier: Supplier): boolean => {
    const id = supplier.id || supplier.supplier_id;
    if (!id) return false;

    // Check if ID matches sample data pattern (e.g., SUP001, SUP002, etc.)
    return id.startsWith("SUP") && id.length <= 10 && /^SUP\d{3}$/.test(id);
  };

  // Helper function to get the valid ID for API operations
  const getValidSupplierId = (supplier: Supplier): string | null => {
    // Prefer numeric/UUID id if available (this is the primary ID from backend)
    if (supplier.id && supplier.id.trim()) {
      return supplier.id;
    }

    // Fallback to supplier_id if id is not available
    if (supplier.supplier_id && supplier.supplier_id.trim()) {
      return supplier.supplier_id;
    }

    return null;
  };

  const handleDelete = async () => {
    if (!currentStore?.id) {
      console.error("No current store found");
      toast.error("Error: No store selected. Please select a store first.");
      return;
    }

    try {
      if (isDeleteAll) {
        await dispatch(deleteAllSuppliers(currentStore.id)).unwrap();
        toast.success("All suppliers have been deleted successfully!");
        onClose();
      } else if (supplier) {
        const validId = getValidSupplierId(supplier);

        if (!validId) {
          toast.error("Cannot delete this supplier: No valid ID found.");
          return;
        }

        // Check if this is sample data
        const isSample = isSampleData(supplier);
        if (isSample) {
        }

        try {
          const result = await dispatch(
            deleteSupplier({
              id: validId,
              storeId: currentStore.id,
            })
          ).unwrap();

          // Show appropriate success message
          if (isSample) {
            toast.success("Sample vendor removed from view!");
          } else {
            toast.success("Vendor deleted successfully!");
          }

          onClose();
        } catch (deleteError) {
          console.error("Error in delete operation:", deleteError);

          // If it's sample data and we got a 404, that's expected
          if (
            isSample &&
            deleteError &&
            typeof deleteError === "object" &&
            "message" in deleteError
          ) {
            const errorMessage = deleteError.message as string;
            if (
              errorMessage.includes("not found") ||
              errorMessage.includes("404")
            ) {
              toast.success("Sample vendor removed from view!");
              onClose();
              return;
            }
          }

          // Re-throw for other errors
          throw deleteError;
        }
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);

      // Show user-friendly error message
      let errorMessage = "Failed to delete supplier. Please try again.";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = error.message as string;
      }

      if (isDeleteAll) {
        errorMessage = `Failed to delete all suppliers: ${errorMessage}`;
      }

      toast.error(errorMessage);
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
                {isDeleteAll ? "Delete All Suppliers" : "Delete Supplier"}
              </h2>
              <p className="text-sm text-gray-600">
                {isDeleteAll
                  ? "This action cannot be undone"
                  : "This action cannot be undone"}
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
                  Are you sure you want to delete all{" "}
                  <span className="font-semibold">{supplierCount}</span>{" "}
                  suppliers? This will permanently remove all vendor data
                  including their contact information, business details, and
                  product relationships.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm font-medium">
                    Warning: This action is irreversible
                  </p>
                  <p className="text-red-500 text-sm mt-1">
                    All vendor data will be permanently deleted and cannot be
                    recovered.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete the supplier{" "}
                  <span className="font-semibold">"{supplier?.name}"</span>?
                  This will permanently remove all their information including
                  contact details, business relationship, and product
                  associations.
                </p>
                {supplier && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Vendor Details:
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">ID:</span>{" "}
                        {supplier.supplier_id}
                      </p>
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {supplier.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {supplier.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {supplier.phone}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {supplier.address}
                      </p>
                      {supplier.createdAt && (
                        <p>
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(supplier.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm font-medium">
                    Warning: This action is irreversible
                  </p>
                  <p className="text-red-500 text-sm mt-1">
                    The vendor data will be permanently deleted and cannot be
                    recovered.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <SpecialButton variant="modal-cancel" onClick={onClose} fullWidth>
              Cancel
            </SpecialButton>{" "}
            <SpecialButton
              variant="modal-delete"
              onClick={handleDelete}
              fullWidth
              disabled={loading}
            >
              {loading
                ? isDeleteAll
                  ? "Deleting All..."
                  : "Deleting..."
                : isDeleteAll
                  ? "Delete All Suppliers"
                  : "Delete Supplier"}
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSupplierModal;
