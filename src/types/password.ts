
export interface PasswordAnalysis {
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
  hasCommonPattern: boolean;
  commonPatterns: string[];
  entropy: number;
  score: number;
  timeToCrack: Record<string, string>;
  suggestions: string[];
}
