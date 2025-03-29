// Machine Learning-based pattern detector simulating training on the RockYou dataset
// This provides sophisticated pattern recognition based on leaked password analysis

type PatternType = 'sequential' | 'keyboard' | 'repeating' | 'date' | 'common_word' | 'word_number' | 
  'capitalized_word' | 'leet_speak' | 'word_special' | 'repetitive_character' | 'name_year' | 'character_substitution' |
  'popular_phrase' | 'personal_info' | 'sports_team' | 'movie_character' | 'celebrity';

interface DetectedPattern {
  type: PatternType;
  description: string;
  confidence: number; // 0-1 scale of confidence in detection
  position: [number, number]; // Start and end position in the password
}

export interface AttackResistance {
  bruteForce: number;   // 0-100 resistance score
  dictionary: number;   // 0-100 resistance score 
  patternBased: number; // 0-100 resistance score
  aiAttack: number;     // 0-100 resistance score
  overall: number;      // 0-100 weighted average
}

export interface HackabilityScore {
  score: number;        // 0-100 scale, higher means more hackable
  reasoning: string[];  // Reasons why this password is hackable
  timeToHack: string;   // Human readable format
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Expanded common patterns from RockYou leak analysis (top 100)
const commonWordPatterns = [
  'password', 'welcome', 'qwerty', 'monkey', 'dragon', 'baseball', 'football',
  'letmein', 'master', 'michael', 'superman', 'princess', 'sunshine', 'iloveyou',
  'trustno1', 'batman', 'angel', 'summer', 'winter', 'autumn', 'spring',
  'diamond', 'shadow', 'tigger', 'charlie', 'robert', 'thomas', 'hockey',
  'ranger', 'daniel', 'starwars', 'klaster', 'george', 'computer', 'michelle',
  'jessica', 'pepper', 'buster', 'soccer', 'london', 'tennis', 'montreal',
  'fishing', 'maggie', 'forever', 'steelers', 'jordan', 'angelo', 'awesome'
];

// Popular phrases from RockYou
const popularPhrases = [
  'iloveyou', 'letmein', 'whatever', 'trustno1', 'tinkle', 'blessed',
  'lovely', 'hottie', 'teamo', 'babygirl', 'tinkerbell', 'sweety',
  'warrior', 'freedom', 'poohbear', 'mylove', 'fuckyou', 'nothing'
];

// Common keyboard patterns
const keyboardPatterns = [
  'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', '123qwe', 'qwe123',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'wasd', '1qaz2wsx',
  '1q2w3e', '1q2w3e4r', 'zxcvbnm', 'mnbvcxz', 'poiuyt'
];

// Common names (expanded from RockYou analysis)
const commonNames = [
  'michael', 'john', 'david', 'james', 'robert', 'joseph', 'thomas',
  'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'susan', 'jessica',
  'christopher', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven',
  'andrew', 'richard', 'charles', 'kevin', 'jason', 'jeffrey', 'ryan',
  'ashley', 'amanda', 'stephanie', 'melissa', 'nicole', 'kimberly', 'emily',
  'michelle', 'sarah', 'brittany', 'heather', 'samantha', 'rachel'
];

// Popular sports teams (from RockYou analysis)
const sportsTeams = [
  'arsenal', 'chelsea', 'yankees', 'lakers', 'cowboys', 'steelers',
  'liverpool', 'barcelona', 'realmadrid', 'manchester', 'united',
  'celtic', 'rangers', 'juventus', 'milan', 'inter', 'chicago', 'dallas',
  'patriots', 'liverpool', 'raiders', 'packers', 'eagles', 'giants'
];

// Popular movie/TV characters
const movieCharacters = [
  'batman', 'superman', 'spiderman', 'ironman', 'wolverine', 'potter',
  'gandalf', 'frodo', 'skywalker', 'vader', 'naruto', 'spongebob',
  'simpsons', 'homer', 'pokemon', 'pikachu', 'mickey', 'donald', 'goofy'
];

// RockYou frequency data (simulated based on real analysis)
const rockyouFrequencyTop = {
  "123456": 290729,
  "12345": 79076,
  "123456789": 59462,
  "password": 59184,
  "iloveyou": 49952,
  "princess": 33291,
  "1234567": 21725,
  "rockyou": 20901,
  "12345678": 20553,
  "abc123": 17542
};

// Advanced pattern detection techniques simulating a Random Forest classifier
export const detectPatterns = (password: string): DetectedPattern[] => {
  const patterns: DetectedPattern[] = [];
  const lowerPassword = password.toLowerCase();
  
  // Check for sequential numbers (e.g., "123456")
  const sequentialNumberMatch = password.match(/(?:\d{3,})/g);
  if (sequentialNumberMatch) {
    let isSequential = false;
    for (const seq of sequentialNumberMatch) {
      if (isSequentialNumber(seq)) {
        isSequential = true;
        patterns.push({
          type: 'sequential',
          description: 'Sequential numbers',
          confidence: 0.95,
          position: [password.indexOf(seq), password.indexOf(seq) + seq.length - 1]
        });
      }
    }
  }
  
  // Check for keyboard patterns
  for (const pattern of keyboardPatterns) {
    if (lowerPassword.includes(pattern)) {
      patterns.push({
        type: 'keyboard',
        description: 'Keyboard pattern',
        confidence: 0.94,
        position: [lowerPassword.indexOf(pattern), lowerPassword.indexOf(pattern) + pattern.length - 1]
      });
    }
  }
  
  // Check for common words
  for (const word of commonWordPatterns) {
    if (lowerPassword.includes(word)) {
      patterns.push({
        type: 'common_word',
        description: 'Common dictionary word',
        confidence: 0.93,
        position: [lowerPassword.indexOf(word), lowerPassword.indexOf(word) + word.length - 1]
      });
    }
  }
  
  // Check for popular phrases
  for (const phrase of popularPhrases) {
    if (lowerPassword.includes(phrase)) {
      patterns.push({
        type: 'popular_phrase',
        description: 'Popular phrase from leaks',
        confidence: 0.92,
        position: [lowerPassword.indexOf(phrase), lowerPassword.indexOf(phrase) + phrase.length - 1]
      });
    }
  }
  
  // Check for name + year pattern (e.g., "john2024")
  for (const name of commonNames) {
    const nameYearMatch = lowerPassword.match(new RegExp(`${name}(19|20)\\d{2}`, 'i'));
    if (nameYearMatch) {
      patterns.push({
        type: 'name_year',
        description: 'Name followed by year',
        confidence: 0.96,
        position: [lowerPassword.indexOf(nameYearMatch[0]), lowerPassword.indexOf(nameYearMatch[0]) + nameYearMatch[0].length - 1]
      });
    }
  }
  
  // Check for sports teams references
  for (const team of sportsTeams) {
    if (lowerPassword.includes(team)) {
      patterns.push({
        type: 'sports_team',
        description: 'Sports team name',
        confidence: 0.91,
        position: [lowerPassword.indexOf(team), lowerPassword.indexOf(team) + team.length - 1]
      });
    }
  }
  
  // Check for movie characters
  for (const character of movieCharacters) {
    if (lowerPassword.includes(character)) {
      patterns.push({
        type: 'movie_character',
        description: 'Movie/TV character',
        confidence: 0.90,
        position: [lowerPassword.indexOf(character), lowerPassword.indexOf(character) + character.length - 1]
      });
    }
  }
  
  // Check for word + number pattern
  const wordNumberMatch = password.match(/([a-zA-Z]{3,})(\d+)/);
  if (wordNumberMatch) {
    patterns.push({
      type: 'word_number',
      description: 'Word followed by numbers',
      confidence: 0.89,
      position: [password.indexOf(wordNumberMatch[0]), password.indexOf(wordNumberMatch[0]) + wordNumberMatch[0].length - 1]
    });
  }
  
  // Check for repeating characters
  const repeatingMatch = password.match(/(.)\1{2,}/);
  if (repeatingMatch) {
    patterns.push({
      type: 'repetitive_character',
      description: 'Repeating characters',
      confidence: 0.88,
      position: [password.indexOf(repeatingMatch[0]), password.indexOf(repeatingMatch[0]) + repeatingMatch[0].length - 1]
    });
  }
  
  // Check for leet speak substitutions (a->4, e->3, i->1, etc.)
  if (/[a4][e3][i1!][o0]|[p9][a@][s$][s5]/.test(lowerPassword)) {
    patterns.push({
      type: 'leet_speak',
      description: 'Leet speak substitutions',
      confidence: 0.85,
      position: [0, password.length - 1]
    });
  }
  
  // Date patterns (MMDDYYYY, MM-DD-YYYY, etc.)
  const datePattern = /(0[1-9]|1[0-2])[\/\-](0[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}/;
  const dateMatch = password.match(datePattern);
  if (dateMatch) {
    patterns.push({
      type: 'date',
      description: 'Date format',
      confidence: 0.93,
      position: [password.indexOf(dateMatch[0]), password.indexOf(dateMatch[0]) + dateMatch[0].length - 1]
    });
  }
  
  // Add frequency analysis to simulate ML model prediction
  const lengthFactor = password.length < 8 ? 0.9 : (password.length < 12 ? 0.7 : 0.3);
  const charsetFactor = calculateCharsetFactor(password);
  
  // Apply weighting to simulate Random Forest confidence levels
  return patterns.map(pattern => {
    // Apply frequency-based adjustment based on RockYou statistics
    const adjustedConfidence = pattern.confidence * (1 + (lengthFactor * 0.2)) * (1 - (charsetFactor * 0.1));
    return {
      ...pattern,
      confidence: Math.min(0.99, adjustedConfidence)  // Cap at 0.99
    };
  });
};

// Calculate attack resistance scores (new function)
export const calculateAttackResistance = (
  password: string, 
  patterns: DetectedPattern[], 
  entropy: number
): AttackResistance => {
  // Calculate resistance to brute force attacks (based on entropy)
  // Higher entropy = more resistant to brute force
  const bruteForceFactor = Math.min(100, entropy * 1.5);
  
  // Calculate resistance to dictionary attacks
  // Presence of common words reduces resistance
  let dictionaryResistance = 100;
  const commonWordPatterns = patterns.filter(p => 
    ['common_word', 'popular_phrase', 'sports_team', 'movie_character'].includes(p.type)
  );
  
  if (commonWordPatterns.length > 0) {
    // Reduce score based on number and confidence of common patterns
    const confidenceSum = commonWordPatterns.reduce((sum, p) => sum + p.confidence, 0);
    const patternPenalty = (confidenceSum / commonWordPatterns.length) * 80; // Up to 80% penalty
    dictionaryResistance = Math.max(20, 100 - patternPenalty);
  }
  
  // Calculate resistance to pattern-based attacks
  // Patterns like sequential numbers, keyboard patterns, etc.
  let patternResistance = 100;
  const structuralPatterns = patterns.filter(p => 
    ['sequential', 'keyboard', 'repeating', 'date', 'name_year', 'word_number'].includes(p.type)
  );
  
  if (structuralPatterns.length > 0) {
    // Similar penalty calculation
    const confidenceSum = structuralPatterns.reduce((sum, p) => sum + p.confidence, 0);
    const patternPenalty = (confidenceSum / structuralPatterns.length) * 90; // Up to 90% penalty
    patternResistance = Math.max(10, 100 - patternPenalty);
  }
  
  // Calculate resistance to AI-driven attacks
  // AI tools can identify substitution patterns, leet speak, etc.
  let aiResistance = 85; // Base value
  const aiVulnerablePatterns = patterns.filter(p => 
    ['leet_speak', 'character_substitution', 'capitalized_word', 'word_special'].includes(p.type)
  );
  
  // AI vulnerability increases based on character variety and patterns
  if (password.length < 12) aiResistance -= 20;
  if (aiVulnerablePatterns.length > 0) {
    const confidenceSum = aiVulnerablePatterns.reduce((sum, p) => sum + p.confidence, 0);
    const aiPenalty = (confidenceSum / aiVulnerablePatterns.length) * 60; // Up to 60% penalty
    aiResistance = Math.max(25, aiResistance - aiPenalty);
  }
  
  // Calculate overall resistance score (weighted average)
  const overall = Math.round(
    (bruteForceFactor * 0.3) + 
    (dictionaryResistance * 0.25) + 
    (patternResistance * 0.25) + 
    (aiResistance * 0.2)
  );
  
  return {
    bruteForce: Math.round(bruteForceFactor),
    dictionary: Math.round(dictionaryResistance),
    patternBased: Math.round(patternResistance),
    aiAttack: Math.round(aiResistance),
    overall: Math.round(overall)
  };
};

// Calculate AI-driven hackability score
export const calculateHackabilityScore = (
  password: string,
  patterns: DetectedPattern[],
  entropy: number,
  crackTimeInSeconds: number
): HackabilityScore => {
  let hackabilityScore = 0;
  const reasons: string[] = [];
  
  // Is it in the top 10000 RockYou passwords? (simulated check)
  if (rockyouFrequencyTop[password.toLowerCase() as keyof typeof rockyouFrequencyTop]) {
    hackabilityScore += 50;
    const frequency = rockyouFrequencyTop[password.toLowerCase() as keyof typeof rockyouFrequencyTop];
    reasons.push(`This exact password appeared ${frequency} times in the RockYou data breach`);
  }
  
  // Analyze patterns with high confidence as significant contributors to hackability
  const highConfidencePatterns = patterns.filter(p => p.confidence > 0.8);
  if (highConfidencePatterns.length > 0) {
    hackabilityScore += 10 * highConfidencePatterns.length;
    highConfidencePatterns.forEach(pattern => {
      reasons.push(`Contains a ${pattern.description.toLowerCase()} (${Math.round(pattern.confidence * 100)}% confidence)`);
    });
  }
  
  // Short passwords are easily hackable
  if (password.length < 8) {
    hackabilityScore += 20;
    reasons.push(`Short password (${password.length} characters) can be brute forced quickly`);
  } else if (password.length < 12) {
    hackabilityScore += 10;
    reasons.push(`Moderate length password (${password.length} characters) offers limited protection`);
  }
  
  // Low entropy = high hackability
  if (entropy < 40) {
    hackabilityScore += 15;
    reasons.push(`Low entropy (${Math.round(entropy)} bits) indicates predictable character combinations`);
  }
  
  // Calculate risk level based on final score
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (hackabilityScore > 80) riskLevel = 'critical';
  else if (hackabilityScore > 60) riskLevel = 'high';
  else if (hackabilityScore > 40) riskLevel = 'medium';
  
  // Cap at 100
  hackabilityScore = Math.min(100, hackabilityScore);
  
  // Time to hack (simplified from crack time)
  let timeToHack = "Unknown";
  if (crackTimeInSeconds < 60) timeToHack = "Instantly";
  else if (crackTimeInSeconds < 3600) timeToHack = "Minutes";
  else if (crackTimeInSeconds < 86400) timeToHack = "Hours";
  else if (crackTimeInSeconds < 2592000) timeToHack = "Days";
  else if (crackTimeInSeconds < 31536000) timeToHack = "Months";
  else if (crackTimeInSeconds < 315360000) timeToHack = "Years";
  else timeToHack = "Centuries";
  
  // If we don't have specific reasons but the score is high, add generic reason
  if (reasons.length === 0 && hackabilityScore > 30) {
    reasons.push("Multiple subtle weakness patterns detected");
  }
  
  return {
    score: Math.round(hackabilityScore),
    reasoning: reasons,
    timeToHack,
    riskLevel
  };
};

// Helper function to check if a string of digits is sequential
const isSequentialNumber = (digits: string): boolean => {
  // Must be at least 3 digits to be considered sequential
  if (digits.length < 3) return false;
  
  let isAscending = true;
  let isDescending = true;
  
  for (let i = 1; i < digits.length; i++) {
    const current = parseInt(digits[i]);
    const previous = parseInt(digits[i-1]);
    
    // Check for ascending sequence (e.g., "1234")
    if (current !== previous + 1) {
      isAscending = false;
    }
    
    // Check for descending sequence (e.g., "4321")
    if (current !== previous - 1) {
      isDescending = false;
    }
    
    // If neither ascending nor descending, not sequential
    if (!isAscending && !isDescending) {
      return false;
    }
  }
  
  return isAscending || isDescending;
};

// Helper function to calculate charset diversity factor
const calculateCharsetFactor = (password: string): number => {
  let hasLower = /[a-z]/.test(password);
  let hasUpper = /[A-Z]/.test(password);
  let hasDigit = /[0-9]/.test(password);
  let hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const charsetCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  return charsetCount / 4; // Normalized to 0-1 range
};
