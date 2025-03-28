
// Common password patterns to check against
export const commonPatterns = [
  {
    pattern: /^12345/,
    description: "Sequential numbers"
  },
  {
    pattern: /^qwerty/i,
    description: "Keyboard pattern"
  },
  {
    pattern: /^asdf/i,
    description: "Keyboard pattern"
  },
  {
    pattern: /^zxcv/i,
    description: "Keyboard pattern"
  },
  {
    pattern: /^abc/i,
    description: "Sequential letters"
  },
  {
    pattern: /password/i,
    description: "Contains 'password'"
  },
  {
    pattern: /^admin/i,
    description: "Administrative term"
  },
  {
    pattern: /^welcome/i,
    description: "Common greeting"
  },
  {
    pattern: /^letmein/i,
    description: "Common phrase"
  },
  {
    pattern: /^monkey/i,
    description: "Common animal"
  },
  {
    pattern: /^dragon/i,
    description: "Common mythical creature"
  },
  {
    pattern: /^football/i,
    description: "Common sport"
  },
  {
    pattern: /^baseball/i,
    description: "Common sport"
  },
  {
    pattern: /^superman/i,
    description: "Popular character"
  },
  {
    pattern: /^batman/i,
    description: "Popular character"
  },
  {
    pattern: /^trustno1/i,
    description: "Common phrase"
  },
  {
    pattern: /^sunshine/i,
    description: "Common nature term"
  },
  {
    pattern: /^princess/i,
    description: "Common term"
  },
  {
    pattern: /^iloveyou/i,
    description: "Common phrase"
  },
  {
    pattern: /^shadow/i,
    description: "Common term"
  },
  {
    pattern: /^master/i,
    description: "Common term"
  },
  {
    pattern: /(19|20)\d{2}/,
    description: "Year pattern"
  },
  {
    pattern: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](\d{2}|\d{4})\b/,
    description: "Date pattern"
  }
];

// Check if a password contains any common patterns
export const containsCommonPattern = (password: string): { found: boolean; patterns: string[] } => {
  const foundPatterns: string[] = [];
  
  for (const { pattern, description } of commonPatterns) {
    if (pattern.test(password)) {
      foundPatterns.push(description);
    }
  }
  
  return {
    found: foundPatterns.length > 0,
    patterns: foundPatterns
  };
};
