import React, { useState, useRef, useEffect } from "react";
import { Check, X, Edit2 } from "lucide-react";

interface EditableStatusProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating?: boolean;
  canEdit?: boolean;
}

const EditableStatus: React.FC<EditableStatusProps> = ({
  status,
  onStatusChange,
  isUpdating = false,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState(status || "Pending");
  const selectRef = useRef<HTMLSelectElement>(null);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const getStatusBadge = (statusValue: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      pending: { color: "bg-yellow-500", text: "Pending" },
      confirmed: { color: "bg-green-500", text: "Confirmed" },
      shipped: { color: "bg-blue-500", text: "Shipped" },
      completed: { color: "bg-teal-500", text: "Completed" },
      cancelled: { color: "bg-red-500", text: "Cancelled" },
    };

    const normalizedStatus = statusValue?.toLowerCase() || "pending";
    const config = statusConfig[normalizedStatus] || {
      color: "bg-gray-500",
      text: statusValue || "Unknown",
    };

    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded cursor-pointer hover:bg-gray-200 transition-colors">
        <div className={`w-2 h-2 rounded-full mr-1 ${config.color}`}></div>
        {config.text}
        {canEdit && (
          <Edit2 className="w-3 h-3 ml-1 text-gray-500 cursor-pointer" />
        )}
      </span>
    );
  };

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const normalizedStatus = status || "Pending";
    setTempStatus(normalizedStatus);
  }, [status]);

  const handleStartEdit = () => {
    if (!canEdit) return;
    const currentStatus = status || "Pending";
    setTempStatus(currentStatus);
    setIsEditing(true);
  };

  const handleSave = () => {
    const currentStatus = status || "Pending";
    if (tempStatus !== currentStatus) {
      onStatusChange(tempStatus);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    const currentStatus = status || "Pending";
    setTempStatus(currentStatus);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <select
          ref={selectRef}
          value={tempStatus}
          onChange={(e) => setTempStatus(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUpdating}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
          title="Save"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isUpdating}
          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div onClick={handleStartEdit}>
      {getStatusBadge(status)}
    </div>
  );
};

export default EditableStatus;
