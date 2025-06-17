import { useState } from "react";

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f5f6fa]">
      {/* Left Section */}
      <div className="flex flex-col items-center justify-between h-auto md:h-full w-full md:w-1/2 relative order-1 md:order-none">
        {/* Upper Image Section*/}
        <div className="flex-none md:flex-1 flex items-end w-full">
          {/* Mobile Image */}
          <img
            src="/analysis-mobile.PNG"
            alt="Analysis Mobile"
            className="block md:hidden w-full object-cover h-80 sm:h-80"
            style={{ maxHeight: "100%", objectPosition: "left top" }}
          />
          {/* Desktop/Tablet Image */}
          <img
            src="/analysis-desktop.png"
            alt="Analysis Desktop"
            className="hidden md:block w-full object-contain h-48 sm:h-64  lg:h-full"
            style={{ maxHeight: "100%" }}
          />
        </div>
        {/* Lower Text Section*/}
        <div className="hidden md:flex bg-[#181c1f] flex-col justify-end px-4 sm:px-8 w-full py-6 sm:py-8 md:flex-1 order-3 md:order-none">
          {/* Logo */}
          <div className="flex items-center mb-6 sm:mb-8">
            <img
              src="/logo-dark.png"
              alt="Accurack Logo"
              className="h-8 sm:h-10 mr-3"
            />
          </div>
          {/* Main Text */}
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 max-w-lg">
            Let’s streamline your financial task today with Accurack.
          </h2>
          <p className="text-[#bfc9d1] text-base sm:text-lg max-w-md">
            The one-stop platform for all Inventory management of small and
            medium-sized business.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-start items-center w-full md:w-1/2 min-h-screen order-2 md:order-none relative">
        {/* Arrow image: only visible on md and up, top left, low opacity */}
        <img
          src="/arrow.png"
          alt="Arrow"
          className="hidden md:block absolute left-8 top-1 w-24 h-24 object-contain opacity-30 pointer-events-none select-none"
        />
        <h2 className="text-2xl sm:text-4xl font-bold text-[#181c1f] mb-6 sm:mb-8 text-center mt-25 ">
          Login First to Your Account
        </h2>
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-5 sm:p-8 mx-3 text-xs sm:text-sm mb-6 sm:mb-8">
          <form className="space-y-2 sm:space-y-3">
            <label className="block text-left text-[#181c1f] font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="youname@gmail.com"
              className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm placeholder:text-left flex items-center justify-center"
            />
            <label className="block text-left text-[#181c1f] font-medium mb-1 mt-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm placeholder:text-left flex items-center justify-center pr-10"
              />
              {/* Eye icon placeholder */}
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 accent-[#0b5c5a]"
                />
                <label htmlFor="rememberMe" className="text-gray-700">
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-[#0b5c5a] font-semibold hover:underline"
              >
                Forgot Password
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0b5c5a] text-white py-2 rounded-lg font-semibold hover:bg-[#094543] transition text-xs sm:text-sm mt-2"
            >
              Login
            </button>
          </form>
          {/* Social login section as per reference */}
          <div className="flex flex-col items-center mt-5">
            <span className="text-gray-500 text-xs mb-3">Continue With</span>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 cursor-pointer">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-6 w-6"
                />
              </span>
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 cursor-pointer">
                {/* New Apple SVG logo */}
                <img src="/apple.png" alt="Apple Fell on Newton" />
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-5">
            Don’t have an account?{" "}
            <a href="#" className="text-[#0b5c5a] font-semibold">
              Register Here
            </a>
          </p>
        </div>
        {/* Lower Text Section for mobile */}
        <p className="text-xs text-gray-400 mt-6 sm:mt-8 text-center">
          © 2025 Accurack. All rights reserved.
        </p>
        <div className="flex lg:hidden bg-[#181c1f] flex-col justify-end px-4 sm:px-8 w-full py-6 sm:py-8 mt-4">
          {/* Logo */}
          <div className="flex items-center mb-6 sm:mb-8">
            <img
              src="/logo-dark.png"
              alt="Accurack Logo"
              className="h-8 sm:h-10 mr-3"
            />
          </div>
          {/* Main Text */}
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 max-w-lg">
            Let’s streamline your financial task today with Accurack.
          </h2>
          <p className="text-[#bfc9d1] text-base sm:text-lg max-w-md">
            The one-stop platform for all Inventory management of small and
            medium-sized business.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
