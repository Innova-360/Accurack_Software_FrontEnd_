import { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/auth/signup/super-admin",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }
      );
      console.log("Signup successful", response.data);
    } catch (error) {
      console.error("Error during signup", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f5f6fa]">
      {/* Left Section */}
      <div className="flex flex-col items-center justify-between h-auto lg:h-full w-full lg:w-1/2 relative order-1 lg:order-none">
        {/* Upper Image Section*/}
        <div className="flex-none lg:flex-1 flex items-end w-full">
          {/* Mobile Image */}
          <img
            src="/analysis-mobile.PNG"
            alt="Analysis Mobile"
            className="block lg:hidden w-full object-cover h-48 sm:h-64 md:h-80"
            style={{ maxHeight: "100%", objectPosition: "left top" }}
          />
          {/* Desktop Image */}
          <img
            src="/analysis-desktop.png"
            alt="Analysis Desktop"
            className="hidden lg:block w-full object-contain h-48 sm:h-64 md:h-80 lg:h-full"
            style={{ maxHeight: "100%" }}
          />
        </div>
        {/* Lower Text Section*/}
        <div className="hidden lg:flex bg-[#181c1f] flex-col justify-end px-4 sm:px-8 w-full py-6 sm:py-8 lg:flex-1 order-3 lg:order-none">
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
      <div className="flex flex-col justify-start items-center w-full lg:w-1/2  min-h-screen order-2 lg:order-none">
        <h2 className="text-2xl sm:text-4xl font-bold text-[#181c1f] mb-6 sm:mb-8 text-center pt-8 sm:pt-16">
          Create Free Account
        </h2>
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-5 sm:p-8 mx-3 text-xs sm:text-sm mb-6 sm:mb-8">
          <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-center placeholder:text-center placeholder:font-normal flex items-center justify-center"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-center placeholder:text-center placeholder:font-normal flex items-center justify-center"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-center placeholder:text-center placeholder:font-normal flex items-center justify-center"
            />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-center placeholder:text-center placeholder:font-normal flex items-center justify-center"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-center placeholder:text-center placeholder:font-normal flex items-center justify-center"
            />
            <button
              type="submit"
              className="w-full bg-[#0b5c5a] text-white py-2 rounded-md font-medium hover:bg-[#084c4a] transition"
            >
              Sign Up
            </button>
          </form>
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

export default Signup;
