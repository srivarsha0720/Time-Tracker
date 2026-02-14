import { useState, useEffect } from "react";
import { Target, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Goal, CATEGORIES, CATEGORY_COLORS } from "@/shared/types";

export default function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: "" as Goal["category"] | "",
    target_minutes: 60,
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.category) {
      setErrorMessage("Please select a category");
      return;
    }

    if (formData.target_minutes < 1) {
      setErrorMessage("Target must be at least 1 minute");
      return;
    }

    try {
      const url = editingId ? `/api/goals/${editingId}` : "/api/goals";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchGoals();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ category: "", target_minutes: 60 });
      } else {
        setErrorMessage(data.error || "Failed to save goal");
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
      setErrorMessage("Network error. Please try again.");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setFormData({
      category: goal.category,
      target_minutes: goal.target_minutes,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ category: "", target_minutes: 60 });
    setErrorMessage("");
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

  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daily Goals</h2>
            <p className="text-sm text-gray-600 font-medium">Set daily time targets for each category</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg font-bold">
          {errorMessage}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Goal" : "New Goal"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal["category"] })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Daily Target (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.target_minutes}
                onChange={(e) => setFormData({ ...formData, target_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg text-gray-900 font-medium"
                required
              />
              <p className="text-xs text-gray-600 mt-1 font-medium">
                {formatTime(formData.target_minutes)} per day
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              {editingId ? "Update Goal" : "Save Goal"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No goals set yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Goal" to create your first daily target</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: CATEGORY_COLORS[goal.category] }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{goal.category}</h4>
                  <p className="text-sm text-gray-600 font-medium">
                    Target: {formatTime(goal.target_minutes)} per day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(goal)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit goal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
