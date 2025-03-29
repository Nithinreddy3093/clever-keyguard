
import { PasswordAnalysis } from "@/types/password";
import { containsCommonPattern } from "./commonPatterns";
import { detectPatterns } from "./mlPatternDetector";
import { enhancePassword } from "./aiPasswordEnhancer";
import { estimateCrackTime, formatCrackTime } from "./crackTimeSimulator";

// Common passwords list (expanded from RockYou top 100)
const commonPasswords = new Set([
  "password", "123456", "qwerty", "admin", "welcome", "123456789", "12345678",
  "abc123", "football", "monkey", "letmein", "111111", "mustang", "access",
  "shadow", "master", "michael", "superman", "696969", "123123", "batman",
  "trustno1", "baseball", "dragon", "password1", "hunter2", "iloveyou", 
  "sunshine", "princess", "qwertyuiop", "nicole", "daniel", "babygirl", 
  "monkey1", "lovely", "jessica", "654321", "michael1", "ashley", "qwerty1",
  "111222", "iloveu", "000000", "michelle", "tigger", "sunshine1", "chocolate",
  "anthony", "soccer", "friends", "butterfly", "purple", "angel1", "jordan",
  "liverpool", "justin", "loveme", "fuckyou", "123321", "football1", "secret",
  "andrea", "carlos", "jennifer", "joshua", "bubbles", "1234567890", "superman1",
  "hannah", "amanda", "loveyou", "pretty", "basketball", "andrew", "angels",
  "tweety", "flower", "playboy", "hello", "elizabeth", "hottie", "tinkerbell",
  "charlie", "samantha", "barbie", "chelsea", "lovers", "teamo", "jasmine",
  "brandon", "666666", "shadow1", "melissa", "eminem", "matthew", "robert"
]);

// Helper function to calculate entropy with improved charset detection
const calculateEntropy = (password: string): number => {
  let charSet = 0;
  if (/[a-z]/.test(password)) charSet += 26;
  if (/[A-Z]/.test(password)) charSet += 26;
  if (/[0-9]/.test(password)) charSet += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charSet += 33;
  
  // Apply pattern penalty based on ML detection
  const mlPatterns = detectPatterns(password);
  let patternPenalty = 0;
  
  if (mlPatterns.length > 0) {
    // Get the highest confidence pattern
    const highestConfidence = Math.max(...mlPatterns.map(p => p.confidence));
    
    // Apply penalty based on confidence (up to 40% reduction)
    patternPenalty = highestConfidence * 0.4;
  }
  
  const baseEntropy = password.length * Math.log2(charSet || 1);
  
  // Apply the pattern penalty to the entropy calculation
  return baseEntropy * (1 - patternPenalty);
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
  mlPatterns: ReturnType<typeof detectPatterns>;
  score: number;
}): string[] => {
  const suggestions: string[] = [];
  
  // Add basic suggestions based on missing criteria
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
  
  // Add ML-based pattern suggestions
  if (analysis.mlPatterns.length > 0) {
    // Get the top 3 most confident patterns
    const topPatterns = [...analysis.mlPatterns]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    topPatterns.forEach(pattern => {
      switch (pattern.type) {
        case 'keyboard':
          suggestions.push("Avoid keyboard patterns like 'qwerty' or 'asdfgh' that are easily guessed.");
          break;
        case 'sequential':
          suggestions.push("Sequential numbers like '12345' are among the first patterns attackers try.");
          break;
        case 'common_word':
          suggestions.push("Common dictionary words are vulnerable to dictionary attacks.");
          break;
        case 'word_number':
          suggestions.push("The pattern 'word + numbers' (e.g., 'password123') is very common in leaked passwords.");
          break;
        case 'name_year':
          suggestions.push("Using a name followed by a year (e.g., 'john2023') is found in over 8% of leaked passwords.");
          break;
        case 'date':
          suggestions.push("Date formats like birthdays are easily guessable with targeted attacks.");
          break;
        case 'repetitive_character':
          suggestions.push("Repeating characters (e.g., 'aaa' or '111') significantly decrease password strength.");
          break;
        case 'sports_team':
          suggestions.push("Sports team names are commonly found in leaked password databases.");
          break;
        case 'movie_character':
          suggestions.push("Popular character names from movies/TV are frequently used in passwords.");
          break;
        case 'popular_phrase':
          suggestions.push("Common phrases like 'iloveyou' appear in millions of leaked passwords.");
          break;
        case 'leet_speak':
          suggestions.push("Simple character substitutions (a→4, e→3) are well-known to attackers.");
          break;
      }
    });
  }
  
  // Add AI-enhanced password suggestion if score is low
  if (analysis.score < 3) {
    const enhancedResult = enhancePassword(password, analysis.score);
    if (enhancedResult.originalPassword !== enhancedResult.enhancedPassword) {
      suggestions.push(`Try this AI-enhanced alternative: "${enhancedResult.enhancedPassword}"`);
    }
  }
  
  // Suggest passphrases
  if (analysis.score < 4 && !suggestions.includes("Try using a passphrase instead.")) {
    suggestions.push("Try using a passphrase instead. Combine 3-4 random words with numbers and symbols.");
  }
  
  return suggestions;
};

// Calculate overall password score (0-4) with improved ML integration
const calculateScore = (analysis: {
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
  hasCommonPattern: boolean;
  mlPatterns: ReturnType<typeof detectPatterns>;
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
  
  // Enhanced ML-based pattern reduction
  if (analysis.mlPatterns.length > 0) {
    // Calculate confidence-weighted penalty
    let totalConfidence = 0;
    let highConfidencePatterns = 0;
    
    analysis.mlPatterns.forEach(pattern => {
      totalConfidence += pattern.confidence;
      if (pattern.confidence > 0.85) {
        highConfidencePatterns += 1;
      }
    });
    
    // Average confidence above 0.9 or multiple high confidence patterns
    if ((totalConfidence / analysis.mlPatterns.length) > 0.9 || highConfidencePatterns >= 2) {
      score = Math.max(0, score - 1);
    }
    
    // Very high confidence pattern found (> 0.95)
    if (analysis.mlPatterns.some(p => p.confidence > 0.95)) {
      score = Math.max(0, score - 1);
    }
  }
  
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
  
  return {
    ...analysisObj,
    score,
    timeToCrack,
    suggestions,
    crackTimeEstimates,
    aiEnhanced
  };
};
