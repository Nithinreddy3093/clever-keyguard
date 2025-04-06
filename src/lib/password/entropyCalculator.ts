
import { detectPatterns } from "../mlPatternDetector";

// Helper function to calculate entropy with improved charset detection
export const calculateEntropy = (password: string): number => {
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
