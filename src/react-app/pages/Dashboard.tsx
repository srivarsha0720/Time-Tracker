import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import Navbar from "@/react-app/components/Navbar";
import StatsCard from "@/react-app/components/StatsCard";
import NoDataView from "@/react-app/components/NoDataView";
import BackgroundDecoration from "@/react-app/components/BackgroundDecoration";
import ExportReports from "@/react-app/components/ExportReports";
import DateRangeComparison from "@/react-app/components/DateRangeComparison";
import { Activity, CATEGORY_COLORS } from "@/shared/types";
import { Clock, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
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
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMinutes = activities.reduce((sum, activity) => sum + activity.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const numberOfActivities = activities.length;

  // Calculate time per category
  const categoryData = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = 0;
    }
    acc[activity.category] += activity.duration;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([category, minutes]) => ({
    name: category,
    value: minutes,
    hours: (minutes / 60).toFixed(1),
  }));

  const uniqueCategories = new Set(activities.map((a) => a.category)).size;

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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-700 font-medium">Insights into how you spent your time</p>
        </div>

        {/* Date Selection */}
        <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 backdrop-blur-xl">
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <NoDataView />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={<Clock className="w-6 h-6 text-blue-600" />}
                label="Total Minutes"
                value={totalMinutes.toString()}
                bgColor="bg-blue-50"
              />
              <StatsCard
                icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
                label="Total Hours"
                value={totalHours}
                bgColor="bg-indigo-50"
              />
              <StatsCard
                icon={<Calendar className="w-6 h-6 text-purple-600" />}
                label="Activities"
                value={numberOfActivities.toString()}
                bgColor="bg-purple-50"
              />
              <StatsCard
                icon={<BarChart3 className="w-6 h-6 text-pink-600" />}
                label="Categories"
                value={uniqueCategories.toString()}
                bgColor="bg-pink-50"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart */}
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Time Distribution (Pie Chart)</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.hours}h`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) => value ? [`${value} minutes (${(value / 60).toFixed(1)}h)`, "Duration"] : ['0 minutes', 'Duration']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Comparison (Bar Chart)</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#374151"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#374151"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#374151' }}
                      />
                      <Tooltip
                        formatter={(value: number | undefined) => value ? [`${value} minutes (${(value / 60).toFixed(1)}h)`, "Duration"] : ['0 minutes', 'Duration']}
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Timeline</h2>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ backgroundColor: CATEGORY_COLORS[activity.category] }}
                      />
                      {index < activities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2" style={{ minHeight: '40px' }} />
                      )}
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all border border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-gray-900 font-semibold">{activity.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                              style={{ backgroundColor: CATEGORY_COLORS[activity.category] }}
                            >
                              {activity.category}
                            </span>
                            <span className="text-gray-700 text-sm font-medium">
                              {activity.duration} min ({(activity.duration / 60).toFixed(1)}h)
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-600 text-xs font-medium">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Breakdown</h2>
              <div className="space-y-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ backgroundColor: CATEGORY_COLORS[item.name] }}
                      />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 font-semibold">{item.value} min</span>
                      <span className="text-gray-600 text-sm ml-2 font-medium">({item.hours}h)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Reports */}
            <ExportReports 
              activities={activities}
              selectedDate={selectedDate}
              totalMinutes={totalMinutes}
            />


          </>
        )}

        {/* Custom Time Period Comparison */}
        <div className="mt-8">
          <DateRangeComparison />
        </div>
      </div>
    </div>
  );
}
