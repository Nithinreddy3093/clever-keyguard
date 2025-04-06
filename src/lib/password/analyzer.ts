
import { detectPatterns, calculateAttackResistance, calculateHackabilityScore } from "../mlPatternDetector";
import { calculateEntropy } from "./entropyCalculator";
import { calculateScore } from "./scoreCalculator";
import { generateSuggestions } from "./suggestionGenerator";
import { checkForAchievements } from "./achievementChecker";
import { commonPasswords } from "./commonPasswords";
import { PasswordAnalysis } from "./types";
import { estimateCrackTime, formatCrackTime } from "../crackTimeSimulator";

/**
 * Analyzes a password and returns detailed security metrics
 * @param password The password to analyze
 * @returns Comprehensive password analysis object
 */
export const analyzePassword = (password: string): PasswordAnalysis => {
  if (!password) {
    throw new Error("Password cannot be empty");
  }
  
  // Basic password characteristics
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUnicode = /[^\u0000-\u007F]/.test(password);
  const isCommon = commonPasswords.has(password.toLowerCase());
  
  // Enhanced pattern detection using ML-based analyzer
  const detectedPatterns = detectPatterns(password);
  const hasCommonPattern = detectedPatterns.length > 0;
  
  // Calculate entropy and strength score
  const entropy = calculateEntropy(password);
  const score = calculateScore(password, entropy, hasCommonPattern, isCommon);
  
  // Calculate estimated time to crack
  const crackTimeEstimates = estimateCrackTime(entropy);
  const offlineFastHashCrackTime = crackTimeEstimates["SHA-256 (GPU)"].timeInSeconds;
  const onlineCrackTime = crackTimeEstimates["bcrypt (CPU)"].timeInSeconds;
  
  // Calculate attack resistance
  const attackResistance = calculateAttackResistance(password);
  
  // Calculate hackability score using only the correct parameters
  const hackabilityScore = calculateHackabilityScore(password);
  
  // Generate improvement suggestions
  const suggestions = generateSuggestions(password, score);
  
  // Prepare analysis data for achievements check
  const analysisData = {
    length,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    entropy,
    score,
    isCommon,
    hasCommonPattern,
    mlPatterns: detectedPatterns,
    crackTimeEstimates
  };
  
  // Check for unlocked achievements
  const achievements = checkForAchievements(password, analysisData);
  
  // Format crack time for display
  const timeToCrack = {
    "Brute Force (Offline)": formatCrackTime(offlineFastHashCrackTime),
    "Online Attack (Throttled)": formatCrackTime(onlineCrackTime)
  };
  
  // Return comprehensive analysis
  return {
    length,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    hasUnicode,
    hasCommonPattern,
    isCommon,
    patterns: detectedPatterns,
    commonPatterns: detectedPatterns.map(p => p.type),
    mlPatterns: detectedPatterns,
    entropy,
    score,
    timeToCrack,
    crackTimeEstimates,
    attackResistance,
    hackabilityScore,
    suggestions,
    achievements,
    passphraseSuggestions: [],
    breachData: {
      found: false
    }
  };
};
