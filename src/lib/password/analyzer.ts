
import { commonPasswords } from "./commonPasswords";
import { containsCommonPattern } from "../commonPatterns";
import { detectPatterns, calculateAttackResistance, calculateHackabilityScore } from "../mlPatternDetector";
import { enhancePassword } from "../aiPasswordEnhancer";
import { estimateCrackTime, formatCrackTime } from "../crackTimeSimulator";
import { generatePassphraseSuggestions } from "../passphraseGenerator";
import { calculateEntropy } from "./entropyCalculator";
import { calculateScore } from "./scoreCalculator";
import { generateSuggestions } from "./suggestionGenerator";
import { checkForAchievements } from "./achievementChecker";
import { PasswordAnalysis } from "./types";

export const analyzePassword = (password: string): PasswordAnalysis => {
  // Basic analysis
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isCommon = commonPasswords.has(password.toLowerCase());
  
  // Check for common patterns (simple pattern detection)
  const patternCheck = containsCommonPattern(password);
  const hasCommonPattern = patternCheck.found;
  const commonPatterns = patternCheck.patterns;
  
  // Advanced ML-based pattern detection with RockYou dataset simulated model
  const mlPatterns = detectPatterns(password);
  
  // Calculate entropy with improved RockYou-based algorithm
  const entropy = calculateEntropy(password);
  
  // Analysis object with basic info
  const analysisObj = {
    length: password.length,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    isCommon,
    hasCommonPattern,
    commonPatterns,
    mlPatterns,
    entropy
  };
  
  // Calculate overall score with enhanced algorithm
  const score = calculateScore(analysisObj);
  
  // Enhanced crack time simulation
  const crackTimeEstimates = estimateCrackTime(entropy);
  
  // Get the SHA-256 GPU crack time for use in hackability score
  const sha256GPUTimeInSeconds = crackTimeEstimates["SHA-256 (GPU)"].timeInSeconds;
  
  // Simplified time to crack for backwards compatibility
  const timeToCrack = {
    "Brute Force (Offline)": crackTimeEstimates["SHA-256 (GPU)"].timeToBreak,
    "Online Attack": formatCrackTime(Math.pow(2, entropy) / 1000),
    "Dictionary Attack": formatCrackTime(Math.pow(2, entropy / 2) / 1_000_000_000)
  };
  
  // Generate suggestions
  const suggestions = generateSuggestions(password, {...analysisObj, score});
  
  // AI-enhanced password suggestion
  const aiEnhanced = enhancePassword(password, score);
  
  // Calculate attack resistance scores
  const attackResistance = calculateAttackResistance(password, mlPatterns, entropy);
  
  // Calculate AI-driven hackability score
  const hackabilityScore = calculateHackabilityScore(
    password, 
    mlPatterns, 
    entropy, 
    sha256GPUTimeInSeconds
  );
  
  // Generate passphrase suggestions (3 options)
  const passphraseSuggestions = generatePassphraseSuggestions(3);
  
  // Check for achievements that can be unlocked
  const achievements = checkForAchievements(password, {
    length: password.length,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    entropy,
    score,
    isCommon,
    hasCommonPattern,
    mlPatterns,
    crackTimeEstimates
  });
  
  return {
    ...analysisObj,
    score,
    timeToCrack,
    suggestions,
    crackTimeEstimates,
    aiEnhanced,
    attackResistance,
    hackabilityScore,
    passphraseSuggestions,
    achievements
  };
};
