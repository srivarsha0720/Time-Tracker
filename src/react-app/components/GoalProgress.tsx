import { useState, useEffect } from "react";
import { TrendingUp, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { CATEGORY_COLORS } from "@/shared/types";

interface GoalProgressData {
  id: number;
  category: string;
  target_minutes: number;
  current_minutes: number;
  percentage: number;
}

interface GoalProgressProps {
  selectedDate: string;
}

export default function GoalProgress({ selectedDate }: GoalProgressProps) {
  const [progress, setProgress] = useState<GoalProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [selectedDate]);

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/goals/progress/${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Failed to fetch goal progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (progress.length === 0) {
    return (
      <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Goal Progress</h2>
            <p className="text-sm text-gray-600 font-medium">Track your progress towards daily targets</p>
          </div>
        </div>
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No goals set</p>
          <p className="text-sm text-gray-500 mt-1">Set up goals to track your daily progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Goal Progress</h2>
          <p className="text-sm text-gray-600 font-medium">Track your progress towards daily targets</p>
        </div>
      </div>

      <div className="space-y-4">
        {progress.map((item) => {
          const isComplete = item.percentage >= 100;
          const isNearComplete = item.percentage >= 80 && item.percentage < 100;

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.category}</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {formatTime(item.current_minutes)} / {formatTime(item.target_minutes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Complete
                    </div>
                  ) : isNearComplete ? (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      Almost there!
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-gray-700">{item.percentage}%</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: isComplete
                      ? "#10b981"
                      : isNearComplete
                      ? "#f59e0b"
                      : CATEGORY_COLORS[item.category],
                  }}
                />
              </div>

              {/* Remaining Time */}
              {!isComplete && (
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  {formatTime(Math.max(0, item.target_minutes - item.current_minutes))} remaining
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
