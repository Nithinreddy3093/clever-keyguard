
// Premium password generator with advanced security options

const complexCharSets = {
  upperLatin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowerLatin: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  extendedChars: '£€¥¢©®™§¿¡µπΩ∑∏√∞≈≠≤≥±÷°¹²³',
  unicodeSymbols: '★☆☀☂☹☺♠♣♥♦♪♫♯✓✗❄❤',
  rareChars: 'ÆæÞþðÐƏəŊŋ',
  securitySymbols: '⚠⚡⚓⚔⚕⚖⚗⚙⚛⚜⚝⚠⚡'
};

interface PremiumPasswordOptions {
  length: number;
  minUppercase: number;
  minLowercase: number;
  minNumbers: number;
  minSpecial: number;
  useExtended: boolean;
  useUnicode: boolean;
  useRare: boolean;
  useSecurity: boolean;
  avoidAmbiguousChars: boolean;
  requirePronounceable: boolean;
  securityLevel: 'standard' | 'high' | 'enterprise' | 'quantum';
}

// Get a random number between min and max
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Fisher-Yates shuffle algorithm
const shuffleString = (str: string): string => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

// Check if a password meets requirements
const meetsRequirements = (
  password: string, 
  options: PremiumPasswordOptions
): boolean => {
  let uppercaseCount = 0;
  let lowercaseCount = 0;
  let numberCount = 0;
  let specialCount = 0;
  
  for (const char of password) {
    if (complexCharSets.upperLatin.includes(char)) uppercaseCount++;
    else if (complexCharSets.lowerLatin.includes(char)) lowercaseCount++;
    else if (complexCharSets.numbers.includes(char)) numberCount++;
    else if (complexCharSets.specialChars.includes(char)) specialCount++;
  }
  
  return (
    uppercaseCount >= options.minUppercase &&
    lowercaseCount >= options.minLowercase &&
    numberCount >= options.minNumbers &&
    specialCount >= options.minSpecial
  );
};

// Generate premium password
export const generatePremiumPassword = (options: PremiumPasswordOptions): string => {
  const {
    length = 16,
    minUppercase = 2,
    minLowercase = 2,
    minNumbers = 2,
    minSpecial = 2,
    useExtended = false,
    useUnicode = false,
    useRare = false,
    useSecurity = false,
    avoidAmbiguousChars = true,
    requirePronounceable = false,
    securityLevel = 'high'
  } = options;
  
  // Build character pool based on options
  let charPool = '';
  
  // Add standard character sets
  charPool += complexCharSets.upperLatin;
  charPool += complexCharSets.lowerLatin;
  charPool += complexCharSets.numbers;
  charPool += complexCharSets.specialChars;
  
  // Add premium character sets if requested
  if (useExtended) charPool += complexCharSets.extendedChars;
  if (useUnicode) charPool += complexCharSets.unicodeSymbols;
  if (useRare) charPool += complexCharSets.rareChars;
  if (useSecurity) charPool += complexCharSets.securitySymbols;
  
  // Remove ambiguous characters if requested
  if (avoidAmbiguousChars) {
    charPool = charPool.replace(/[1lI0OQ]/g, '');
  }
  
  // Security level adjustments
  let entropyMultiplier = 1;
  switch (securityLevel) {
    case 'standard':
      entropyMultiplier = 1;
      break;
    case 'high':
      entropyMultiplier = 1.2;
      break;
    case 'enterprise':
      entropyMultiplier = 1.5;
      break;
    case 'quantum':
      entropyMultiplier = 2;
      break;
  }
  
  const adjustedLength = Math.ceil(length * entropyMultiplier);
  
  // Ensure we have the minimum required characters of each type
  let password = '';
  
  // Add required uppercase
  for (let i = 0; i < minUppercase; i++) {
    password += complexCharSets.upperLatin[getRandomInt(0, complexCharSets.upperLatin.length - 1)];
  }
  
  // Add required lowercase
  for (let i = 0; i < minLowercase; i++) {
    password += complexCharSets.lowerLatin[getRandomInt(0, complexCharSets.lowerLatin.length - 1)];
  }
  
  // Add required numbers
  for (let i = 0; i < minNumbers; i++) {
    password += complexCharSets.numbers[getRandomInt(0, complexCharSets.numbers.length - 1)];
  }
  
  // Add required special chars
  for (let i = 0; i < minSpecial; i++) {
    password += complexCharSets.specialChars[getRandomInt(0, complexCharSets.specialChars.length - 1)];
  }
  
  // Fill remaining password length with random characters from pool
  const remainingLength = adjustedLength - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += charPool[getRandomInt(0, charPool.length - 1)];
  }
  
  // Shuffle the entire password
  password = shuffleString(password);
  
  // If we need a pronounceable password, try to insert some vowels
  if (requirePronounceable && password.length > 6) {
    const vowels = 'aeiou';
    // Insert vowels every 2-3 characters
    for (let i = 2; i < password.length; i += 3) {
      if (Math.random() > 0.3) { // 70% chance to insert vowel
        const vowel = vowels[getRandomInt(0, vowels.length - 1)];
        password = password.substring(0, i) + vowel + password.substring(i);
      }
    }
    // Trim if needed
    if (password.length > adjustedLength) {
      password = password.substring(0, adjustedLength);
    }
  }
  
  // Double-check password meets requirements
  if (!meetsRequirements(password, options)) {
    // Try again if requirements not met
    return generatePremiumPassword(options);
  }
  
  return password;
};

// Calculate the strength of the generated password
export const calculatePremiumPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  // Base strength from password length
  let strength = Math.min(password.length * 4, 40);
  
  // Character variety
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUnicode = /[^\x00-\x7F]/.test(password);
  
  if (hasUpper) strength += 10;
  if (hasLower) strength += 10;
  if (hasNumber) strength += 10;
  if (hasSpecial) strength += 15;
  if (hasUnicode) strength += 15;
  
  // Pattern analysis
  const hasNoRepeats = !/(.)\1{2,}/.test(password); // No character repeated 3+ times
  const hasNoSequential = !/123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password);
  
  if (hasNoRepeats) strength += 5;
  if (hasNoSequential) strength += 5;
  
  return Math.min(100, strength);
};

// Generate enterprise-level passphrase
export const generateEnterpriseSafePassphrase = (): string => {
  const securityWords = [
    'Quantum', 'Cipher', 'Fortress', 'Secured', 'Protocol', 'Defense',
    'Bastion', 'Sentinel', 'Guardian', 'Shield', 'Protect', 'Firewall',
    'Encrypt', 'Vault', 'Barrier', 'Safeguard', 'Watchman', 'Monitor'
  ];
  
  const randomWords = [
    'Blue', 'Red', 'Green', 'Delta', 'Alpha', 'Omega', 'Swift', 
    'Prime', 'Echo', 'Foxtrot', 'Tango', 'Sierra', 'Bravo', 'Nova'
  ];
  
  const securityWord = securityWords[getRandomInt(0, securityWords.length - 1)];
  const randomWord = randomWords[getRandomInt(0, randomWords.length - 1)];
  const number = getRandomInt(100, 999);
  const specialChar = complexCharSets.specialChars[getRandomInt(0, complexCharSets.specialChars.length - 1)];
  
  return `${securityWord}${randomWord}${number}${specialChar}`;
};
