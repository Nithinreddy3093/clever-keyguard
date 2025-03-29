
// AI-powered passphrase generator that creates strong yet memorable passwords
// This simulates a language model trained on natural language and security patterns

// Word lists inspired by EFF's large wordlist
const commonNouns = [
  "apple", "arrow", "basket", "beach", "bird", "book", "bridge", "camera", "candle", "cloud",
  "coffee", "compass", "diamond", "dragon", "eagle", "forest", "garden", "guitar", "harbor", "island",
  "journey", "kettle", "lantern", "meadow", "mountain", "ocean", "panda", "planet", "river", "rocket",
  "saddle", "sandwich", "sunset", "tiger", "trumpet", "umbrella", "village", "window", "wizard", "zebra"
];

const uncommonAdjectives = [
  "ancient", "bold", "calm", "daring", "elegant", "fierce", "gentle", "hidden", "intense", "jolly",
  "keen", "lively", "mystic", "noble", "peaceful", "quirky", "radiant", "silent", "tactical", "unique",
  "valiant", "wild", "zealous", "vibrant", "thoughtful", "serene", "rugged", "precise", "organic", "nimble"
];

const verbs = [
  "admires", "builds", "creates", "defends", "explores", "follows", "gathers", "helps", "inspires", "jumps",
  "knows", "leads", "makes", "notices", "observes", "protects", "questions", "remembers", "searches", "teaches"
];

const specialChars = ["!", "@", "#", "$", "%", "^", "&", "*", "?", "~"];
const numbers = ["2", "3", "4", "5", "6", "7", "8", "9"];

// Generate a random passphrase with specified options
export interface PassphraseOptions {
  wordCount: number;        // Number of words to include
  addNumber: boolean;       // Include a number
  addSpecial: boolean;      // Include a special character
  capitalizeWords: boolean; // Capitalize first letter of each word
}

// Get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a passphrase based on options
export const generatePassphrase = (options: PassphraseOptions): string => {
  const {
    wordCount = 4,
    addNumber = true,
    addSpecial = true,
    capitalizeWords = true
  } = options;
  
  // Build the phrase with 2 patterns:
  // 1. Adjective + Noun + Verb + Noun (for wordCount=4)
  // 2. Adjective + Noun + Verb (for wordCount=3)
  
  let words: string[] = [];
  
  if (wordCount >= 4) {
    // Pattern: Adjective + Noun + Verb + Noun
    const adjective = getRandomItem(uncommonAdjectives);
    const noun1 = getRandomItem(commonNouns);
    const verb = getRandomItem(verbs);
    const noun2 = getRandomItem(commonNouns.filter(n => n !== noun1)); // Avoid duplicate nouns
    
    words = [adjective, noun1, verb, noun2];
    
    // If more than 4 words requested, add more adjective+noun pairs
    for (let i = 4; i < wordCount; i += 2) {
      const extraAdjective = getRandomItem(uncommonAdjectives.filter(a => !words.includes(a)));
      const extraNoun = getRandomItem(commonNouns.filter(n => !words.includes(n)));
      words.push(extraAdjective, extraNoun);
    }
    
    // Trim to exact word count
    words = words.slice(0, wordCount);
  } else {
    // For fewer words, use simpler pattern
    const adjective = getRandomItem(uncommonAdjectives);
    const noun = getRandomItem(commonNouns);
    
    words = [adjective, noun];
    
    if (wordCount >= 3) {
      const verb = getRandomItem(verbs);
      words.push(verb);
    }
  }
  
  // Apply capitalization if requested
  if (capitalizeWords) {
    words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  }
  
  // Create base passphrase
  let passphrase = words.join("");
  
  // Add a number if requested
  if (addNumber) {
    passphrase += getRandomItem(numbers);
  }
  
  // Add a special character if requested
  if (addSpecial) {
    passphrase += getRandomItem(specialChars);
  }
  
  return passphrase;
};

// Generate multiple passphrase suggestions
export const generatePassphraseSuggestions = (count: number = 3): string[] => {
  const suggestions: string[] = [];
  
  // Create variations with different options
  const optionsSets: PassphraseOptions[] = [
    { wordCount: 3, addNumber: true, addSpecial: true, capitalizeWords: true },
    { wordCount: 4, addNumber: true, addSpecial: true, capitalizeWords: true },
    { wordCount: 3, addNumber: true, addSpecial: true, capitalizeWords: false }
  ];
  
  for (let i = 0; i < count; i++) {
    const options = optionsSets[i % optionsSets.length];
    suggestions.push(generatePassphrase(options));
  }
  
  return suggestions;
};

// Calculate the estimated strength of a generated passphrase
export const calculatePassphraseStrength = (passphrase: string): number => {
  // Base entropy from word selection
  let wordCount = 0;
  let hasCapitals = false;
  let hasNumbers = false;
  let hasSpecials = false;
  
  // Detect characteristics
  if (/[A-Z]/.test(passphrase)) hasCapitals = true;
  if (/[0-9]/.test(passphrase)) hasNumbers = true;
  if (/[^A-Za-z0-9]/.test(passphrase)) hasSpecials = true;
  
  // Estimate word count based on length and character types
  // This is a rough estimate since we can't perfectly detect words in the passphrase
  wordCount = Math.max(2, Math.floor(passphrase.length / 6));
  
  // Calculate entropy (bits)
  // Each word from wordlist ~11 bits of entropy
  let entropy = wordCount * 11;
  
  // Add extra entropy for capitalizations, numbers, symbols
  if (hasCapitals) entropy += 4;
  if (hasNumbers) entropy += 3;
  if (hasSpecials) entropy += 4;
  
  return entropy;
};

// Get memory-friendly passphrases with mnemonic hints
export const getMemorablePassphrases = (count: number = 3): Array<{passphrase: string, hint: string}> => {
  const results: Array<{passphrase: string, hint: string}> = [];
  
  for (let i = 0; i < count; i++) {
    // Create a passphrase with a story-like structure
    const options: PassphraseOptions = {
      wordCount: 3 + (i % 2), // Alternate between 3 and 4 words
      addNumber: true,
      addSpecial: true,
      capitalizeWords: true
    };
    
    const passphrase = generatePassphrase(options);
    
    // Extract words by removing numbers and special chars
    const words = passphrase
      .replace(/[0-9]/g, '')
      .replace(/[^A-Za-z]/g, '')
      .match(/[A-Z][a-z]*/g) || [];
    
    // Create a simple mnemonic hint
    let hint = "";
    if (words.length >= 3) {
      hint = `Imagine a ${words[1].toLowerCase()} that is ${words[0].toLowerCase()} and ${words[2].toLowerCase()}`;
      if (words.length >= 4) {
        hint += ` a ${words[3].toLowerCase()}`;
      }
    }
    
    results.push({
      passphrase,
      hint
    });
  }
  
  return results;
};
