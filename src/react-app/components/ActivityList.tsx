import { Activity, CATEGORY_COLORS } from "@/shared/types";
import { Edit2, Trash2 } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

export default function ActivityList({
  activities,
  isLoading,
  onEdit,
  onDelete,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-700 font-medium">Start logging your day by adding your first activity above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-xl">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Activities for this Day</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[activity.category] }}
                  >
                    {activity.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {activity.duration} min
                    <span className="text-gray-600 ml-1">
                      ({(activity.duration / 60).toFixed(1)}h)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(activity)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-md"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
