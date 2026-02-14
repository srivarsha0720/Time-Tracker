import { useState, useEffect, useRef } from "react";
import { Play, Pause, Save, CheckCircle2 } from "lucide-react";
import { CATEGORIES } from "@/shared/types";

interface LiveTimerProps {
  selectedDate: string;
  onTimerSaved: () => void;
}

export default function LiveTimer({ selectedDate, onTimerSaved }: LiveTimerProps) {
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      // Stop timer
      setIsRunning(false);
    } else {
      // Start timer - validate inputs first
      setErrorMessage("");
      setSaveSuccess(false);
      
      if (!activityName.trim()) {
        setErrorMessage("Please enter an activity name");
        return;
      }
      if (!category) {
        setErrorMessage("Please select a category");
        return;
      }
      setIsRunning(true);
    }
  };

  const handleSave = async () => {
    if (elapsedSeconds === 0) {
      setErrorMessage("No time to save");
      return;
    }

    if (!activityName.trim() || !category) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);
    const minutes = Math.ceil(elapsedSeconds / 60);

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: activityName,
          category,
          duration: minutes,
          activity_date: selectedDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        setSaveSuccess(true);
        
        // Reset the timer after a brief delay
        setTimeout(() => {
          setActivityName("");
          setCategory("");
          setElapsedSeconds(0);
          setIsRunning(false);
          setSaveSuccess(false);
          onTimerSaved();
        }, 1500);
      } else {
        setErrorMessage(data.error || "Failed to save activity");
      }
    } catch (error) {
      console.error("Failed to save activity:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const minutes = Math.floor(elapsedSeconds / 60);

  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Timer</h2>
        <p className="text-gray-600 font-medium">Start tracking your activity in real-time</p>
      </div>

      {/* Timer Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-6 border border-gray-200">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2 font-mono">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="text-lg text-gray-600 font-medium">
            {minutes} {minutes === 1 ? 'minute' : 'minutes'} elapsed
          </div>
          {isRunning && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-600">RECORDING</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Details */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="timer-activity" className="block text-sm font-bold text-gray-900 mb-2">
            Activity Name
          </label>
          <input
            id="timer-activity"
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            disabled={isRunning}
            placeholder="What are you working on?"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 font-medium"
          />
        </div>

        <div>
          <label htmlFor="timer-category" className="block text-sm font-bold text-gray-900 mb-2">
            Category
          </label>
          <select
            id="timer-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isRunning}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 font-medium"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleStartStop}
          disabled={isSaving}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Timer
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Timer
            </>
          )}
        </button>

        {!isRunning && elapsedSeconds > 0 && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Activity'}
          </button>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Activity saved successfully!
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg shadow-lg font-bold">
          {errorMessage}
        </div>
      )}

      {elapsedSeconds > 0 && !isRunning && !saveSuccess && (
        <p className="mt-4 text-center text-sm text-gray-600 font-medium">
          Timer stopped. Click "Save Activity" to record this time, or "Start Timer" to continue.
        </p>
      )}
    </div>
  );
}
