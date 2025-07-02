import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../store/hooks";
import { googleAuthCallback } from "../store/slices/authSlice";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      if (error) {
        console.error("Google OAuth error:", error);
        toast.error("Google authentication failed");
        navigate("/login");
        return;
      }

      if (code) {
        try {
          const resultAction = await dispatch(
            googleAuthCallback({ code, state: state || undefined })
          );
          if (googleAuthCallback.fulfilled.match(resultAction)) {
            navigate("/");
          } else {
            console.error("Google authentication failed", resultAction.payload);
            toast.error("Google authentication failed");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error during Google authentication callback", error);
          toast.error(
            "An error occurred during authentication. Please try again."
          );
          navigate("/login");
        }
      } else {
        console.error("No authorization code received");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b5c5a] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
