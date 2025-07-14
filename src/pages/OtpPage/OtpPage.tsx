import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyOtp, resendOtp } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const OtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userEmail, setUserEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(() => {
    // Initialize timer from localStorage
    const savedTimer = localStorage.getItem("otpResendTimer");
    const savedTimestamp = localStorage.getItem("otpResendTimestamp");

    if (savedTimer && savedTimestamp) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(savedTimestamp)) / 1000
      );
      const remaining = Math.max(0, 60 - elapsed);
      return remaining;
    }

    return 60;
  });
  const [canResend, setCanResend] = useState(() => {
    // Check if we can resend based on saved timer
    const savedTimer = localStorage.getItem("otpResendTimer");
    const savedTimestamp = localStorage.getItem("otpResendTimestamp");

    if (savedTimer && savedTimestamp) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(savedTimestamp)) / 1000
      );
      return elapsed >= 60;
    }

    return false;
  });

  const inputs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { verifyLoading, resendLoading, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }

    // Start initial timer if no timer data exists
    const savedTimer = localStorage.getItem("otpResendTimer");
    const savedTimestamp = localStorage.getItem("otpResendTimestamp");

    if (!savedTimer || !savedTimestamp) {
      // Start initial 60-second timer
      localStorage.setItem("otpResendTimer", "60");
      localStorage.setItem("otpResendTimestamp", Date.now().toString());
    }
  }, []);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      // Don't clear timer on unmount - let it persist for page reloads
    };
  }, []);

  // Timer for resend OTP functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        const newTimer = resendTimer - 1;
        setResendTimer(newTimer);
        // Update localStorage with current timer state
        localStorage.setItem("otpResendTimer", newTimer.toString());
      }, 1000);
    } else {
      setCanResend(true);
      // Clear timer from localStorage when timer reaches 0
      localStorage.removeItem("otpResendTimer");
      localStorage.removeItem("otpResendTimestamp");
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

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
    if (val && idx < 5) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inputs[idx + 1].current as any)?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inputs[idx - 1].current as any)?.focus();
    }
  };
  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("");

    // Check if all OTP fields are filled
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    // Check if email is available
    if (!userEmail) {
      toast.error("Email not found. Please try signing up again.");
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
        toast.success("Email verified successfully!");

        // Clear userEmail and timer from localStorage since OTP is verified
        localStorage.removeItem("userEmail");
        localStorage.removeItem("otpResendTimer");
        localStorage.removeItem("otpResendTimestamp");

        // Check if user is now authenticated (has token)
        if (resultAction.payload.token) {
          navigate("/stores");
        } else {
          navigate("/login");
        }
      } else {
        console.error("❌ OTP verification failed", resultAction.payload);
        toast.error(
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "OTP verification failed"
        );
      }
    } catch (error) {
      console.error("💥 Error during OTP verification", error);
      toast.error(
        "An error occurred during OTP verification. Please try again."
      );
    }
  };

  // Add this function inside your component
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 6) {
      setOtp(paste.split(""));
      // Optionally, focus the last input
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (inputs[5].current as any)?.focus();
      e.preventDefault();
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!userEmail) {
      toast.error("Email not found. Please try signing up again.");
      return;
    }

    if (!canResend) {
      toast.error(`Please wait ${resendTimer} seconds before resending.`);
      return;
    }

    try {
      const resultAction = await dispatch(resendOtp(userEmail));

      if (resendOtp.fulfilled.match(resultAction)) {
        toast.success("OTP has been resent to your email!");
        setResendTimer(60);
        setCanResend(false);
        // Store timer state in localStorage
        localStorage.setItem("otpResendTimer", "60");
        localStorage.setItem("otpResendTimestamp", Date.now().toString());
        // Clear the current OTP input
        setOtp(["", "", "", "", "", ""]);
        // Focus on first input
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (inputs[0].current as any)?.focus();
      } else {
        console.error("❌ Resend OTP failed", resultAction.payload);
        toast.error(
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Failed to resend OTP"
        );
      }
    } catch (error) {
      console.error("💥 Error during resend OTP", error);
      toast.error("An error occurred while resending OTP. Please try again.");
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
          </h2>
          <p className="text-gray-500 text-center text-sm mb-5">
            We've sent a code to{" "}
            <span className="font-semibold text-[#0b5c5a]">
              {userEmail || "your email"}
            </span>
          </p>
          {/* Loading message for initial OTP sending 
          {!initialOtpSent && loading && (
            <div className="text-blue-500 text-sm text-center mb-3 bg-blue-50 p-2 rounded">
              Sending OTP to your email...
            </div>
          )}
            */}
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
            {" "}
            <div className="flex justify-center gap-2 mb-4 w-full">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onPaste={idx === 0 ? handlePaste : undefined} // <-- Add this line
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#0b5c5a] bg-[#f5f6fa]"
                  autoFocus={idx === 0}
                />
              ))}
            </div>{" "}
            <div className="text-xs text-gray-500 mb-3">
              Code expires in 10 minutes
            </div>
            {/* Resend OTP Section */}
            <div className="text-center mb-5">
              <p className="text-sm text-gray-500 mb-2">
                Didn't receive a code?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-[#0b5c5a] text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Resending..." : "Resend Code"}
                </button>
              ) : (
                <span className="text-sm text-gray-400">
                  Resend in {resendTimer}s
                </span>
              )}
            </div>
            <div className="flex w-full gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  // Clear timer when user cancels
                  localStorage.removeItem("otpResendTimer");
                  localStorage.removeItem("otpResendTimestamp");
                  navigate("/signup");
                }}
                className="flex-1 border border-gray-200 rounded-lg py-2 font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyLoading}
                className="flex-1 bg-[#0b5c5a] text-white py-2 rounded-lg font-semibold hover:bg-[#094543] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyLoading ? "Verifying..." : "Verify"}
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
