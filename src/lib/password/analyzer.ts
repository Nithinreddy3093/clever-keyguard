
import { detectPatterns, calculateAttackResistance, calculateHackabilityScore } from "../mlPatternDetector";
import { calculateEntropy } from "./entropyCalculator";
import { calculateScore } from "./scoreCalculator";
import { generateSuggestions } from "./suggestionGenerator";
import { checkPasswordAchievements } from "./achievementChecker";
import { commonPasswords } from "./commonPasswords";
import { PasswordAnalysis } from "./types";
import { crackTimesInSeconds, formatCrackTime } from "../crackTimeSimulator";

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
  const offlineFastHashCrackTime = crackTimesInSeconds.fastOfflineHash(length, 
    [hasLower, hasUpper, hasDigit, hasSpecial, hasUnicode].filter(Boolean).length);
  const onlineCrackTime = crackTimesInSeconds.onlineThrottled(length, 
    [hasLower, hasUpper, hasDigit, hasSpecial, hasUnicode].filter(Boolean).length);
  
  // Calculate attack resistance
  const attackResistance = calculateAttackResistance(password, detectedPatterns, entropy);
  
  // Calculate hackability score
  const hackabilityScore = calculateHackabilityScore(password, detectedPatterns, entropy, offlineFastHashCrackTime);
  
  // Generate improvement suggestions
  const suggestions = generateSuggestions(
    password, 
    score, 
    detectedPatterns, 
    isCommon, 
    hasUpper, 
    hasLower, 
    hasDigit, 
    hasSpecial,
    length
  );
  
  // Check for unlocked achievements
  const achievements = checkPasswordAchievements(password, score, entropy, length, hackabilityScore);
  
  // Format crack time for display
  const timeToCrack = {
    "Brute Force (Offline)": formatCrackTime(offlineFastHashCrackTime),
    "Online Attack (Throttled)": formatCrackTime(onlineCrackTime)
  };
  
  // Return comprehensive analysis
  return {
    password,
    score,
    entropy,
    length,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    hasUnicode,
    hasCommonPattern,
    isCommon,
    patterns: detectedPatterns,
    timeToCrack,
    attackResistance,
    hackabilityScore,
    suggestions,
    achievements
  };
};
