import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { format } from "date-fns";
import Navbar from "@/react-app/components/Navbar";
import LiveTimer from "@/react-app/components/LiveTimer";
import ActivityForm from "@/react-app/components/ActivityForm";
import ActivityList from "@/react-app/components/ActivityList";
import DateSummary from "@/react-app/components/DateSummary";
import BackgroundDecoration from "@/react-app/components/BackgroundDecoration";
import { Activity } from "@/shared/types";

export default function TrackerPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [selectedDate, user]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/activities/${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
        
        const total = data.reduce((sum: number, activity: Activity) => sum + activity.duration, 0);
        setTotalMinutes(total);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityAdded = () => {
    fetchActivities();
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchActivities();
      }
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const handleAnalyze = () => {
    navigate(`/dashboard?date=${selectedDate}`);
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Tracker</h1>
          <p className="text-gray-700 font-medium">Track your daily activities for {format(new Date(selectedDate), "MMMM d, yyyy")}</p>
        </div>

        {/* Date Selection */}
        <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 backdrop-blur-xl">
          <label htmlFor="date" className="block text-sm font-bold text-gray-900 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
          />
        </div>

        {/* Summary */}
        <DateSummary totalMinutes={totalMinutes} />

        {/* Live Timer */}
        <LiveTimer
          selectedDate={selectedDate}
          onTimerSaved={handleActivityAdded}
        />

        {/* Manual Entry Section */}
        <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Manual Entry</h3>
          <p className="text-sm text-gray-600 font-medium mb-4">
            Add or edit activities manually
          </p>
          
          <ActivityForm
            selectedDate={selectedDate}
            onActivityAdded={handleActivityAdded}
            editingActivity={editingActivity}
            onEditComplete={() => {
              setEditingActivity(null);
              fetchActivities();
            }}
          />
        </div>

        {/* Activities List */}
        <ActivityList
          activities={activities}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Analyze Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analyze This Day
          </button>
        </div>
      </div>
    </div>
  );
}
