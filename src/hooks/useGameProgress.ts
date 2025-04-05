import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  secret?: boolean;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  expiresAt: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  xp: number;
}

const DEFAULT_ACHIEVEMENTS: AchievementData[] = [
  {
    id: "masterHacker",
    title: "Master Hacker",
    description: "Achieve a perfect score of 100 on password strength",
    icon: "🔐",
    unlocked: false,
    secret: false,
    rarity: "legendary"
  },
  {
    id: "complexity",
    title: "Complexity King",
    description: "Create a password with uppercase, lowercase, numbers, and special characters",
    icon: "🛡️",
    unlocked: false,
    secret: false,
    rarity: "common"
  },
  {
    id: "entropy",
    title: "Entropy Master",
    description: "Create a password with entropy over 100 bits",
    icon: "🔒",
    unlocked: false,
    secret: false,
    rarity: "rare"
  },
  {
    id: "streakMaster",
    title: "Streak Master",
    description: "Maintain a 7-day streak of password checking",
    icon: "🔥",
    unlocked: false,
    secret: false,
    rarity: "uncommon"
  },
  {
    id: "persistence",
    title: "Persistence Pays Off",
    description: "Test 10 different passwords",
    icon: "🧪",
    unlocked: false,
    secret: false,
    rarity: "common"
  },
  {
    id: "noCommon",
    title: "Pattern Breaker",
    description: "Create a secure password with no common patterns",
    icon: "🧩",
    unlocked: false,
    secret: true,
    rarity: "uncommon"
  },
  {
    id: "diamond",
    title: "Diamond Standard",
    description: "Create a password that would take over 1000 years to crack",
    icon: "💎",
    unlocked: false,
    secret: true,
    rarity: "legendary"
  }
];

const useGameProgress = () => {
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<AchievementData[]>(DEFAULT_ACHIEVEMENTS);
  const [questsCompleted, setQuestsCompleted] = useState<Quest[]>([]);
  const [passwordsTestedCount, setPasswordsTestedCount] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXp, setPlayerXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);

  const calculateXpToNextLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  useEffect(() => {
    const storedStreak = localStorage.getItem("passwordStreak");
    if (storedStreak) {
      setStreak(parseInt(storedStreak));
    }

    const storedAchievements = localStorage.getItem("passwordAchievements");
    if (storedAchievements) {
      setAchievements(JSON.parse(storedAchievements));
    }

    const storedQuests = localStorage.getItem("passwordQuests");
    if (storedQuests) {
      setQuestsCompleted(JSON.parse(storedQuests));
    }

    const storedPasswordsCount = localStorage.getItem("passwordsTestedCount");
    if (storedPasswordsCount) {
      setPasswordsTestedCount(parseInt(storedPasswordsCount));
    }

    const storedPlayerLevel = localStorage.getItem("passwordPlayerLevel");
    if (storedPlayerLevel) {
      const level = parseInt(storedPlayerLevel);
      setPlayerLevel(level);
      setXpToNextLevel(calculateXpToNextLevel(level));
    }

    const storedPlayerXp = localStorage.getItem("passwordPlayerXp");
    if (storedPlayerXp) {
      setPlayerXp(parseInt(storedPlayerXp));
    }

    const lastCompletion = localStorage.getItem("lastDailyChallengeCompletion");
    const isToday = lastCompletion === new Date().toDateString();
    setTodayCompleted(isToday);
    
    const storedDailyChallenges = localStorage.getItem("dailyChallenges");
    if (storedDailyChallenges) {
      const parsedChallenges = JSON.parse(storedDailyChallenges);
      const lastUpdate = localStorage.getItem("dailyChallengesDate");
      
      if (lastUpdate === new Date().toDateString()) {
        setDailyChallenges(parsedChallenges);
      } else {
        generateDailyChallenges();
      }
    } else {
      generateDailyChallenges();
    }
    
    checkGlobalRank();
  }, []);

  const addXp = (amount: number) => {
    const newXp = playerXp + amount;
    let newLevel = playerLevel;
    let newXpToNextLevel = xpToNextLevel;
    
    if (newXp >= xpToNextLevel) {
      newLevel = playerLevel + 1;
      newXpToNextLevel = calculateXpToNextLevel(newLevel);
      
      localStorage.setItem("passwordPlayerLevel", newLevel.toString());
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent("passwordLevelUp", {
          detail: { level: newLevel, xp: newXp }
        });
        window.dispatchEvent(event);
      }
    }
    
    setPlayerXp(newXp);
    setPlayerLevel(newLevel);
    setXpToNextLevel(newXpToNextLevel);
    
    localStorage.setItem("passwordPlayerXp", newXp.toString());
  };

  const updateUserStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return streak;
      
      const { data: streakData, error: streakError } = await supabase
        .from("password_history")
        .select("daily_streak, last_interaction_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (streakError) {
        console.error("Error fetching streak data:", streakError);
        return streak;
      }
      
      let userStreak = streak;
      let lastDate = null;
      
      if (streakData && Array.isArray(streakData) && streakData.length > 0) {
        userStreak = streakData[0].daily_streak || 0;
        lastDate = streakData[0].last_interaction_date;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastInteraction = lastDate ? new Date(lastDate) : null;
      if (lastInteraction) {
        lastInteraction.setHours(0, 0, 0, 0);
      }
      
      const daysDiff = lastInteraction 
        ? Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
      
      let newStreak = userStreak;
      if (daysDiff === 1) {
        newStreak = userStreak + 1;
        addXp(10 * Math.min(newStreak, 10));
      } else if (daysDiff > 1) {
        newStreak = 1;
      } else if (daysDiff === 0) {
        newStreak = Math.max(userStreak, 1);
      }
      
      localStorage.setItem("passwordStreak", newStreak.toString());
      setStreak(newStreak);
      
      return newStreak;
    } catch (error) {
      console.error("Error updating streak:", error);
      return streak;
    }
  };

  const generateDailyChallenges = () => {
    const challengePool = [
      {
        id: "allCharTypes",
        title: "Character Diversity",
        description: "Create a password with uppercase, lowercase, numbers and special characters",
        xp: 50
      },
      {
        id: "highEntropy",
        title: "Entropy Expert",
        description: "Create a password with at least 80 bits of entropy",
        xp: 75
      },
      {
        id: "unhackable",
        title: "Virtually Unhackable",
        description: "Create a password that would take at least 100 years to crack",
        xp: 100
      },
      {
        id: "lengthMaster",
        title: "Length Master",
        description: "Create a password with at least 16 characters",
        xp: 50
      },
      {
        id: "uniquePattern",
        title: "Pattern Breaker",
        description: "Create a strong password with no common patterns detected",
        xp: 75
      },
      {
        id: "perfectScore",
        title: "Perfect Score",
        description: "Achieve a perfect 1.0 password strength score",
        xp: 100
      },
      {
        id: "cryptoStrong",
        title: "Cryptographically Strong",
        description: "Create a password with over 90 bits of entropy",
        xp: 80
      }
    ];
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const expiresAt = tomorrow.toISOString();
    
    const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
    const selectedChallenges = shuffled.slice(0, 3).map(challenge => ({
      ...challenge,
      completed: false,
      expiresAt: expiresAt
    }));
    
    setDailyChallenges(selectedChallenges);
    localStorage.setItem("dailyChallenges", JSON.stringify(selectedChallenges));
    localStorage.setItem("dailyChallengesDate", new Date().toDateString());
  };

  const checkGlobalRank = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: allScores, error } = await supabase
        .from("password_history")
        .select("user_id, score")
        .order("score", { ascending: false });
      
      if (error) {
        console.error("Error fetching global ranks:", error);
        return null;
      }
      
      if (!allScores || !Array.isArray(allScores)) {
        return null;
      }
      
      const userScores = new Map<string, number>();
      allScores.forEach(entry => {
        if (!entry.user_id) return;
        
        if (!userScores.has(entry.user_id) || entry.score > userScores.get(entry.user_id)!) {
          userScores.set(entry.user_id, entry.score);
        }
      });
      
      const sortedUsers = Array.from(userScores.entries())
        .sort((a, b) => b[1] - a[1]);
      
      const userIndex = sortedUsers.findIndex(entry => entry[0] === user.id);
      const rank = userIndex !== -1 ? userIndex + 1 : null;
      
      setGlobalRank(rank);
      return rank;
    } catch (error) {
      console.error("Error checking global rank:", error);
      return null;
    }
  };

  return {
    streak,
    setStreak,
    achievements, 
    setAchievements,
    questsCompleted,
    setQuestsCompleted,
    passwordsTestedCount,
    setPasswordsTestedCount,
    dailyChallenges,
    setDailyChallenges,
    playerLevel,
    playerXp,
    xpToNextLevel,
    todayCompleted,
    setTodayCompleted,
    globalRank,
    addXp,
    checkGlobalRank,
    generateDailyChallenges,
    updateUserStreak
  };
};

export default useGameProgress;
