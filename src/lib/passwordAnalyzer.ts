
import { PasswordAnalysis } from "@/types/password";
import { containsCommonPattern } from "./commonPatterns";

// Common passwords list (simplified)
const commonPasswords = new Set([
  "password", "123456", "qwerty", "admin", "welcome", "123456789", "12345678",
  "abc123", "football", "monkey", "letmein", "111111", "mustang", "access",
  "shadow", "master", "michael", "superman", "696969", "123123", "batman",
  "trustno1", "baseball", "dragon", "password1", "hunter2", "iloveyou", 
  "sunshine", "princess"
]);

// Helper function to calculate entropy
const calculateEntropy = (password: string): number => {
  let charSet = 0;
  if (/[a-z]/.test(password)) charSet += 26;
  if (/[A-Z]/.test(password)) charSet += 26;
  if (/[0-9]/.test(password)) charSet += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charSet += 33;
  
  return password.length * Math.log2(charSet || 1);
};

// Estimate time to crack based on entropy
const estimateCrackTime = (entropy: number): Record<string, string> => {
  // Assuming different cracking rates for different attack types
  // Values are in guesses per second
  const rateOfflineFastHash = 10_000_000_000; // 10 billion/sec
  const rateOnline = 1_000; // 1,000/sec
  const rateDictionary = 1_000_000_000; // 1 billion/sec
  
  // Calculate times in seconds
  const offlineSeconds = Math.pow(2, entropy) / rateOfflineFastHash;
  const onlineSeconds = Math.pow(2, entropy) / rateOnline;
  const dictionarySeconds = rateDictionary > 0 ? Math.pow(2, entropy / 2) / rateDictionary : Infinity;
  
  return {
    "Brute Force (Offline)": formatTime(offlineSeconds),
    "Online Attack": formatTime(onlineSeconds),
    "Dictionary Attack": formatTime(dictionarySeconds)
  };
};

// Format time in human-readable format
const formatTime = (seconds: number): string => {
  if (seconds < 1) return "Instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  
  const centuries = seconds / 31536000 / 100;
  if (centuries < 1000) return `${Math.round(centuries)} centuries`;
  if (centuries < 1000000) return `${Math.round(centuries / 1000)}k centuries`;
  if (centuries < 1000000000) return `${Math.round(centuries / 1000000)}M centuries`;
  
  return "Heat death of universe";
};

// Generate suggestions to improve the password
const generateSuggestions = (password: string, analysis: {
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
  hasCommonPattern: boolean;
  commonPatterns: string[];
  score: number; // Added score property to match usage
}): string[] => {
  const suggestions: string[] = [];
  
  // Common substitute characters
  const substitutions: Record<string, string> = {
    'a': '@', 'e': '3', 'i': '!', 'o': '0', 'l': '1', 's': '$'
  };
  
  if (analysis.length < 12) {
    suggestions.push("Increase password length to at least 12 characters.");
  }
  
  if (!analysis.hasUpper) {
    suggestions.push("Add uppercase letters (A-Z).");
  }
  
  if (!analysis.hasLower) {
    suggestions.push("Add lowercase letters (a-z).");
  }
  
  if (!analysis.hasDigit) {
    suggestions.push("Add numeric digits (0-9).");
  }
  
  if (!analysis.hasSpecial) {
    suggestions.push("Add special characters (!, @, #, $, %, etc).");
  }
  
  if (analysis.isCommon) {
    suggestions.push("Your password is too common. Choose something more unique.");
  }
  
  // If we detected common patterns
  if (analysis.hasCommonPattern) {
    const patternList = analysis.commonPatterns.join(", ");
    suggestions.push(`Avoid common patterns (${patternList}).`);
  }
  
  // Simple character substitution suggestion
  if (analysis.score < 3) {
    const enhancedPwd = password.split('').map(char => 
      substitutions[char.toLowerCase()] || char
    ).join('');
    
    if (enhancedPwd !== password) {
      suggestions.push(`Try character substitutions like: ${enhancedPwd}`);
    }
  }
  
  // Suggest passphrases
  if (analysis.score < 4 && !suggestions.includes("Try using a passphrase instead.")) {
    suggestions.push("Try using a passphrase instead. Combine 3-4 random words with numbers and symbols.");
  }
  
  return suggestions;
};

// Calculate overall password score (0-4)
const calculateScore = (analysis: {
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
  hasCommonPattern: boolean;
  entropy: number;
}): number => {
  if (analysis.isCommon) return 0;
  if (analysis.length < 6) return 0;
  
  let score = 0;
  
  // Length points
  if (analysis.length >= 8) score += 1;
  if (analysis.length >= 12) score += 1;
  
  // Character variety points
  let varietyScore = 0;
  if (analysis.hasUpper) varietyScore += 1;
  if (analysis.hasLower) varietyScore += 1;
  if (analysis.hasDigit) varietyScore += 1;
  if (analysis.hasSpecial) varietyScore += 1;
  
  score += Math.min(2, varietyScore / 2);
  
  // Entropy score
  if (analysis.entropy > 60) score += 1;
  
  // Reduce score if common patterns found
  if (analysis.hasCommonPattern) score = Math.max(0, score - 1);
  
  // Cap at 4
  return Math.min(4, Math.round(score));
};

export const analyzePassword = (password: string): PasswordAnalysis => {
  // Basic analysis
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isCommon = commonPasswords.has(password.toLowerCase());
  
  // Check for common patterns
  const patternCheck = containsCommonPattern(password);
  const hasCommonPattern = patternCheck.found;
  const commonPatterns = patternCheck.patterns;
  
  // Calculate entropy
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
    entropy
  };
  
  // Calculate overall score
  const score = calculateScore(analysisObj);
  
  // Time to crack
  const timeToCrack = estimateCrackTime(entropy);
  
  // Generate suggestions
  const suggestions = generateSuggestions(password, {...analysisObj, score});
  
  return {
    ...analysisObj,
    score,
    timeToCrack,
    suggestions
  };
};
