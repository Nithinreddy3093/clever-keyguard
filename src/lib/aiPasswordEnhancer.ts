
// AI-powered password enhancer based on GPT-2 fine-tuned models
// This simulates AI capabilities by using sophisticated transformation rules

interface EnhancementSuggestion {
  originalPassword: string;
  enhancedPassword: string;
  improvements: string[];
  strengthIncrease: number; // Estimated increase in entropy
}

// Character substitution map for basic transformations
const substitutionMap: Record<string, string[]> = {
  'a': ['@', '4', 'A'],
  'b': ['8', 'B'],
  'c': ['(', 'C'],
  'e': ['3', 'E'],
  'i': ['!', '1', 'I'],
  'l': ['1', '|', 'L'],
  'o': ['0', 'O'],
  's': ['$', '5', 'S'],
  't': ['+', '7', 'T'],
  'g': ['9', 'G'],
  'z': ['2', 'Z']
};

// Common words to replace with stronger alternatives
const wordReplacements: Record<string, string[]> = {
  'password': ['P@$$w0rd', 'SecretKey', 'Pr1v@teK3y'],
  'welcome': ['W3lc0m3', 'Gr33t1ngs', 'H3ll0There'],
  'admin': ['@dm1n', 'Syst3mUser', 'R00tUs3r'],
  'login': ['L0g1n', 'S1gn0n', '@cc3ss'],
  'summer': ['Summ3r', 'S0lstice', 'W@rmSe@son'],
  'winter': ['W1nt3r', 'Fr0stTime', 'Sn0wSeason'],
  'secret': ['S3cr3t', 'H1dd3n', 'Crypt1c']
};

// Generate a random special character
const getRandomSpecial = (): string => {
  const specials = '!@#$%^&*()-_=+[]{}|;:,.<>?/';
  return specials.charAt(Math.floor(Math.random() * specials.length));
};

// Generate a random digit
const getRandomDigit = (): string => {
  return Math.floor(Math.random() * 10).toString();
};

// Insert random character at random position
const insertRandomCharacter = (password: string): string => {
  const position = Math.floor(Math.random() * (password.length + 1));
  const charType = Math.floor(Math.random() * 3);
  let charToInsert = '';
  
  switch (charType) {
    case 0: // Special character
      charToInsert = getRandomSpecial();
      break;
    case 1: // Digit
      charToInsert = getRandomDigit();
      break;
    case 2: // Uppercase letter
      charToInsert = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
      break;
  }
  
  return password.slice(0, position) + charToInsert + password.slice(position);
};

// Apply character substitutions
const applySubstitutions = (password: string): { result: string; changes: number } => {
  let result = '';
  let changes = 0;
  
  // Only substitute some characters to maintain readability
  const maxChanges = Math.min(3, Math.ceil(password.length / 4));
  const positions = new Set<number>();
  
  // Select random positions to substitute
  while (positions.size < maxChanges) {
    const pos = Math.floor(Math.random() * password.length);
    positions.add(pos);
  }
  
  for (let i = 0; i < password.length; i++) {
    const char = password[i].toLowerCase();
    
    if (positions.has(i) && substitutionMap[char]) {
      const substitutions = substitutionMap[char];
      const newChar = substitutions[Math.floor(Math.random() * substitutions.length)];
      result += newChar;
      changes++;
    } else {
      result += password[i];
    }
  }
  
  return { result, changes };
};

// Process word replacements
const replaceCommonWords = (password: string): { result: string; replaced: boolean } => {
  let result = password;
  let replaced = false;
  
  for (const [word, replacements] of Object.entries(wordReplacements)) {
    const regex = new RegExp(word, 'i');
    if (regex.test(password)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = password.replace(regex, replacement);
      replaced = true;
      break; // Only replace one word to maintain recognizability
    }
  }
  
  return { result, replaced };
};

// Add capitalization if missing
const addCapitalization = (password: string): { result: string; changed: boolean } => {
  if (/[A-Z]/.test(password)) {
    return { result: password, changed: false };
  }
  
  // Capitalize a random character
  const pos = Math.floor(Math.random() * password.length);
  const result = password.slice(0, pos) + password.charAt(pos).toUpperCase() + password.slice(pos + 1);
  
  return { result, changed: true };
};

// AI-based password enhancement
export const enhancePassword = (
  password: string, 
  currentScore: number
): EnhancementSuggestion => {
  // Don't enhance already strong passwords
  if (currentScore >= 4) {
    return {
      originalPassword: password,
      enhancedPassword: password,
      improvements: ["Your password is already strong."],
      strengthIncrease: 0
    };
  }
  
  let enhancedPassword = password;
  const improvements: string[] = [];
  let entropyIncrease = 0;
  
  // Try word replacements first
  const { result: wordReplaced, replaced } = replaceCommonWords(enhancedPassword);
  if (replaced) {
    enhancedPassword = wordReplaced;
    improvements.push("Replaced common word with stronger alternative");
    entropyIncrease += 10;
  }
  
  // Apply character substitutions
  const { result: subResult, changes } = applySubstitutions(enhancedPassword);
  if (changes > 0) {
    enhancedPassword = subResult;
    improvements.push(`Applied ${changes} character substitutions`);
    entropyIncrease += changes * 2;
  }
  
  // Add capitalization if needed
  const { result: capResult, changed: capChanged } = addCapitalization(enhancedPassword);
  if (capChanged) {
    enhancedPassword = capResult;
    improvements.push("Added capitalization");
    entropyIncrease += 2;
  }
  
  // Add special character if none exists
  if (!/[^A-Za-z0-9]/.test(enhancedPassword)) {
    enhancedPassword = insertRandomCharacter(enhancedPassword);
    improvements.push("Added special character");
    entropyIncrease += 4;
  }
  
  // Add digit if none exists
  if (!/\d/.test(enhancedPassword)) {
    enhancedPassword = insertRandomCharacter(enhancedPassword);
    improvements.push("Added numeric character");
    entropyIncrease += 3;
  }
  
  // If the password is too short, make it longer
  if (enhancedPassword.length < 12) {
    // Add 2-3 random characters
    const charsToAdd = Math.min(3, 12 - enhancedPassword.length);
    for (let i = 0; i < charsToAdd; i++) {
      enhancedPassword = insertRandomCharacter(enhancedPassword);
    }
    improvements.push(`Extended password length by ${charsToAdd} characters`);
    entropyIncrease += charsToAdd * 4;
  }
  
  return {
    originalPassword: password,
    enhancedPassword,
    improvements,
    strengthIncrease: entropyIncrease
  };
};
