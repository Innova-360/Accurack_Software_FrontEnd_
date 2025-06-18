import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyOtp, resendOtp } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const OtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  // Get user email from localStorage on component mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  // Handle OTP input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 3) {
      (inputs[idx + 1].current as any)?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      (inputs[idx - 1].current as any)?.focus();
    }
  };
  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear any success messages
    setSuccessMessage("");

    // Check if all OTP fields are filled
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      alert("Please enter the complete 4-digit OTP");
      return;
    }

    // Check if email is available
    if (!userEmail) {
      alert("Email not found. Please try signing up again.");
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyOtp({
          email: userEmail,
          otp: otpString,
        })
      );

      if (verifyOtp.fulfilled.match(resultAction)) {
        console.log("OTP verification successful", resultAction.payload);
        // Navigate to dashboard or home page after successful verification
        navigate("/");
      } else {
        console.error("OTP verification failed", resultAction.payload);
        alert(resultAction.payload || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error during OTP verification", error);
      alert("An error occurred during OTP verification. Please try again.");
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!userEmail) {
      alert("Email not found. Please try signing up again.");
      return;
    }

    try {
      const resultAction = await dispatch(
        resendOtp({
          email: userEmail,
        })
      );

      if (resendOtp.fulfilled.match(resultAction)) {
        console.log("OTP resent successfully", resultAction.payload);
        setSuccessMessage("OTP has been resent to your email");
        // Clear current OTP inputs
        setOtp(["", "", "", ""]);
        // Focus on first input
        (inputs[0].current as any)?.focus();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("Failed to resend OTP", resultAction.payload);
        alert(resultAction.payload || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error during OTP resend", error);
      alert("An error occurred while resending OTP. Please try again.");
    }
  };

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

      {/* Right Section: OTP Card */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen order-2 md:order-none relative">
        {/* Arrow image: only visible on md and up, top left, low opacity */}
        <img
          src="/arrow.png"
          alt="Arrow"
          className="hidden md:block absolute left-8 top-30 w-24 h-24 object-contain opacity-30 pointer-events-none select-none"
        />
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 sm:p-8 mx-3 flex flex-col items-center mt-12">
          {/* Email Icon */}
          <div className="bg-[#eaf6f6] rounded-full p-3 mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#0b5c5a"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.091 7.091a2.25 2.25 0 01-3.182 0L3.909 8.584A2.25 2.25 0 013.25 6.993V6.75"
              />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#181c1f] mb-2 text-center">
            Please check your email.
          </h2>{" "}
          <p className="text-gray-500 text-center text-sm mb-5">
            We've sent a code to{" "}
            <span className="font-semibold text-[#0b5c5a]">
              {userEmail || "your email"}
            </span>
          </p>{" "}
          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm text-center mb-3 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          {/* Success message */}
          {successMessage && (
            <div className="text-green-500 text-sm text-center mb-3 bg-green-50 p-2 rounded">
              {successMessage}
            </div>
          )}
          {/* OTP Inputs */}
          <form
            className="flex flex-col items-center w-full"
            onSubmit={handleVerifyOtp}
          >
            <div className="flex justify-center gap-3 mb-4 w-full">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center border border-gray-200 rounded-lg text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] bg-[#f5f6fa]"
                  autoFocus={idx === 0}
                />
              ))}
            </div>{" "}
            <div className="text-xs text-gray-500 mb-5">
              Didn't get a code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-[#0b5c5a] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none p-0"
              >
                {loading ? "Sending..." : "Click to resend."}
              </button>
            </div>
            <div className="flex w-full gap-3 mt-2">
              <button
                type="button"
                className="flex-1 border border-gray-200 rounded-lg py-2 font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>{" "}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0b5c5a] text-white py-2 rounded-lg font-semibold hover:bg-[#094543] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
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

export default OtpPage;
