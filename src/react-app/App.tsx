import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import LandingPage from "@/react-app/pages/Landing";
import TrackerPage from "@/react-app/pages/Tracker";
import DashboardPage from "@/react-app/pages/Dashboard";
import WeeklyPage from "@/react-app/pages/Weekly";
import MonthlyPage from "@/react-app/pages/Monthly";
import GoalsPage from "@/react-app/pages/Goals";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/weekly" element={<WeeklyPage />} />
          <Route path="/monthly" element={<MonthlyPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
