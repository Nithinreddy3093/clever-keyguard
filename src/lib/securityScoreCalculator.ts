
// Utility functions for security score calculation

export interface ScoreBreakdown {
  passwordStrength: number;
  questProgress: number;
  streakBonus: number;
}

export interface SecurityLevel {
  level: string;
  color: string;
}

// Calculate security score based on various inputs
export const calculateSecurityScore = (
  passwordScore: number,
  questsCompleted: number,
  totalQuests: number,
  passwordStreak: number,
  hasCommonPattern: boolean,
  isCommon: boolean
): { securityScore: number; scoreBreakdown: ScoreBreakdown } => {
  // Password strength makes up 50% of security score
  const strengthScore = (passwordScore / 4) * 50;
  
  // Quest completion makes up 30% of security score
  const questScore = (questsCompleted / totalQuests) * 30;
  
  // Streak bonus makes up 20% of security score (max 7 days)
  const streakScore = Math.min(passwordStreak, 7) / 7 * 20;
  
  // Deduct for common passwords or patterns
  const patternPenalty = hasCommonPattern ? 10 : 0;
  const commonPenalty = isCommon ? 30 : 0;
  
  // Combine scores with penalties
  const totalScore = Math.max(0, Math.min(100, 
    strengthScore + questScore + streakScore - patternPenalty - commonPenalty
  ));
  
  return {
    securityScore: Math.round(totalScore),
    scoreBreakdown: {
      passwordStrength: strengthScore,
      questProgress: questScore,
      streakBonus: streakScore
    }
  };
};

// Get security level based on score
export const getSecurityLevel = (score: number): SecurityLevel => {
  if (score >= 90) return { level: "Fortress", color: "text-emerald-500" };
  if (score >= 75) return { level: "Secured", color: "text-green-500" };
  if (score >= 60) return { level: "Protected", color: "text-blue-500" };
  if (score >= 40) return { level: "Moderate", color: "text-amber-500" };
  if (score >= 20) return { level: "Vulnerable", color: "text-orange-500" };
  return { level: "Critical", color: "text-red-500" };
};

// Get color for security score
export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-emerald-500";
  if (score >= 75) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
};

// Get color for progress bar
export const getProgressColor = (score: number): string => {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
};
