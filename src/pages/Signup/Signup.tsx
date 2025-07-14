import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import React Icons
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  googleAuth,
  createClientWithAdmin,
} from "../../store/slices/authSlice";
import {
  fetchCountriesThunk,
  type CountryWithCities,
} from "../../store/slices/taxSlice";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyPhone: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [typingTimeouts, setTypingTimeouts] = useState<Record<string, number>>(
    {}
  );
  const [countries, setCountries] = useState<CountryWithCities[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<
    CountryWithCities[]
  >([]);
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);
  const { countries: countriesFromStore } = useAppSelector(
    (state) => state.tax
  );

  // Fetch countries and set up states when component mounts
  useEffect(() => {
    dispatch(fetchCountriesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (countriesFromStore.length > 0) {
      setCountries(countriesFromStore);
    }
  }, [countriesFromStore]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeouts).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [typingTimeouts]);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (c) => c.country === formData.country
      );
      if (selectedCountry && selectedCountry.cities) {
        setStates(selectedCountry.cities);
      } else {
        setStates([]);
      }
      // Clear state when country changes
      if (formData.state && selectedCountry) {
        setFormData((prev) => ({ ...prev, state: "" }));
      }
    }
  }, [formData.country, countries]);

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        return !value.trim() ? "First Name is required" : "";
      case "lastName":
        return !value.trim() ? "Last Name is required" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value.trim())
          ? "Please enter a valid email address"
          : "";
      case "password":
        if (!value) return "Password is required";
        return value.length < 6
          ? "Password must be at least 6 characters long"
          : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(
                value
              )
            ? "Password must have Uppercase, Lowercase, Number and Special Character"
            : "";
      case "confirmPassword":
        if (!value) return "Confirm Password is required";
        return value !== formData.password ? "Passwords do not match" : "";
      case "companyName":
        return !value.trim() ? "Business Name is required" : "";
      case "companyPhone":
        if (!value.trim()) return "Business Phone is required";
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return !phoneRegex.test(value.trim())
          ? "Please enter a valid phone number"
          : "";
      case "streetAddress":
        return !value.trim() ? "Street Address is required" : "";
      case "city":
        return !value.trim() ? "City is required" : "";
      case "state":
        return !value.trim() ? "State is required" : "";
      case "country":
        return !value.trim() ? "Country is required" : "";
      case "zipCode":
        if (!value.trim()) return "Zip Code is required";
        const zipRegex = /^[0-9A-Za-z\s\-]{3,10}$/;
        return !zipRegex.test(value.trim())
          ? "Please enter a valid zip code"
          : "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle country search
    if (name === "country") {
      if (value.length > 0) {
        const filtered = countries.filter((country) =>
          country.country.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCountries(filtered.slice(0, 10));
        setShowCountryDropdown(true);
      } else {
        setShowCountryDropdown(false);
      }
    }

    // Handle state search
    if (name === "state") {
      if (value.length > 0 && states.length > 0) {
        const filtered = states.filter((state) =>
          state.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredStates(filtered.slice(0, 10));
        setShowStateDropdown(true);
      } else {
        setShowStateDropdown(false);
      }
    }

    // Clear error when user starts typing (provides immediate feedback when fixing)
    if (touched[name] && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear existing timeout for this field
    if (typingTimeouts[name]) {
      clearTimeout(typingTimeouts[name]);
    }

    const timeoutId = setTimeout(() => {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
      setTouched((prev) => ({ ...prev, [name]: true }));
    }, 300); // Validate after 300ms of no typing

    setTypingTimeouts((prev) => ({ ...prev, [name]: timeoutId }));
  };

  const selectCountry = (country: CountryWithCities) => {
    setFormData((prev) => ({ ...prev, country: country.country, state: "" }));
    setShowCountryDropdown(false);
    setErrors((prev) => ({ ...prev, country: "" }));
  };

  const selectState = (state: string) => {
    setFormData((prev) => ({ ...prev, state }));
    setShowStateDropdown(false);
    setErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    // Close dropdowns on blur
    setTimeout(() => {
      if (name === "country") setShowCountryDropdown(false);
      if (name === "state") setShowStateDropdown(false);
    }, 150);
  };

  // Helper function to get input classes
  const getInputClasses = (fieldName: string, baseClasses: string = "") => {
    const hasError = touched[fieldName] && errors[fieldName];
    const errorClasses = hasError
      ? "border-red-500 focus:ring-red-500 focus:border-red-100"
      : "border-gray-200 focus:ring-[#0b5c5a] focus:border-[#0b5c5a]";

    return `w-full px-2 sm:px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-xs sm:text-sm text-left placeholder:text-left placeholder:font-normal ${errorClasses} ${baseClasses}`;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Combine address fields for backend - only include non-empty fields
    const addressParts = [
      formData.streetAddress.trim(),
      formData.city.trim(),
      formData.state.trim(),
      formData.country.trim(),
      formData.zipCode.trim(),
    ].filter((part) => part !== "");

    const companyAddress = addressParts.join(", ");

    // Validate all fields
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
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
          companyEmail: formData.email.trim(),
          companyPhone: formData.companyPhone.trim(),
          companyAddress, // This contains the combined address
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
    <div className="min-h-screen flex flex-col lg:flex-row ">
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
          Create an Account
        </h2>{" "}
        <div className="w-full max-w-lg bg-white rounded-xl px-6 sm:px-10 mx-3 text-xs sm:text-sm mb-6 sm:mb-8">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses("firstName")}
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses("lastName")}
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <br />
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create Password *"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClasses("password", "pr-10")}
                      />
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-5 h-5" />
                        ) : (
                          <FaEye className="w-5 h-5" />
                        )}
                      </span>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password *"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClasses("confirmPassword", "pr-10")}
                      />
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="w-5 h-5" />
                        ) : (
                          <FaEye className="w-5 h-5" />
                        )}
                      </span>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Company Information */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Business Information
              </h3>
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Business Name *"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("companyName")}
                  />
                  {touched.companyName && errors.companyName && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Business Email *"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("email")}
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    name="companyPhone"
                    placeholder="Business Phone *"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("companyPhone")}
                  />
                  {touched.companyPhone && errors.companyPhone && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      {errors.companyPhone}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="country"
                    placeholder="Select your Country *"
                    value={formData.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("country")}
                  />
                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {filteredCountries.map((country, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectCountry(country)}
                        >
                          {country.country}
                        </div>
                      ))}
                    </div>
                  )}
                  {touched.country && errors.country && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Address Information */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Address Information
              </h3>
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    name="streetAddress"
                    placeholder="Street Address *"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("streetAddress")}
                  />
                  {touched.streetAddress && errors.streetAddress && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      {errors.streetAddress}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("city")}
                  />
                  {touched.city && errors.city && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="state"
                      placeholder="State *"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses("state")}
                    />
                    {/* {showStateDropdown && filteredStates.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                        {filteredStates.map((state, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectState(state)}
                          >
                            {state}
                          </div>
                        ))}
                      </div>
                    )} */}
                    {touched.state && errors.state && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="Zip Code *"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses("zipCode")}
                    />
                    {touched.zipCode && errors.zipCode && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>
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
