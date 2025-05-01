import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Achievement } from "@/components/SecretAchievements";

// Define icon types as strings instead of JSX
const DEFAULT_DAILY_CHALLENGES = [
  {
    id: "strong_password",
    title: "Create a Strong Password",
    description: "Create a password with uppercase, lowercase, numbers, and special characters",
    points: 50,
    completed: false,
    icon: "Lock"
  },
  {
    id: "high_entropy",
    title: "High Entropy Champion",
    description: "Create a password with at least 80 bits of entropy",
    points: 75,
    completed: false,
    icon: "Zap"
  },
  {
    id: "uncrackable",
    title: "Practically Uncrackable",
    description: "Create a password that would take over 100 years to crack",
    points: 100,
    completed: false,
    icon: "Shield"
  }
];

const DEFAULT_ACHIEVEMENTS = [
  {
    id: "first_password",
    title: "First Steps",
    description: "Test your first password",
    icon: "Star",
    iconColor: "text-amber-500",
    unlocked: false,
    secret: false,
    rarity: "common"
  },
  {
    id: "persistence",
    title: "Persistence Pays Off",
    description: "Test 10 different passwords",
    icon: "Shield",
    iconColor: "text-amber-500",
    unlocked: false,
    secret: false,
    rarity: "uncommon"
  },
  {
    id: "entropy_master",
    title: "Entropy Master",
    description: "Create a password with 100+ bits of entropy",
    icon: "Zap",
    iconColor: "text-blue-500",
    unlocked: false,
    secret: false,
    rarity: "rare"
  },
  {
    id: "first_game",
    title: "Game On",
    description: "Complete your first password mini-game",
    icon: "Trophy",
    iconColor: "text-amber-500",
    unlocked: false,
    secret: false,
    rarity: "common"
  },
  {
    id: "perfect_score",
    title: "Flawless Victory",
    description: "Score 100% on any mini-game",
    icon: "Trophy",
    iconColor: "text-purple-500",
    unlocked: false,
    secret: false,
    rarity: "rare"
  },
  {
    id: "passphrase_creator",
    title: "Phrase Master",
    description: "Generate a secure passphrase",
    icon: "KeyRound",
    iconColor: "text-green-500",
    unlocked: false,
    secret: false,
    rarity: "uncommon"
  },
  {
    id: "secret_decoder",
    title: "Secret Decoder",
    description: "Discover something hidden in the password arcade",
    icon: "Lock",
    iconColor: "text-purple-500",
    unlocked: false,
    secret: true,
    rarity: "legendary"
  }
];

// XP required for each level
const LEVEL_XP_REQUIREMENTS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5000, // Level 8
  7500, // Level 9
  10000 // Level 10
];

const useGameProgress = () => {
  // Game state
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [playerXp, setPlayerXp] = useState<number>(0);
  const [questsCompleted, setQuestsCompleted] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [dailyChallenges, setDailyChallenges] = useState(DEFAULT_DAILY_CHALLENGES);
  const [passwordsTestedCount, setPasswordsTestedCount] = useState<number>(0);
  const [gamesPlayedCount, setGamesPlayedCount] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  
  const { user } = useAuth();

  // Load game progress from localStorage on mount
  useEffect(() => {
    const storedLevel = localStorage.getItem('playerLevel');
    const storedXp = localStorage.getItem('playerXp');
    const storedQuests = localStorage.getItem('questsCompleted');
    const storedAchievements = localStorage.getItem('passwordAchievements');
    const storedChallenges = localStorage.getItem('dailyChallenges');
    const storedPasswordsCount = localStorage.getItem('passwordsTestedCount');
    const storedGamesCount = localStorage.getItem('gamesPlayedCount');
    const storedStreak = localStorage.getItem('dailyStreak');
    const storedLastCheckIn = localStorage.getItem('lastCheckInDate');
    
    if (storedLevel) setPlayerLevel(parseInt(storedLevel));
    if (storedXp) setPlayerXp(parseInt(storedXp));
    if (storedQuests) setQuestsCompleted(JSON.parse(storedQuests));
    if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
    if (storedChallenges) setDailyChallenges(JSON.parse(storedChallenges));
    if (storedPasswordsCount) setPasswordsTestedCount(parseInt(storedPasswordsCount));
    if (storedGamesCount) setGamesPlayedCount(parseInt(storedGamesCount));
    if (storedStreak) setDailyStreak(parseInt(storedStreak));
    if (storedLastCheckIn) setLastCheckInDate(storedLastCheckIn);
    
    // Check for daily reset
    checkDailyReset();
    
    // Update streak on login
    updateUserStreak();
  }, []);

  // Calculate the XP needed for the next level
  const calculateNextLevelXp = (level: number): number => {
    if (level >= LEVEL_XP_REQUIREMENTS.length) {
      // For levels beyond our defined table, use a formula
      return Math.floor(1000 * Math.pow(1.5, level - 5));
    }
    return LEVEL_XP_REQUIREMENTS[level];
  };

  // Calculate level based on XP
  const calculateLevel = (xp: number): number => {
    let level = 1;
    while (level < LEVEL_XP_REQUIREMENTS.length && xp >= LEVEL_XP_REQUIREMENTS[level]) {
      level++;
    }
    
    // Handle levels beyond our table
    if (level >= LEVEL_XP_REQUIREMENTS.length) {
      let extraXp = xp - LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
      let extraLevel = 0;
      let requiredXp = 0;
      
      while (extraXp >= requiredXp) {
        extraLevel++;
        requiredXp = Math.floor(1000 * Math.pow(1.5, extraLevel));
        extraXp -= requiredXp;
      }
      
      level = LEVEL_XP_REQUIREMENTS.length - 1 + extraLevel;
    }
    
    return level;
  };

  // Get XP progress toward next level
  const getLevelProgress = (currentLevel: number, totalXp: number): number => {
    // Get the XP threshold for the current level
    const currentLevelThreshold = currentLevel <= 1 ? 0 : 
      (currentLevel < LEVEL_XP_REQUIREMENTS.length ? 
        LEVEL_XP_REQUIREMENTS[currentLevel - 1] : 
        calculatePreviousLevelThreshold(currentLevel, totalXp));
        
    // XP already earned toward the next level
    return totalXp - currentLevelThreshold;
  };
  
  // Calculate the XP threshold for the previous level when beyond our table
  const calculatePreviousLevelThreshold = (currentLevel: number, totalXp: number): number => {
    if (currentLevel <= LEVEL_XP_REQUIREMENTS.length) {
      return LEVEL_XP_REQUIREMENTS[currentLevel - 1] || 0;
    }
    
    // For high levels, subtract the XP needed for this level
    let remainingXp = totalXp;
    for (let i = 1; i < currentLevel; i++) {
      if (i < LEVEL_XP_REQUIREMENTS.length) {
        remainingXp -= LEVEL_XP_REQUIREMENTS[i] - LEVEL_XP_REQUIREMENTS[i-1];
      } else {
        remainingXp -= Math.floor(1000 * Math.pow(1.5, i - 5));
      }
    }
    
    return totalXp - remainingXp;
  };

  // Add XP to player
  const addXp = (amount: number) => {
    const newTotalXp = playerXp + amount;
    const newLevel = calculateLevel(newTotalXp);
    
    // Check if player leveled up
    if (newLevel > playerLevel) {
      toast({
        title: "Level Up!",
        description: `Congratulations! You've reached level ${newLevel}!`,
      });
    }
    
    // Update state and localStorage
    setPlayerXp(newTotalXp);
    setPlayerLevel(newLevel);
    
    localStorage.setItem('playerXp', newTotalXp.toString());
    localStorage.setItem('playerLevel', newLevel.toString());
    
    return { newLevel, oldLevel: playerLevel, leveledUp: newLevel > playerLevel };
  };

  // Complete a quest
  const completeQuest = (questId: string, xpReward: number = 50) => {
    if (questsCompleted.includes(questId)) {
      return false; // Quest already completed
    }
    
    // Add quest to completed list
    const updatedQuests = [...questsCompleted, questId];
    setQuestsCompleted(updatedQuests);
    localStorage.setItem('questsCompleted', JSON.stringify(updatedQuests));
    
    // Award XP
    addXp(xpReward);
    
    return true;
  };

  // Handle daily challenge completion
  const handleDailyChallengeComplete = (challenge: any) => {
    const updatedChallenges = dailyChallenges.map(c => {
      if (c.id === challenge.id && !c.completed) {
        // Award XP for completing the challenge
        addXp(challenge.points);
        
        toast({
          title: "Challenge Complete!",
          description: `You've completed the "${challenge.title}" challenge and earned ${challenge.points} XP!`,
        });
        
        return { ...c, completed: true };
      }
      return c;
    });
    
    setDailyChallenges(updatedChallenges);
    localStorage.setItem('dailyChallenges', JSON.stringify(updatedChallenges));
  };

  // Check if challenges should be reset (new day)
  const checkDailyReset = () => {
    const lastReset = localStorage.getItem('lastChallengeReset');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!lastReset || lastReset !== today) {
      // Reset daily challenges
      const resetChallenges = DEFAULT_DAILY_CHALLENGES.map(c => ({ ...c, completed: false }));
      setDailyChallenges(resetChallenges);
      localStorage.setItem('dailyChallenges', JSON.stringify(resetChallenges));
      localStorage.setItem('lastChallengeReset', today);
    }
  };

  // Update user's daily streak
  const updateUserStreak = async (): Promise<number> => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (lastCheckInDate === today) {
      // Already checked in today
      return dailyStreak;
    }
    
    let newStreak = dailyStreak;
    
    // If last check-in was yesterday, increment streak
    if (lastCheckInDate) {
      const lastDate = new Date(lastCheckInDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Consecutive day
        newStreak += 1;
        
        // Award XP for maintaining streak
        const streakXp = Math.min(newStreak * 5, 50); // Cap at 50 XP per day
        addXp(streakXp);
        
        if (newStreak % 7 === 0) {
          // Weekly streak bonus
          addXp(100);
          toast({
            title: "Weekly Streak Bonus!",
            description: `${newStreak} days in a row! You earned a bonus 100 XP!`,
          });
        }
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      // First check-in
      newStreak = 1;
    }
    
    // Update state and localStorage
    setDailyStreak(newStreak);
    setLastCheckInDate(today);
    
    localStorage.setItem('dailyStreak', newStreak.toString());
    localStorage.setItem('lastCheckInDate', today);
    
    // Update streak on server if logged in
    if (user) {
      try {
        await supabase.from("user_profiles").upsert({
          user_id: user.id,
          daily_streak: newStreak,
          last_interaction_date: today
        });
      } catch (error) {
        console.error("Failed to update streak on server:", error);
      }
    }
    
    return newStreak;
  };

  // Check global rank
  const checkGlobalRank = async () => {
    if (!user) return null;
    
    try {
      // Get current user's XP
      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("xp")
        .eq("user_id", user.id)
        .single();
      
      if (userError || !userData) {
        console.error("Failed to fetch user data:", userError);
        return null;
      }
      
      // Count users with more XP
      const { count, error: countError } = await supabase
        .from("user_profiles")
        .select("user_id", { count: "exact" })
        .gt("xp", userData.xp);
      
      if (countError) {
        console.error("Failed to count higher ranked users:", countError);
        return null;
      }
      
      // Rank is count + 1
      const rank = (count || 0) + 1;
      setGlobalRank(rank);
      
      return rank;
    } catch (error) {
      console.error("Error checking global rank:", error);
      return null;
    }
  };

  // Increment games played count
  const incrementGamesPlayed = () => {
    const newCount = gamesPlayedCount + 1;
    setGamesPlayedCount(newCount);
    localStorage.setItem('gamesPlayedCount', newCount.toString());
    
    // Check for achievements
    if (newCount === 1 && !achievements.find(a => a.id === "first_game")?.unlocked) {
      const updatedAchievements = achievements.map(a => {
        if (a.id === "first_game") {
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      });
      
      setAchievements(updatedAchievements);
      localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
      
      toast({
        title: "Achievement Unlocked!",
        description: "Game On - Completed your first password mini-game",
      });
    }
    
    return newCount;
  };

  return {
    playerLevel,
    playerXp,
    questsCompleted,
    achievements,
    dailyChallenges,
    passwordsTestedCount,
    gamesPlayedCount,
    dailyStreak,
    globalRank,
    levelProgress: getLevelProgress(playerLevel, playerXp),
    nextLevelXp: calculateNextLevelXp(playerLevel),
    
    setPlayerLevel,
    setPlayerXp,
    setQuestsCompleted,
    setAchievements,
    setPasswordsTestedCount,
    setGamesPlayedCount,
    
    addXp,
    completeQuest,
    handleDailyChallengeComplete,
    updateUserStreak,
    checkGlobalRank,
    incrementGamesPlayed
  };
};

export default useGameProgress;
