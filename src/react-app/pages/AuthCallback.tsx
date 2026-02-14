import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/tracker");
      } catch (error) {
        console.error("Authentication failed:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
