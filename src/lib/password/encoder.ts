
// Simple encoder utilities for the Cipher Sync game

/**
 * Encodes a string using base64
 */
export const encodeBase64 = (str: string): string => {
  return btoa(str);
};

/**
 * Decodes a base64 string
 */
export const decodeBase64 = (str: string): string => {
  return atob(str);
};

/**
 * ROT13 cipher implementation
 */
export const rot13 = (str: string): string => {
  return str.replace(/[a-zA-Z]/g, function(char) {
    const charCode = char.charCodeAt(0);
    const isUpperCase = char === char.toUpperCase();
    const baseCharCode = isUpperCase ? 65 : 97;
    return String.fromCharCode((charCode - baseCharCode + 13) % 26 + baseCharCode);
  });
};

/**
 * Returns a shortened SHA-256 hash preview (first 10 chars)
 * Note: This is just a simulation for the game
 */
export const getHashPreview = (str: string): string => {
  // In a real implementation, we'd use a proper hashing function
  // For the game, we'll use a simplified approach
  let hash = "";
  const chars = "abcdef0123456789";
  
  // Generate a pseudo-hash for game purposes
  for (let i = 0; i < 10; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return hash + "...";
};

/**
 * Reverses a string
 */
export const reverseString = (str: string): string => {
  return str.split("").reverse().join("");
};

/**
 * Obfuscates characters in a string, leaving first and last visible
 */
export const obfuscateMiddle = (str: string): string => {
  if (str.length <= 2) return str;
  
  const firstChar = str.charAt(0);
  const lastChar = str.charAt(str.length - 1);
  const middleLength = str.length - 2;
  const obfuscated = "*".repeat(middleLength);
  
  return firstChar + obfuscated + lastChar;
};

/**
 * Converts a string to leet speak
 */
export const leetSpeak = (str: string): string => {
  return str
    .replace(/a/gi, "4")
    .replace(/e/gi, "3")
    .replace(/i/gi, "1")
    .replace(/o/gi, "0")
    .replace(/s/gi, "$")
    .replace(/t/gi, "7")
    .replace(/l/gi, "1");
};

/**
 * Transforms a password with random encoding method based on level
 */
export const transformPassword = (password: string, level: number): { 
  displayed: string; 
  original: string;
  encodingType: string;
} => {
  // Level 1: Plain text or simple transformations
  if (level === 1) {
    const transformType = Math.floor(Math.random() * 2);
    if (transformType === 0) {
      // No transformation
      return { 
        displayed: password, 
        original: password,
        encodingType: "plaintext"
      };
    } else {
      // Simple obfuscation
      return { 
        displayed: obfuscateMiddle(password), 
        original: password,
        encodingType: "obfuscated"
      };
    }
  }
  
  // Level 2: More complex encodings
  if (level === 2) {
    const transformType = Math.floor(Math.random() * 3);
    if (transformType === 0) {
      // Base64
      return { 
        displayed: encodeBase64(password), 
        original: password,
        encodingType: "base64"
      };
    } else if (transformType === 1) {
      // ROT13
      return { 
        displayed: rot13(password), 
        original: password,
        encodingType: "rot13"
      };
    } else {
      // Leet speak
      return { 
        displayed: leetSpeak(password), 
        original: password,
        encodingType: "leetspeak"
      };
    }
  }
  
  // Level 3: Most complex - hash preview
  return { 
    displayed: getHashPreview(password), 
    original: password,
    encodingType: "hashed"
  };
};
