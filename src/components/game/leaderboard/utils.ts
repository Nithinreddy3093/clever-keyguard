
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
  if (change === "up") return "animate-fade-in text-green-500";
  if (change === "down") return "animate-fade-in text-red-500";
  return "";
};

export const getRankAnimation = (change: "up" | "down" | "same"): string => {
  if (change === "up") return "animate-fade-in";
  if (change === "down") return "animate-fade-in";
  return "";
};
