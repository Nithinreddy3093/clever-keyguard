
import { detectPatterns } from "../mlPatternDetector";
import { Achievement } from "./types";

// Check for achievements that can be unlocked
export const checkForAchievements = (password: string, analysis: {
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  entropy: number;
  score: number;
  isCommon: boolean;
  hasCommonPattern: boolean;
  mlPatterns: ReturnType<typeof detectPatterns>;
  crackTimeEstimates?: Record<string, { timeInSeconds: number }>;
}): Achievement[] => {
  const achievements = [];
  
  // Cryptographer - High entropy achievement
  if (analysis.entropy >= 100) {
    achievements.push({
      id: "cryptographer",
      title: "The Cryptographer",
      description: "Created a password with 100+ bits of entropy",
      rarity: "rare",
      icon: "🔐"
    });
  }
  
  // Hacker's Nightmare - Super strong password
  if (analysis.crackTimeEstimates && analysis.crackTimeEstimates["SHA-256 (GPU)"].timeInSeconds > 1000 * 365 * 24 * 60 * 60) {
    achievements.push({
      id: "hackersNightmare",
      title: "Hacker's Nightmare",
      description: "Generated a password unbreakable for 1,000+ years",
      rarity: "legendary",
      icon: "🛡️"
    });
  }
  
  // Diversity Champion - Uses all character types
  if (analysis.hasUpper && analysis.hasLower && analysis.hasDigit && analysis.hasSpecial) {
    achievements.push({
      id: "diversityChamp",
      title: "Diversity Champion",
      description: "Used all four character types in one password",
      rarity: "uncommon",
      icon: "🔡"
    });
  }
  
  // Marathon Runner - Super long password
  if (analysis.length >= 20) {
    achievements.push({
      id: "marathonRunner",
      title: "Marathon Runner",
      description: "Created a password with 20+ characters",
      rarity: "uncommon",
      icon: "📏"
    });
  }
  
  // Perfect Score - Maximum security score
  if (analysis.score === 4) {
    achievements.push({
      id: "perfectScore",
      title: "Perfect Score",
      description: "Achieved the maximum password security score",
      rarity: "rare",
      icon: "⭐"
    });
  }
  
  return achievements;
};
