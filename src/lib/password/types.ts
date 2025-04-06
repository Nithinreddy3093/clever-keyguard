
import { AttackResistance, HackabilityScore } from "../mlPatternDetector";

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
  attackResistance: AttackResistance;
  hackabilityScore: HackabilityScore;
  passphraseSuggestions: string[];
  breachData?: {
    found: boolean;
    breachCount?: number;
    sources?: string[];
    lastBreached?: string;
  };
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    rarity: "common" | "uncommon" | "rare" | "legendary";
    icon: string;
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  icon: string;
}
