
import { detectPatterns } from "../mlPatternDetector";

// Calculate overall password score (0-4) with improved ML integration
export const calculateScore = (analysis: {
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
