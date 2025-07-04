import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  inviteEmployee,
  fetchRoleTemplates,
} from "../../store/slices/employeeSlice";

interface EmployeeInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeInviteModal: React.FC<EmployeeInviteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  // const { loading, roleTemplates } = useSelector((state: RootState) => state.employees);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    roleTemplateId: "",
    storeIds: [""],
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
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.roleTemplateId)
      newErrors.roleTemplateId = "Role template is required";
    if (!formData.storeIds[0])
      newErrors.storeIds = "At least one store is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;
};

export default EmployeeInviteModal;
