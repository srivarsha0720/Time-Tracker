import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, LineChart, Line } from "recharts";
import Navbar from "@/react-app/components/Navbar";
import BackgroundDecoration from "@/react-app/components/BackgroundDecoration";
import { Activity, CATEGORY_COLORS } from "@/shared/types";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Clock } from "lucide-react";

interface DayData {
  date: string;
  dayName: string;
  totalMinutes: number;
  categories: Record<string, number>;
}

export default function WeeklyPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchWeeklyActivities();
    }
  }, [currentWeekStart, user]);

  const fetchWeeklyActivities = async () => {
    try {
      setIsLoading(true);
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(weekEnd, "yyyy-MM-dd");

      const response = await fetch(`/api/activities/range/${startDate}/${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch weekly activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
  });

  // Prepare data for charts
  const dailyData: DayData[] = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayActivities = activities.filter((a) => a.activity_date === dateStr);
    const totalMinutes = dayActivities.reduce((sum, a) => sum + a.duration, 0);
    
    const categories: Record<string, number> = {};
    dayActivities.forEach((a) => {
      categories[a.category] = (categories[a.category] || 0) + a.duration;
    });

    return {
      date: dateStr,
      dayName: format(day, "EEE"),
      totalMinutes,
      categories,
    };
  });

  // Prepare stacked bar chart data
  const stackedBarData = dailyData.map((day) => ({
    name: day.dayName,
    ...day.categories,
  }));

  // Prepare category trend data
  const categoryTrendData = dailyData.map((day) => {
    const result: any = { name: day.dayName };
    Object.keys(CATEGORY_COLORS).forEach((category) => {
      result[category] = day.categories[category] || 0;
    });
    return result;
  });

  // Calculate weekly totals
  const weeklyTotal = dailyData.reduce((sum, day) => sum + day.totalMinutes, 0);
  const weeklyHours = (weeklyTotal / 60).toFixed(1);
  const avgDailyMinutes = Math.round(weeklyTotal / 7);
  const avgDailyHours = (avgDailyMinutes / 60).toFixed(1);

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  activities.forEach((a) => {
    categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.duration;
  });

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
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
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Analytics</h1>
          <p className="text-gray-700 font-medium">Track your time across the week</p>
        </div>

        {/* Week Navigation */}
        <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={goToPreviousWeek}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Week
            </button>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), "MMM d, yyyy")}
              </div>
              <button
                onClick={goToCurrentWeek}
                className="text-sm text-gray-600 hover:text-gray-900 mt-1 font-medium"
              >
                Go to current week
              </button>
            </div>

            <button
              onClick={goToNextWeek}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              Next Week
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Weekly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-2">Total This Week</p>
                    <p className="text-3xl font-bold text-gray-900">{weeklyTotal} min</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{weeklyHours} hours</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-2">Daily Average</p>
                    <p className="text-3xl font-bold text-gray-900">{avgDailyMinutes} min</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{avgDailyHours} hours/day</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-2">Activities Logged</p>
                    <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">this week</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Time Distribution */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Time Distribution</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="dayName" 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                      label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#374151' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) => value ? [`${value} min (${(value / 60).toFixed(1)}h)`, "Time"] : ['0 min', 'Time']}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="totalMinutes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown by Day */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Breakdown by Day</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                      label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#374151' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) => value ? [`${value} min (${(value / 60).toFixed(1)}h)`, "Time"] : ['0 min', 'Time']}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}
                    />
                    <Legend />
                    {Object.keys(CATEGORY_COLORS).map((category) => (
                      <Bar 
                        key={category}
                        dataKey={category} 
                        stackId="a" 
                        fill={CATEGORY_COLORS[category]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Trends */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Trends Across Week</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={categoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                      label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#374151' }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) => value ? [`${value} min (${(value / 60).toFixed(1)}h)`, "Time"] : ['0 min', 'Time']}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}
                    />
                    <Legend />
                    {Object.keys(CATEGORY_COLORS).map((category) => (
                      <Line 
                        key={category}
                        type="monotone"
                        dataKey={category} 
                        stroke={CATEGORY_COLORS[category]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Category Summary */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Category Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryTotals).map(([category, minutes]) => (
                  <div
                    key={category}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      />
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {minutes} min
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {(minutes / 60).toFixed(1)} hours • {((minutes / weeklyTotal) * 100).toFixed(1)}% of week
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
