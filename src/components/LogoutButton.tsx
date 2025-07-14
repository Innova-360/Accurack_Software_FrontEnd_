import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { updateLastUpdated } from "../utils/lastUpdatedUtils";
import toast from "react-hot-toast";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      updateLastUpdated();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
      title="Logout"
    >
      <FaSignOutAlt className="w-4 h-4" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
};

export default LogoutButton;
