
import { detectPatterns } from "../mlPatternDetector";
import { enhancePassword } from "../aiPasswordEnhancer";
import { generatePassphraseSuggestions } from "../passphraseGenerator";

// Generate suggestions to improve the password
export const generateSuggestions = (password: string, analysis: {
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
