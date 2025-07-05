import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome } from "react-icons/fa";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Image */}
        <div className="mb-8">
          <img
            src="/404.avif"
            alt="404 - Page Not Found"
            className="w-full h-full  mx-auto"
          />
        </div>

        {/* Error Message */}
       

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#03414C] to-[#0f4d57] text-white rounded-lg font-medium hover:from-[#0f4d57] hover:to-[#03414C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#03414C]/20"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-[#03414C] border border-[#03414C] rounded-lg font-medium hover:bg-[#03414C] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#03414C]/20"
          >
            <FaHome className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      
    </div>
  );
};

export default NotFound;
