import { useState } from "react";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Activity, CATEGORY_COLORS } from "@/shared/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DateRangeComparison() {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchActivities = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before or equal to end date");
      return;
    }

    const daysDiff = differenceInDays(new Date(endDate), new Date(startDate));
    if (daysDiff > 90) {
      alert("Maximum range is 90 days");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/activities/range/${startDate}/${endDate}`);
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

  // Group activities by date
  const activitiesByDate = activities.reduce((acc, activity) => {
    if (!acc[activity.activity_date]) {
      acc[activity.activity_date] = [];
    }
    acc[activity.activity_date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  // Calculate daily totals
  const dailyData = Object.entries(activitiesByDate)
    .map(([date, acts]) => {
      const total = acts.reduce((sum, a) => sum + a.duration, 0);
      const categoryBreakdown = acts.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + a.duration;
        return acc;
      }, {} as Record<string, number>);

      return {
        date: format(new Date(date), "MMM d"),
        fullDate: date,
        total,
        hours: (total / 60).toFixed(1),
        ...categoryBreakdown,
      };
    })
    .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

  // Calculate overall stats
  const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
  const avgMinutesPerDay = dailyData.length > 0 ? totalMinutes / dailyData.length : 0;
  
  const categoryTotals = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.duration;
    return acc;
  }, {} as Record<string, number>);

  const categories = Array.from(new Set(activities.map(a => a.category)));

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-lg shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Time Period Comparison</h3>
            <p className="text-gray-700 font-medium mb-4">
              Compare your activities across different time periods (up to 90 days)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="start-date" className="block text-sm font-bold text-gray-900 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-bold text-gray-900 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
            />
          </div>

          <button
            onClick={fetchActivities}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Compare
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && !isLoading && (
        <>
          {activities.length === 0 ? (
            <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-12 text-center backdrop-blur-xl">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600 font-medium">
                No activities recorded during this time period
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Total Time</h4>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{(totalMinutes / 60).toFixed(1)}h</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">{totalMinutes} minutes</p>
                </div>

                <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">Daily Average</h4>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{(avgMinutesPerDay / 60).toFixed(1)}h</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">{Math.round(avgMinutesPerDay)} min/day</p>
                </div>

                <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-pink-600" />
                    <h4 className="font-semibold text-gray-900">Total Activities</h4>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">Across {dailyData.length} days</p>
                </div>
              </div>

              {/* Daily Comparison Chart */}
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Time Breakdown</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#374151"
                        style={{ fontSize: '11px' }}
                      />
                      <YAxis 
                        stroke="#374151"
                        style={{ fontSize: '11px' }}
                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#374151' }}
                      />
                      <Tooltip
                        formatter={(value: number | undefined) => value ? [`${value} min (${(value / 60).toFixed(1)}h)`, "Duration"] : ['0 min', 'Duration']}
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px' }}
                      />
                      <Legend />
                      {categories.map((category) => (
                        <Bar 
                          key={category}
                          dataKey={category} 
                          stackId="a" 
                          fill={CATEGORY_COLORS[category]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Totals */}
              <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Category Totals for Period</h3>
                <div className="space-y-4">
                  {Object.entries(categoryTotals)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, minutes]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-lg"
                            style={{ backgroundColor: CATEGORY_COLORS[category] }}
                          />
                          <span className="font-medium text-gray-900">{category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 font-semibold">{minutes} min</span>
                          <span className="text-gray-600 text-sm ml-2 font-medium">
                            ({(minutes / 60).toFixed(1)}h)
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            {((minutes / totalMinutes) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
