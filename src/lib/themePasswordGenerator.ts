
// Function to generate a random number within a range
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array: any[]): any[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Generate random pronounceable syllables
const generateSyllable = (): string => {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  const specialConsonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  
  const patterns = [
    () => specialConsonants[getRandomInt(0, specialConsonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)],
    () => consonants[getRandomInt(0, consonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)] + consonants[getRandomInt(0, consonants.length - 1)],
    () => specialConsonants[getRandomInt(0, specialConsonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)] + consonants[getRandomInt(0, consonants.length - 1)]
  ];
  
  return patterns[getRandomInt(0, patterns.length - 1)]();
};

// Common symbols for password strength
const symbols = '!@#$%^&*()-_+=<>?';

// List of emojis for password generation
const emojis = ['🔥', '💪', '🚀', '🔒', '⚡', '🌟', '💯', '🎯', '🏆', '👑', '🌈', '🍕', '🍔', '🏄', '🎮', '📱', '💻', '🎵', '🐼', '🦊', '🐱', '🦁', '🐶', '🌙', '☀️'];

// 1. Reverse Gibberish Mode
export const generateReverseGibberish = (): string => {
  const syllableCount = getRandomInt(2, 4);
  let password = '';
  
  for (let i = 0; i < syllableCount; i++) {
    password += generateSyllable();
  }
  
  // Add numbers and symbols
  password += getRandomInt(10, 99);
  password += symbols[getRandomInt(0, symbols.length - 1)];
  
  return password;
};

// 2. Emoji Infusion
export const generateEmojiInfusion = (): string => {
  const words = ['love', 'rock', 'star', 'cool', 'ninja', 'panda', 'tiger', 'cyber', 'pixel', 'mega'];
  const word1 = words[getRandomInt(0, words.length - 1)];
  const word2 = words[getRandomInt(0, words.length - 1)];
  
  // Substitute some letters with numbers
  const word1Modified = word1.replace(/[aeio]/g, (match) => {
    const replacements: Record<string, string> = { 'a': '4', 'e': '3', 'i': '1', 'o': '0' };
    return replacements[match] || match;
  });
  
  // Add emojis and numbers
  const emoji1 = emojis[getRandomInt(0, emojis.length - 1)];
  const emoji2 = emojis[getRandomInt(0, emojis.length - 1)];
  const number = getRandomInt(10, 99);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  return `${word1Modified}${emoji1}${word2}${emoji2}${number}${symbol}`;
};

// 3. Song Lyric Shuffle
export const generateSongLyricShuffle = (): string => {
  const lyrics = [
    { line: 'hello darkness my old friend', key: 'H3ll0DarkN355' },
    { line: 'i will survive as long as i know how to love', key: 'W1llSurviv3L0v3' },
    { line: 'sweet dreams are made of this', key: 'Sw33tDr34m5' },
    { line: 'another brick in the wall', key: 'Br1ckW4ll' },
    { line: 'highway to hell', key: 'H1ghw4yH3ll' },
    { line: 'dont stop believing', key: 'D0ntSt0pB3l13v3' },
    { line: 'stairway to heaven', key: 'St41rw4yH34v3n' },
    { line: 'let it be let it be', key: 'L3t1tB3' },
    { line: 'all you need is love', key: '4llN33dL0v3' },
    { line: 'under pressure pushing down on me', key: 'Und3rPr355ur3' },
    { line: 'we will rock you', key: 'W3W1llR0ckU' },
    { line: 'bohemian rhapsody', key: 'B0h3m14nRh4p' }
  ];
  
  const lyric = lyrics[getRandomInt(0, lyrics.length - 1)];
  const emoji = emojis[getRandomInt(0, emojis.length - 1)];
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  return `${lyric.key}${emoji}${symbol}`;
};

// 4. Meme Passwords
export const generateMemePasswords = (): string => {
  const memes = [
    'EpicFail', 'Shrekswamp', 'ThisIsFine', 'DogeDoge', 'NyanCat',
    'ChungusBig', 'StonksMeme', 'PikachuShock', 'SpongeMock',
    'SuccessKid', 'KeanuReeves', 'CatSalad', 'YoDawg', 'BadLuckBrian',
    'DistractedBf', 'OneDoesnt', 'GigaChad', 'SadCat', 'PepeLaugh',
    'MindBlown', 'DabSquad', 'RickRoll', 'MonkaS', 'KappaFace',
    'AmongUs', 'TrollFace', 'MoonMoon', 'CoffeeRain', 'HamsterDance'
  ];
  
  const meme = memes[getRandomInt(0, memes.length - 1)];
  const number = getRandomInt(10, 999);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  const emoji = emojis[getRandomInt(0, emojis.length - 1)];
  
  // Substitute some letters with symbols
  const memeModified = meme.replace(/[aes]/g, (match) => {
    const replacements: Record<string, string> = { 'a': '@', 'e': '3', 's': '$' };
    return replacements[match] || match;
  });
  
  return `${memeModified}${symbol}${number}${emoji}`;
};

// 5. Insult Generator
export const generateInsultPasswords = (): string => {
  const adjectives = ['Silly', 'Lazy', 'Clumsy', 'Wimpy', 'Dorky', 'Klutzy', 'Goofy', 'Dopey', 'Loopy', 'Wacky',
                      'Sloppy', 'Fuzzy', 'Wobbly', 'Groggy', 'Ditzy', 'Lumpy', 'Frumpy', 'Wonky', 'Dinky', 'Flimsy'];
  const nouns = ['Donkey', 'Potato', 'Banana', 'Chicken', 'Llama', 'Penguin', 'Noodle', 'Doughnut', 'Walrus', 'Hippo',
                 'Pickle', 'Toaster', 'Weasel', 'Muffin', 'Broccoli', 'Pancake', 'Poodle', 'Cabbage', 'Waffle', 'Gerbil'];
  
  const adjective = adjectives[getRandomInt(0, adjectives.length - 1)];
  const noun = nouns[getRandomInt(0, nouns.length - 1)];
  const number = getRandomInt(10, 99);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  // Find matching emoji or default to a random one
  const matchingEmojiMap: Record<string, string> = {
    'Donkey': '🐴', 'Potato': '🥔', 'Banana': '🍌', 'Chicken': '🐔', 'Llama': '🦙', 
    'Penguin': '🐧', 'Noodle': '🍜', 'Doughnut': '🍩', 'Walrus': '🦭', 'Hippo': '🦛',
    'Pickle': '🥒', 'Toaster': '🍞', 'Weasel': '🐹', 'Muffin': '🧁', 'Broccoli': '🥦',
    'Pancake': '🥞', 'Poodle': '🐩', 'Cabbage': '🥬', 'Waffle': '🧇', 'Gerbil': '🐹'
  };
  
  const emoji = matchingEmojiMap[noun] || emojis[getRandomInt(0, emojis.length - 1)];
  
  return `${adjective}${noun}${symbol}${number}${emoji}`;
};

// 6. Movie Quote Remix
export const generateMovieQuoteRemix = (): string => {
  const quotes = [
    { quote: 'May The Force Be With You', key: 'MayTh3F0rc3' },
    { quote: 'I\'ll Be Back', key: '1llB3B4ck' },
    { quote: 'Houston We Have A Problem', key: 'H0ust0nPr0bl3m' },
    { quote: 'There\'s No Place Like Home', key: 'N0Pl4c3L1k3H0m3' },
    { quote: 'You Can\'t Handle The Truth', key: 'C4ntH4ndl3Truth' },
    { quote: 'Life Is Like A Box Of Chocolates', key: 'L1f3B0xCh0c0' },
    { quote: 'Say Hello To My Little Friend', key: 'H3ll0L1ttl3Fr13nd' },
    { quote: 'I Am Your Father', key: '1AmY0urF4th3r' },
    { quote: 'Here\'s Looking At You Kid', key: 'L00k1ngAtY0u' },
    { quote: 'Go Ahead Make My Day', key: 'M4k3MyD4y' },
    { quote: 'You Talking To Me', key: 'T4lk1ngT0M3' },
    { quote: 'Show Me The Money', key: 'Sh0wM3M0n3y' },
    { quote: 'Nobody Puts Baby In A Corner', key: 'N0b0dyPut$B4by' },
    { quote: 'I See Dead People', key: '1S33D34dP30pl3' },
    { quote: 'To Infinity And Beyond', key: '1nf1n1tyB3y0nd' }
  ];
  
  const quote = quotes[getRandomInt(0, quotes.length - 1)];
  const year = getRandomInt(2020, 2030);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  // Matching emojis for quotes
  const matchingEmojiMap: Record<string, string> = {
    'MayTh3F0rc3': '✨', '1llB3B4ck': '🤖', 'H0ust0nPr0bl3m': '🚀',
    'N0Pl4c3L1k3H0m3': '🏠', 'C4ntH4ndl3Truth': '⚖️', 'L1f3B0xCh0c0': '🍫',
    'H3ll0L1ttl3Fr13nd': '🔫', '1AmY0urF4th3r': '⚔️', 'L00k1ngAtY0u': '🥂',
    'M4k3MyD4y': '😎', 'T4lk1ngT0M3': '🗣️', 'Sh0wM3M0n3y': '💰',
    'N0b0dyPut$B4by': '💃', '1S33D34dP30pl3': '👻', '1nf1n1tyB3y0nd': '🚀'
  };
  
  const emoji = matchingEmojiMap[quote.key] || '🎬';
  
  return `${quote.key}${emoji}${symbol}${year}`;
};

// 7. Alien Language Mode
export const generateAlienLanguage = (): string => {
  const alienPrefixes = ['Xylo', 'Zorg', 'Klaatu', 'Blip', 'Quasar', 'Zeta', 'Vort', 'Drek', 'Neep', 'Glorp',
                         'Thorg', 'Krang', 'Meeple', 'Zoink', 'Pluto', 'Altair', 'Orion', 'Noova', 'Jargon', 'Bleep'];
  const alienSuffixes = ['zoid', 'borg', 'norp', 'tron', 'plax', 'morphs', 'thulhu', 'blorg', 'thrak', 'plorg',
                         'flux', 'nax', 'meep', 'topia', 'zon', 'plex', 'glax', 'tron', 'zar', 'bloop'];
  
  const prefix = alienPrefixes[getRandomInt(0, alienPrefixes.length - 1)];
  const suffix = alienSuffixes[getRandomInt(0, alienSuffixes.length - 1)];
  const number = getRandomInt(10, 99);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  // Space-themed emojis
  const spaceEmojis = ['☄️', '👽', '🛸', '🪐', '🌌', '👾', '🌠', '🤖', '⚡', '🌈', '🌍', '🌓', '🌕', '🚀', '⭐'];
  const emoji = spaceEmojis[getRandomInt(0, spaceEmojis.length - 1)];
  
  return `${prefix}${suffix}${number}${symbol}${emoji}`;
};

// 8. Keyboard Dance
export const generateKeyboardDance = (): string => {
  const patterns = [
    'QwErTy', 'AsdfGh', 'ZxCvBn', 'QazWsx', 'EdcRfv', 'TgbYhn',
    'WedcVfr', 'QazXsw', 'PlmOkn', 'ZaqXsw', 'MnbVcx', 'IkjuYh',
    'QwErAsdf', 'ZxcQaz', 'YhnUjm', 'WsxEdc', 'OkmIjn', 'LkjHgf'
  ];
  
  const pattern = patterns[getRandomInt(0, patterns.length - 1)];
  const numbers = `${getRandomInt(1, 9)}${getRandomInt(1, 9)}`;
  const symbolString = `${symbols[getRandomInt(0, symbols.length - 1)]}${symbols[getRandomInt(0, symbols.length - 1)]}`;
  
  const parts = [pattern, numbers, symbolString];
  return shuffleArray(parts).join('');
};

// 9. Auto-Roast Passwords
export const generateAutoRoastPasswords = (): string => {
  const roasts = [
    'UForgetUrPwD', 'ClickedReset2x', 'PwdOnStickyNote', 'Pw123456Again', 'BirthdayAsPwd',
    'DumbPassword', 'WeakPwdUser', 'HackedAgain', 'NotSecureAtAll', 'ForgottenTomorrow',
    'BruteForceVictim', 'DictionaryAttacked', 'PasswordReuser', 'HackerMagnet', 'WhatsMyPassword',
    'LeakedInBreaches', 'DuhhItsMyBirthday', 'SameAsMySocial', 'AdminIsMyPassword', 'RainbowTable'
  ];
  
  const roast = roasts[getRandomInt(0, roasts.length - 1)];
  const number = getRandomInt(10, 99);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  // Funny emojis for roasts
  const roastEmojis = ['🤡', '🙄', '🤦', '😂', '🧐', '🤪', '😱', '😬', '🤔', '😴', '💩', '🙃', '😅', '🤨', '🧠', '🤯', '🥴', '😒', '🫠', '🫣'];
  const emoji = roastEmojis[getRandomInt(0, roastEmojis.length - 1)];
  
  return `${roast}${symbol}${number}${emoji}`;
};

// 10. Hack-Proof Mode
export const generateHackProofMode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const specialChars = '!@#$%^&*()_+{}|:<>?';
  
  // Create 3 sections with character-symbol-number pattern
  let password = '';
  
  for (let i = 0; i < 3; i++) {
    password += characters.charAt(getRandomInt(0, 25)); // Uppercase letter
    password += characters.charAt(getRandomInt(26, 51)); // Lowercase letter
    password += characters.charAt(getRandomInt(52, 61)); // Number
    password += specialChars.charAt(getRandomInt(0, specialChars.length - 1)); // Symbol
  }
  
  return password;
};

// 11. Fantasy Character Generator (NEW)
export const generateFantasyCharacter = (): string => {
  const fantasyPrefixes = ['Dragon', 'Wizard', 'Elf', 'Knight', 'Rogue', 'Sorcerer', 'Paladin', 'Ranger', 
                           'Warlock', 'Archer', 'Druid', 'Mage', 'Warrior', 'Bard', 'Shaman'];
  const fantasyTitles = ['Slayer', 'Hunter', 'Master', 'Keeper', 'Warden', 'Guardian', 'Walker',
                         'Lord', 'King', 'Queen', 'Prince', 'Princess', 'Champion'];
  
  const prefix = fantasyPrefixes[getRandomInt(0, fantasyPrefixes.length - 1)];
  const title = fantasyTitles[getRandomInt(0, fantasyTitles.length - 1)];
  const year = getRandomInt(1000, 9999);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  // Fantasy-themed emojis
  const fantasyEmojis = ['🧙‍♂️', '🧝‍♀️', '🧚', '🔮', '🏹', '⚔️', '🗡️', '🛡️', '👑', '🧿', '🗝️', '🏰', '🐉', '🦄', '🧝‍♂️'];
  const emoji = fantasyEmojis[getRandomInt(0, fantasyEmojis.length - 1)];
  
  return `${prefix}${title}${symbol}${year}${emoji}`;
};

// 12. Tech Stack Generator (NEW)
export const generateTechStack = (): string => {
  const frontendTech = ['React', 'Angular', 'Vue', 'Svelte', 'Next', 'Nuxt', 'Flutter', 'Tailwind'];
  const backendTech = ['Node', 'Python', 'Django', 'Rails', 'Go', 'Java', 'Nest', 'Laravel', 'Express'];
  const databases = ['Mongo', 'Postgres', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'DynamoDB'];
  
  const frontend = frontendTech[getRandomInt(0, frontendTech.length - 1)];
  const backend = backendTech[getRandomInt(0, backendTech.length - 1)];
  const db = databases[getRandomInt(0, databases.length - 1)];
  const number = getRandomInt(10, 99);
  const symbol = symbols[getRandomInt(0, symbols.length - 1)];
  
  // Tech emojis
  const techEmojis = ['💻', '⚛️', '🚀', '🔥', '⚙️', '🛠️', '🧰', '📱', '🌐', '☁️'];
  const emoji = techEmojis[getRandomInt(0, techEmojis.length - 1)];
  
  return `${frontend}${backend}${db}${symbol}${number}${emoji}`;
};

// Function to generate a password based on the selected theme
export const generateThemedPassword = (theme: string): string => {
  switch (theme) {
    case 'reverseGibberish':
      return generateReverseGibberish();
    case 'emojiInfusion':
      return generateEmojiInfusion();
    case 'songLyricShuffle':
      return generateSongLyricShuffle();
    case 'memePasswords':
      return generateMemePasswords();
    case 'insultGenerator':
      return generateInsultPasswords();
    case 'movieQuoteRemix':
      return generateMovieQuoteRemix();
    case 'alienLanguage':
      return generateAlienLanguage();
    case 'keyboardDance':
      return generateKeyboardDance();
    case 'autoRoastPasswords':
      return generateAutoRoastPasswords();
    case 'hackProofMode':
      return generateHackProofMode();
    case 'fantasyCharacter':
      return generateFantasyCharacter();
    case 'techStack':
      return generateTechStack();
    default:
      return generateHackProofMode(); // Default to hack-proof mode
  }
};

export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length contribution (exponentially stronger with length)
  const lengthFactor = Math.min(password.length * 4, 50); // Up to 50 points for length
  strength += lengthFactor;
  
  // Character variety contribution
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9\u0000-\u007F]/.test(password)) strength += 15; // Unicode/emoji check
  
  // Penalty for repeating patterns
  const repeatingPatterns = password.match(/(.)\1{2,}/g);
  if (repeatingPatterns) {
    strength -= repeatingPatterns.length * 5;
  }
  
  // Penalty for sequential characters
  if (/123|234|345|456|567|678|789|987|876|765|654|543|432|321/.test(password)) {
    strength -= 10;
  }
  
  // Bonus for mixed character types in middle of password (not just at beginning/end)
  const middleSection = password.substring(1, password.length - 1);
  if (/[A-Z]/.test(middleSection) && /[0-9]/.test(middleSection) && 
      /[^A-Za-z0-9]/.test(middleSection)) {
    strength += 10;
  }
  
  // Ensure strength is between 0 and 100
  return Math.max(0, Math.min(100, strength));
};

// Function to get a strength label and color based on the strength value
export const getStrengthInfo = (strength: number): { label: string; color: string } => {
  if (strength >= 90) {
    return { label: "Extreme", color: "text-fuchsia-500" };
  } else if (strength >= 80) {
    return { label: "Very Strong", color: "text-green-600" };
  } else if (strength >= 65) {
    return { label: "Strong", color: "text-emerald-500" };
  } else if (strength >= 50) {
    return { label: "Good", color: "text-blue-500" };
  } else if (strength >= 35) {
    return { label: "Moderate", color: "text-amber-500" };
  } else {
    return { label: "Weak", color: "text-red-500" };
  }
};

// Generate passwords based on criteria (NEW)
export interface CustomPasswordOptions {
  length: number;
  includeUpper: boolean;
  includeLower: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  includeEmoji: boolean;
  avoidSimilar: boolean;
}

// Function to generate customized passwords (NEW)
export const generateCustomPassword = (options: CustomPasswordOptions): string => {
  const {
    length = 12,
    includeUpper = true,
    includeLower = true,
    includeNumbers = true,
    includeSymbols = true,
    includeEmoji = false,
    avoidSimilar = false
  } = options;
  
  // Character sets
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O if avoiding similar
  const upperAll = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz'; // Removed l and o if avoiding similar
  const lowerAll = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = avoidSimilar ? '23456789' : '0123456789'; // Removed 0 and 1 if avoiding similar
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const similarAmbiguous = 'iIlL1oO0';
  
  // Build character set based on options
  let chars = '';
  if (includeUpper) chars += avoidSimilar ? upper : upperAll;
  if (includeLower) chars += avoidSimilar ? lower : lowerAll;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;
  
  if (chars.length === 0) {
    // Default to lowercase if nothing selected
    chars = avoidSimilar ? lower : lowerAll;
  }
  
  // Generate password
  let password = '';
  for (let i = 0; i < length - (includeEmoji ? 1 : 0); i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add emoji if requested
  if (includeEmoji) {
    password += emojis[getRandomInt(0, emojis.length - 1)];
  }
  
  // Ensure at least one of each required type
  let finalPassword = password;
  if (includeUpper && !/[A-Z]/.test(finalPassword)) {
    const charSet = avoidSimilar ? upper : upperAll;
    finalPassword = charSet.charAt(getRandomInt(0, charSet.length - 1)) + 
                    finalPassword.substring(1);
  }
  
  if (includeLower && !/[a-z]/.test(finalPassword)) {
    const charSet = avoidSimilar ? lower : lowerAll;
    const pos = getRandomInt(0, finalPassword.length - 1);
    finalPassword = finalPassword.substring(0, pos) + 
                    charSet.charAt(getRandomInt(0, charSet.length - 1)) + 
                    finalPassword.substring(pos + 1);
  }
  
  if (includeNumbers && !/[0-9]/.test(finalPassword)) {
    const pos = getRandomInt(0, finalPassword.length - 1);
    finalPassword = finalPassword.substring(0, pos) + 
                    numbers.charAt(getRandomInt(0, numbers.length - 1)) + 
                    finalPassword.substring(pos + 1);
  }
  
  if (includeSymbols && !/[^A-Za-z0-9]/.test(finalPassword.replace(/[\u{1F300}-\u{1F6FF}]/gu, ''))) {
    const pos = getRandomInt(0, finalPassword.length - 1);
    finalPassword = finalPassword.substring(0, pos) + 
                    symbols.charAt(getRandomInt(0, symbols.length - 1)) + 
                    finalPassword.substring(pos + 1);
  }
  
  return finalPassword;
};
