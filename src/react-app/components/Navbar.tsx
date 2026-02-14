import { Link, useLocation } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { LogOut, Clock } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="glass-effect-strong border-b border-gray-200 shadow-lg backdrop-blur-xl relative z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/tracker" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:scale-105 transition-all">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span>TimeTracker</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/tracker"
              className={`font-bold transition-all ${
                location.pathname === "/tracker"
                  ? "text-blue-600 scale-110"
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              Tracker
            </Link>
            <Link
              to="/dashboard"
              className={`font-bold transition-all ${
                location.pathname === "/dashboard"
                  ? "text-blue-600 scale-110"
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/weekly"
              className={`font-bold transition-all ${
                location.pathname === "/weekly"
                  ? "text-blue-600 scale-110"
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              Weekly
            </Link>
            <Link
              to="/monthly"
              className={`font-bold transition-all ${
                location.pathname === "/monthly"
                  ? "text-blue-600 scale-110"
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              Monthly
            </Link>
            <Link
              to="/goals"
              className={`font-bold transition-all ${
                location.pathname === "/goals"
                  ? "text-blue-600 scale-110"
                  : "text-gray-700 hover:text-blue-600 hover:scale-105"
              }`}
            >
              Goals
            </Link>

            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
                <div className="hidden md:block text-sm">
                  <div className="text-gray-900 font-bold">{user.google_user_data.name}</div>
                  <div className="text-gray-600 text-xs font-medium">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-all hover:scale-110 font-bold"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
