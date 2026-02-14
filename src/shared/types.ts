export interface Activity {
  id: number;
  user_id: string;
  activity_date: string;
  name: string;
  category: "Work" | "Study" | "Sleep" | "Entertainment" | "Exercise" | "Other";
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  user_id: string;
  category: "Work" | "Study" | "Sleep" | "Entertainment" | "Exercise" | "Other";
  target_minutes: number;
  created_at: string;
  updated_at: string;
}

export const CATEGORIES = [
  "Work",
  "Study",
  "Sleep",
  "Entertainment",
  "Exercise",
  "Other",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Work: "#3b82f6",
  Study: "#8b5cf6",
  Sleep: "#06b6d4",
  Entertainment: "#f59e0b",
  Exercise: "#10b981",
  Other: "#6b7280",
};
