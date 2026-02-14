import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import Navbar from "@/react-app/components/Navbar";
import BackgroundDecoration from "@/react-app/components/BackgroundDecoration";
import { Activity, CATEGORY_COLORS } from "@/shared/types";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Clock, BarChart3 } from "lucide-react";

interface DayData {
  date: string;
  dayNumber: number;
  totalMinutes: number;
  categories: Record<string, number>;
}

export default function MonthlyPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchMonthlyActivities();
    }
  }, [currentMonth, user]);

  const fetchMonthlyActivities = async () => {
    try {
      setIsLoading(true);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const startDate = format(monthStart, "yyyy-MM-dd");
      const endDate = format(monthEnd, "yyyy-MM-dd");

      const response = await fetch(`/api/activities/range/${startDate}/${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch monthly activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Prepare daily data
  const dailyData: DayData[] = monthDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayActivities = activities.filter((a) => a.activity_date === dateStr);
    const totalMinutes = dayActivities.reduce((sum, a) => sum + a.duration, 0);
    
    const categories: Record<string, number> = {};
    dayActivities.forEach((a) => {
      categories[a.category] = (categories[a.category] || 0) + a.duration;
    });

    return {
      date: dateStr,
      dayNumber: day.getDate(),
      totalMinutes,
      categories,
    };
  });

  // Prepare weekly aggregated data
  const weeks = eachWeekOfInterval(
    {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    },
    { weekStartsOn: 0 }
  );

  const weeklyData = weeks.map((weekStart, index) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekActivities = activities.filter((a) => {
      const actDate = new Date(a.activity_date);
      return actDate >= weekStart && actDate <= weekEnd;
    });

    const totalMinutes = weekActivities.reduce((sum, a) => sum + a.duration, 0);
    const categories: Record<string, number> = {};
    
    weekActivities.forEach((a) => {
      categories[a.category] = (categories[a.category] || 0) + a.duration;
    });

    return {
      name: `Week ${index + 1}`,
      totalMinutes,
      ...categories,
    };
  });

  // Calculate monthly totals
  const monthlyTotal = dailyData.reduce((sum, day) => sum + day.totalMinutes, 0);
  const monthlyHours = (monthlyTotal / 60).toFixed(1);
  const daysWithActivity = dailyData.filter((d) => d.totalMinutes > 0).length;
  const avgDailyMinutes = daysWithActivity > 0 ? Math.round(monthlyTotal / daysWithActivity) : 0;
  const avgDailyHours = (avgDailyMinutes / 60).toFixed(1);

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  activities.forEach((a) => {
    categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.duration;
  });

  // Category trend over days
  const categoryTrendData = dailyData.map((day) => {
    const result: any = { day: day.dayNumber };
    Object.keys(CATEGORY_COLORS).forEach((category) => {
      result[category] = day.categories[category] || 0;
    });
    return result;
  });

  // Most productive day
  const mostProductiveDay = dailyData.reduce((max, day) => 
    day.totalMinutes > max.totalMinutes ? day : max
  , dailyData[0] || { totalMinutes: 0, date: '', dayNumber: 0, categories: {} });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Analytics</h1>
          <p className="text-gray-700 font-medium">Track your time across the month</p>
        </div>

        {/* Month Navigation */}
        <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={goToPreviousMonth}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Month
            </button>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <button
                onClick={goToCurrentMonth}
                className="text-sm text-gray-600 hover:text-gray-900 mt-1 font-medium"
              >
                Go to current month
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              Next Month
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
            {/* Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-2">Total This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{monthlyTotal} min</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{monthlyHours} hours</p>
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
                    <p className="text-sm font-bold text-gray-700 mb-2">Active Days</p>
                    <p className="text-3xl font-bold text-gray-900">{daysWithActivity}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">of {monthDays.length} days</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-2">Activities</p>
                    <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">this month</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-600 to-teal-600 p-3 rounded-xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Most Productive Day Highlight */}
            {mostProductiveDay.totalMinutes > 0 && (
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Most Productive Day</h3>
                    <p className="text-gray-700 font-medium">
                      {format(new Date(mostProductiveDay.date), "MMMM d, yyyy")} - {mostProductiveDay.totalMinutes} minutes ({(mostProductiveDay.totalMinutes / 60).toFixed(1)} hours)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Activity Chart */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Activity Throughout Month</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="dayNumber" 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                      label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: '#374151' }}
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
                    <Area 
                      type="monotone" 
                      dataKey="totalMinutes" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMinutes)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Comparison */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Comparison</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Trends Across Month</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={categoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#374151"
                      style={{ fontSize: '14px' }}
                      label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: '#374151' }}
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
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Category Summary */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Category Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, minutes]) => (
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
                        {(minutes / 60).toFixed(1)} hours • {((minutes / monthlyTotal) * 100).toFixed(1)}% of month
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
