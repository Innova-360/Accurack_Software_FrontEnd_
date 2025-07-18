import React from 'react';
import toast from 'react-hot-toast';

interface ToastConfirmationProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  toastId: string;
}

const ToastConfirmation: React.FC<ToastConfirmationProps> = ({
  message,
  onConfirm,
  onCancel,
  toastId,
}) => {
  const handleConfirm = () => {
    toast.dismiss(toastId);
    onConfirm();
  };

  const handleCancel = () => {
    toast.dismiss(toastId);
    onCancel();
  };

  return (
    <div className="flex flex-col justify-between items-center gap-3 p-3 bg-white rounded shadow-md ">
      <div className="text-sm text-gray-800">{message}</div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ToastConfirmation;

// Helper function to show confirmation toast
export const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel: () => void = () => {}
) => {
  const toastId = Date.now().toString();
  
  toast.custom(
    <ToastConfirmation
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      toastId={toastId}
    />,
    {
      id: toastId,
      duration: Infinity, // Keep open until user interacts
      position: 'top-center',
    }
  );
};
