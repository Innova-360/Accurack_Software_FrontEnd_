import React, { useState, useEffect } from "react";
import { FaTh , FaClock, FaBars } from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lastUpdatedManager } from "../utils/lastUpdatedUtils";

const Navbar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update last updated time when authentication state changes (login/logout)
  useEffect(() => {
    lastUpdatedManager.updateLastUpdated();
  }, [isAuthenticated]);

  // Subscribe to last updated changes and update display
  useEffect(() => {
    const updateDisplay = () => {
      setLastUpdatedDisplay(lastUpdatedManager.formatLastUpdated());
    };

    // Initial update
    updateDisplay();

    // Subscribe to changes
    const unsubscribe = lastUpdatedManager.subscribe(updateDisplay);

    // Update display every minute to keep "Xm ago" current
    const interval = setInterval(updateDisplay, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="w-full bg-[#03414CF0] text-white text-sm font-medium px-0 py-0">
      <div className="hidden lg:flex items-center h-14">
        {/* Grid Icon */}
        <div
          className="flex items-center justify-center w-[56px] h-full border-r border-[#127F92]"
          onClick={() => navigate(`/store/${id}`)}
          style={{ cursor: "pointer" }}
        >
          <FaTh className="text-[20px]" />
        </div>
        {/* Logo */}
        <div className="flex items-center px-4 h-full border-r border-[#127F92] space-x-2">
          <div
            className="flex items-center gap-2.5"
            onClick={() => navigate(`/store/${id}`)}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/logo.svg"
              className="md:w-10 md:h-10 w-10 h-10"
              alt="logo"
            />
            <img
              src="/logoName.png"
              className="md:w-[93px] md:h-[33px] w-24 h-10"
              alt="Accurack"
            />
          </div>
        </div>
        {/* Sales Info */}
        {/* <div className="flex items-center px-4 h-full border-r border-[#127F92] space-x-2">
          <FaChartPie className="text-base" />
          <span>Sales: Mart</span>
        </div> */}
        {/* Spacer */}
        <div className="flex-grow" />
        {/* Last Updated */}
        <div className="flex items-center px-4 h-full">
          <div className="bg-[#03414CF0] text-xs px-3 py-[2px] rounded-md flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span>
              Last Updated: <strong>{lastUpdatedDisplay}</strong>
            </span>
          </div>
        </div>{" "}
        {/* Time */}
        <div className="flex items-center px-4 h-full space-x-1">
          <FaClock className="text-base" />
          <span>{currentTime}</span>
        </div>
        {/* Help */}
        {/* <div className="flex items-center px-4 h-full border-r border-[#127F92] space-x-2">
          <FiHelpCircle className="text-base" />
          <span>Help?</span>
        </div> */}
        {/* What's New */}
        <div className="flex items-center px-4 h-full border-r border-[#127F92] space-x-2">
          <MdCampaign className="text-base" />
          <span>
            <a
              href="https://accurack.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wat`s New?
            </a>
          </span>
        </div>
        {/* Clock In/Out */}
        <div className="flex items-center px-4 h-full border-r border-[#127F92] space-x-2">
          <FaClock className="text-base" />
          <span>Clock In/Out</span>
        </div>
        {/* Menu Icon */}
        <div className="flex items-center justify-center w-[56px] h-full">
          <FaBars className="text-xl" />
        </div>
      </div>
      {/* Mobile View */}
      <div className="flex justify-between items-center w-full h-14 px-4 lg:hidden">
        {/* Left Icon */}
        <div className="flex items-center justify-center w-[56px]">
          <FaTh className="text-[20px]" />
        </div>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              className="md:w-10 md:h-10 w-10 h-10"
              alt="logo"
            />
            <img
              src="/logoName.png"
              className="md:w-[93px] md:h-[33px] w-24 h-10"
              alt="Accurack"
            />
          </div>
        </div>

        {/* Right Icon */}
        <div className="flex items-center justify-center w-[56px]">
          <FaBars className="text-[20px]" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
