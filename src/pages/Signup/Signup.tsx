import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import React Icons
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  googleAuth,
  createClientWithAdmin,
} from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("🚀 Starting signup process with data: ", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      companyAddress: formData.companyAddress,
    });

    // Validate form fields
    if (!formData.firstName.trim()) {
      toast.error("First Name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }
    if (!formData.companyEmail.trim()) {
      toast.error("Company Email is required");
      return;
    }

    // Company email validation
    if (!emailRegex.test(formData.companyEmail.trim())) {
      toast.error("Please enter a valid company email address");
      return;
    }

    if (!formData.companyPhone.trim()) {
      toast.error("Company Phone is required");
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.companyPhone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!formData.companyAddress.trim()) {
      toast.error("Company Address is required");
      return;
    }

    try {
      const resultAction = await dispatch(
        createClientWithAdmin({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          companyName: formData.companyName.trim(),
          companyEmail: formData.companyEmail.trim(),
          companyPhone: formData.companyPhone.trim(),
          companyAddress: formData.companyAddress.trim(),
        })
      );

      if (createClientWithAdmin.fulfilled.match(resultAction)) {
        toast.success("Account created successfully!");
        localStorage.setItem("userEmail", formData.email);
        navigate("/otp");
      } else {
        console.error("❌ Signup failed", resultAction.payload);
        const errorMessage =
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Signup failed";

        // Show helpful error messages
        if (errorMessage.includes("connect to server")) {
          toast.error(
            "Server connection failed. Please ensure the backend is running."
          );
        } else if (errorMessage.includes("CORS")) {
          toast.error("Configuration error. Please contact support.");
        } else if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("already registered")
        ) {
          toast.error(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("💥 Error during signup", error);
      toast.error("An error occurred during signup. Please try again.");
    }
  };
  const handleGoogleAuth = async () => {
    try {
      // Dispatch the Google auth action which will redirect to Google
      await dispatch(googleAuth());
    } catch (error) {
      console.error("Error during Google authentication", error);
      toast.error(
        "An error occurred during Google authentication. Please try again."
      );
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
        </h2>{" "}
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-5 sm:p-8 mx-3 text-xs sm:text-sm mb-6 sm:mb-8">
          <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Personal Information
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center"
                />
              </div>
            </div>
            {/* Password Fields */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Password
              </h3>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Toggle input type
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)} // Toggle visibility on click
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}{" "}
                    {/* Use React Icons */}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} // Toggle input type
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibility on click
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}{" "}
                    {/* Use React Icons */}
                  </span>
                </div>
              </div>
            </div>
            {/* Company Information */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Company Information
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center"
                />
                <input
                  type="email"
                  name="companyEmail"
                  placeholder="Company Email"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center"
                />
                <input
                  type="tel"
                  name="companyPhone"
                  placeholder="Company Phone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal flex items-center justify-center"
                />
                <textarea
                  name="companyAddress"
                  placeholder="Company Address"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal resize-none"
                />
              </div>
            </div>{" "}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0b5c5a] hover:bg-[#084c4a]"
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          {/* Social signup section */}
          <div className="flex flex-col items-center mt-5">
            <div className="flex items-center gap-3">
              <span className="text-black text-sm font-semibold">
                Continue With
              </span>{" "}
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleGoogleAuth}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-6 w-6"
                />
              </span>
            </div>
            <span className="flex items-center justify-center cursor-pointer mt-4">
              Already have an account?
              <button
                className="text-[#0b5c5a] cursor-pointer ml-2.5"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </span>
          </div>
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
