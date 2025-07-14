import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaChevronDown,
  FaBuilding,
  FaKey,
  FaUserCircle,
} from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { updateLastUpdated } from "../utils/lastUpdatedUtils";
import toast from "react-hot-toast";
import apiClient from "../services/api";

interface ProfileDropdownProps {
  className?: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/users/me");
        console.log("Profile API Response:", response.data);
        if (response.data.success) {
          setProfile(response.data.data);
          console.log("Profile data set:", response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []); // Remove dependency on user since it's null

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      updateLastUpdated();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
    setIsOpen(false);
  };

  const handleProfileSettings = () => {
    navigate("/profile-settings");
    setIsOpen(false);
  };

  const handleBusinessSettings = () => {
    navigate("/business-settings");
    setIsOpen(false);
  };

  const handleChangePassword = () => {
    navigate("/change-password");
    setIsOpen(false);
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const displayName = profile?.firstName || profile?.lastName || "User";
  const userRole = profile?.role || "User";
  const userEmail = profile?.email || "";

  // Debug logging
  console.log("Profile:", profile);
  console.log("User:", user);
  console.log("Display Name:", displayName);
  console.log("User Role:", userRole);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-[#03414C]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#03414C]/20"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-[#03414C] to-[#0f4d57] rounded-full flex items-center justify-center text-white text-sm font-medium">
          <span>{getInitials(profile?.firstName, profile?.lastName, userEmail)}</span>
        </div>
        
        {/* User Info */}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
            {displayName}
          </p>
         
        </div>

        {/* Dropdown Arrow */}
        <FaChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#03414C] to-[#0f4d57] rounded-full flex items-center justify-center text-white text-sm font-medium">
                <span>{getInitials(profile?.firstName, profile?.lastName, userEmail)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
                <p className="text-xs text-[#03414C] font-medium capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileSettings}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#03414C] transition-colors duration-200"
            >
              <FaUserCircle className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={handleBusinessSettings}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#03414C] transition-colors duration-200"
            >
              <FaBuilding className="w-4 h-4" />
              <span>Business Settings</span>
            </button>

            <button
              onClick={handleChangePassword}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#03414C] transition-colors duration-200"
            >
              <FaKey className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
