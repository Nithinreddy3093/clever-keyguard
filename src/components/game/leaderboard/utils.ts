
export const getTierColor = (tier: string): string => {
  const colors: Record<string, string> = {
    "S": "bg-purple-600 hover:bg-purple-700 border-purple-400/50",
    "A": "bg-indigo-600 hover:bg-indigo-700 border-indigo-400/50",
    "B": "bg-blue-600 hover:bg-blue-700 border-blue-400/50",
    "C": "bg-green-600 hover:bg-green-700 border-green-400/50",
    "D": "bg-yellow-600 hover:bg-yellow-700 border-yellow-400/50",
    "E": "bg-red-600 hover:bg-red-700 border-red-400/50"
  };
  return colors[tier] || "bg-slate-600 hover:bg-slate-700 border-slate-400/50";
};

export const getTierName = (tier: string): string => {
  const names: Record<string, string> = {
    "S": "Shadow Sovereign",
    "A": "Nightmare King/Queen",
    "B": "Abyssal Phantom",
    "C": "Eclipsed Knight",
    "D": "Void Walker", 
    "E": "Shadow Novice"
  };
  return names[tier] || "Unknown";
};

export const getTierForScore = (score: number): string => {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
};

export const getGlowColor = (tier: string): string => {
  const colors: Record<string, string> = {
    "S": "shadow-purple-500/30",
    "A": "shadow-indigo-500/30",
    "B": "shadow-blue-500/30",
    "C": "shadow-green-500/30",
    "D": "shadow-yellow-500/30",
    "E": "shadow-red-500/30"
  };
  return colors[tier] || "shadow-slate-500/30";
};

export const getScoreChangeClass = (change: "up" | "down" | "same"): string => {
  if (change === "up") return "text-green-600 dark:text-green-400 font-medium animate-pulse transition-colors duration-300";
  if (change === "down") return "text-red-600 dark:text-red-400 font-medium animate-pulse transition-colors duration-300";
  return "";
};

export const getRankAnimation = (change: "up" | "down" | "same"): string => {
  if (change === "up") return "animate-fade-in bg-green-50/30 dark:bg-green-900/10 border-l-2 border-green-500";
  if (change === "down") return "animate-fade-in bg-red-50/30 dark:bg-red-900/10 border-l-2 border-red-500";
  return "";
};

// New utility functions for improved leaderboard
export const getProfileColor = (tier: string): string => {
  const colors: Record<string, string> = {
    "S": "from-purple-500/20 to-purple-700/10",
    "A": "from-indigo-500/20 to-indigo-700/10",
    "B": "from-blue-500/20 to-blue-700/10",
    "C": "from-green-500/20 to-green-700/10",
    "D": "from-yellow-500/20 to-yellow-700/10",
    "E": "from-red-500/20 to-red-700/10"
  };
  return colors[tier] || "from-slate-500/20 to-slate-700/10";
};

export const getTierBorderColor = (tier: string): string => {
  const colors: Record<string, string> = {
    "S": "border-purple-300 dark:border-purple-700",
    "A": "border-indigo-300 dark:border-indigo-700",
    "B": "border-blue-300 dark:border-blue-700",
    "C": "border-green-300 dark:border-green-700",
    "D": "border-yellow-300 dark:border-yellow-700",
    "E": "border-red-300 dark:border-red-700"
  };
  return colors[tier] || "border-slate-300 dark:border-slate-700";
};

export const getTierTextColor = (tier: string): string => {
  const colors: Record<string, string> = {
    "S": "text-purple-700 dark:text-purple-300",
    "A": "text-indigo-700 dark:text-indigo-300",
    "B": "text-blue-700 dark:text-blue-300",
    "C": "text-green-700 dark:text-green-300",
    "D": "text-yellow-700 dark:text-yellow-300",
    "E": "text-red-700 dark:text-red-300"
  };
  return colors[tier] || "text-slate-700 dark:text-slate-300";
};
