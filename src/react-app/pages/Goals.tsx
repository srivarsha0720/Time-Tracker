import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { format } from "date-fns";
import Navbar from "@/react-app/components/Navbar";
import BackgroundDecoration from "@/react-app/components/BackgroundDecoration";
import GoalManager from "@/react-app/components/GoalManager";
import GoalProgress from "@/react-app/components/GoalProgress";

export default function GoalsPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg-cool relative overflow-hidden">
      <BackgroundDecoration />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Goals & Progress</h1>
          <p className="text-gray-700 font-medium">Set daily targets and track your progress</p>
        </div>

        {/* Goal Manager */}
        <div className="mb-8">
          <GoalManager />
        </div>

        {/* Date Selection for Progress */}
        <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 backdrop-blur-xl">
          <label htmlFor="date" className="block text-sm font-bold text-gray-900 mb-2">
            View Progress For Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
          />
        </div>

        {/* Goal Progress */}
        <GoalProgress selectedDate={selectedDate} />

        {/* Help Section */}
        <div className="mt-8 glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How Goals Work</h3>
          <div className="space-y-2 text-gray-700 text-sm font-medium">
            <p>• Set a daily time target for each category (e.g., 2 hours of Work, 30 minutes of Exercise)</p>
            <p>• Track your progress throughout the day as you log activities</p>
            <p>• Visual progress bars show how close you are to reaching each goal</p>
            <p>• Goals are daily targets - they reset each day to help you maintain consistency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
