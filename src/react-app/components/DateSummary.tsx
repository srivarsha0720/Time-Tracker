import { Clock, TrendingUp } from "lucide-react";

interface DateSummaryProps {
  totalMinutes: number;
}

export default function DateSummary({ totalMinutes }: DateSummaryProps) {
  const totalHours = (totalMinutes / 60).toFixed(1);
  const remainingMinutes = 1440 - totalMinutes;
  const remainingHours = (remainingMinutes / 60).toFixed(1);
  const percentageUsed = ((totalMinutes / 1440) * 100).toFixed(1);

  return (
    <div className="glass-effect-strong rounded-2xl shadow-2xl p-6 mb-6 border border-gray-200 backdrop-blur-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Time */}
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-700 mb-1 font-bold">Total Time Logged</div>
            <div className="text-2xl font-bold text-gray-900">{totalMinutes} min</div>
            <div className="text-sm text-gray-600 font-medium">({totalHours} hours)</div>
          </div>
        </div>

        {/* Remaining Time */}
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-700 mb-1 font-bold">Time Remaining</div>
            <div className="text-2xl font-bold text-gray-900">{remainingMinutes} min</div>
            <div className="text-sm text-gray-600 font-medium">({remainingHours} hours)</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col justify-center">
          <div className="text-sm text-gray-700 mb-2 font-bold">Day Progress</div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1 font-medium">{percentageUsed}% of 24 hours</div>
        </div>
      </div>
    </div>
  );
}
