
export interface PasswordAnalysis {
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
  hasCommonPattern: boolean;
  commonPatterns: string[];
  mlPatterns: Array<{
    type: string;
    description: string;
    confidence: number;
    position: [number, number];
  }>;
  entropy: number;
  score: number;
  timeToCrack: Record<string, string>;
  crackTimeEstimates: Record<string, {
    algorithm: 'bcrypt' | 'sha256' | 'md5';
    hashesPerSecond: number;
    timeToBreak: string;
    timeInSeconds: number;
  }>;
  suggestions: string[];
  aiEnhanced: {
    originalPassword: string;
    enhancedPassword: string;
    improvements: string[];
    strengthIncrease: number;
  };
  // Phase 1 enhancements
  attackResistance: {
    bruteForce: number;
    dictionary: number;
    patternBased: number;
    aiAttack: number;
    overall: number;
  };
  hackabilityScore: {
    score: number;
    reasoning: string[];
    timeToHack: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  passphraseSuggestions: string[];
  // Phase 2 enhancements (planned)
  breachData?: {
    found: boolean;
    breachCount?: number;
    sources?: string[];
    lastBreached?: string;
  };
}
