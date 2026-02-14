import { useState, useEffect } from "react";
import { CATEGORIES } from "@/shared/types";
import type { Activity } from "@/shared/types";
import { Plus, Save } from "lucide-react";

interface ActivityFormProps {
  selectedDate: string;
  onActivityAdded: () => void;
  editingActivity: Activity | null;
  onEditComplete: () => void;
}

export default function ActivityForm({
  selectedDate,
  onActivityAdded,
  editingActivity,
  onEditComplete,
}: ActivityFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Work");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingActivity) {
      setName(editingActivity.name);
      setCategory(editingActivity.category);
      setDuration(editingActivity.duration.toString());
    }
  }, [editingActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim() || !duration) {
      setError("Please fill in all fields");
      return;
    }

    const durationNum = parseInt(duration);
    if (durationNum <= 0 || durationNum > 1440) {
      setError("Duration must be between 1 and 1440 minutes");
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingActivity
        ? `/api/activities/${editingActivity.id}`
        : "/api/activities";
      
      const method = editingActivity ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          duration: durationNum,
          activity_date: selectedDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save activity");
        return;
      }

      // Reset form
      setName("");
      setCategory("Work");
      setDuration("");
      
      if (editingActivity) {
        onEditComplete();
      } else {
        onActivityAdded();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setCategory("Work");
    setDuration("");
    setError("");
    onEditComplete();
  };

  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {editingActivity ? "Edit Activity" : "Add New Activity"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Activity Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
              Activity Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning workout"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
              disabled={isSubmitting}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-bold text-gray-900 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min="1"
              max="1440"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg shadow-lg font-bold">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-xl hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingActivity ? (
              <>
                <Save className="w-4 h-4" />
                Update Activity
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Activity
              </>
            )}
          </button>
          
          {editingActivity && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 hover:bg-gray-50 hover:shadow-lg transition-all shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
