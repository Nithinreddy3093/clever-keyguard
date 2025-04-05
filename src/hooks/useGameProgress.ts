
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
  completed: boolean;
  xp: number;
  expiresAt: string;
}

const useGameProgress = () => {
  // State management
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [questsCompleted, setQuestsCompleted] = useState<any[]>([]);
  const [passwordsTestedCount, setPasswordsTestedCount] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  
  // XP and level calculations
  const [xp, setXp] = useState(0);
  const BASE_XP_PER_LEVEL = 100;
  const XP_MULTIPLIER = 1.5;
  
  // Computed properties
  const playerLevel = Math.floor(1 + Math.log(1 + xp / BASE_XP_PER_LEVEL) / Math.log(XP_MULTIPLIER));
  const playerXp = xp;
  const xpToNextLevel = Math.ceil(BASE_XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, playerLevel) - xp);

  // Initialize data from localStorage
  useEffect(() => {
    // Load streak
    const savedStreak = localStorage.getItem("passwordStreak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
    
    // Load achievements
    const savedAchievements = localStorage.getItem("passwordAchievements");
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      // Default achievements
      const defaultAchievements: AchievementData[] = [
        {
          id: "firstPassword",
          title: "First Steps",
          description: "Test your first password",
          icon: "🔐",
          unlocked: false,
          rarity: "common"
        },
        {
          id: "strongPassword",
          title: "Fort Knox",
          description: "Create an extremely strong password",
          icon: "🛡️",
          unlocked: false,
          rarity: "uncommon"
        },
        {
          id: "streakMaster",
          title: "Streak Master",
          description: "Maintain a 7-day streak",
          icon: "🔥",
          unlocked: false,
          rarity: "rare"
        },
        {
          id: "persistence",
          title: "Persistence Pays Off",
          description: "Test 10 different passwords",
          icon: "🧩",
          unlocked: false,
          rarity: "common"
        },
        {
          id: "entropyMaster",
          title: "Entropy Master",
          description: "Create a password with 80+ bits of entropy",
          icon: "🌀",
          unlocked: false,
          secret: true,
          rarity: "legendary"
        }
      ];
      
      setAchievements(defaultAchievements);
      localStorage.setItem("passwordAchievements", JSON.stringify(defaultAchievements));
    }
    
    // Load quests
    const savedQuests = localStorage.getItem("passwordQuests");
    if (savedQuests) {
      setQuestsCompleted(JSON.parse(savedQuests));
    }
    
    // Load passwords tested count
    const savedCount = localStorage.getItem("passwordsTestedCount");
    if (savedCount) {
      setPasswordsTestedCount(parseInt(savedCount, 10));
    }
    
    // Load XP
    const savedXp = localStorage.getItem("passwordXp");
    if (savedXp) {
      setXp(parseInt(savedXp, 10));
    }
    
    // Check if today's challenge was completed
    const lastCompletion = localStorage.getItem("lastDailyChallengeCompletion");
    if (lastCompletion && lastCompletion === new Date().toDateString()) {
      setTodayCompleted(true);
    }
    
    // Check global rank
    checkGlobalRank();
  }, []);
  
  // Add XP and update level
  const addXp = (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem("passwordXp", newXp.toString());
    
    const newLevel = Math.floor(1 + Math.log(1 + newXp / BASE_XP_PER_LEVEL) / Math.log(XP_MULTIPLIER));
    const oldLevel = Math.floor(1 + Math.log(1 + xp / BASE_XP_PER_LEVEL) / Math.log(XP_MULTIPLIER));
    
    if (newLevel > oldLevel) {
      console.log(`Leveled up to ${newLevel}!`);
      // Could add a level-up notification or reward here
    }
  };
  
  // Check global leaderboard rank
  const checkGlobalRank = async () => {
    try {
      // This would normally be a database call
      // For now we'll simulate a random rank between 1-100
      const simulatedRank = Math.floor(Math.random() * 100) + 1;
      setGlobalRank(simulatedRank);
    } catch (error) {
      console.error("Error checking global rank:", error);
      setGlobalRank(null);
    }
  };
  
  // Generate daily challenges
  const generateDailyChallenges = () => {
    const today = new Date();
    const midnight = new Date(today);
    midnight.setHours(23, 59, 59, 999);

    const expiresAt = midnight.toISOString();
    
    // Check if we already have challenges for today
    const savedChallenges = localStorage.getItem("dailyChallenges");
    if (savedChallenges) {
      const parsedChallenges = JSON.parse(savedChallenges);
      const isToday = new Date(parsedChallenges[0]?.expiresAt).toDateString() === today.toDateString();
      
      if (isToday) {
        setDailyChallenges(parsedChallenges);
        return;
      }
    }
    
    // Generate new challenges
    const newChallenges: DailyChallenge[] = [
      {
        id: "complex",
        title: "Complex Password",
        description: "Create a password with uppercase, lowercase, numbers, and special characters.",
        completed: false,
        xp: 20,
        expiresAt
      },
      {
        id: "entropy",
        title: "High Entropy",
        description: "Create a password with at least 80 bits of entropy.",
        completed: false,
        xp: 30,
        expiresAt
      },
      {
        id: "uncrackable",
        title: "Practically Uncrackable",
        description: "Create a password that would take 100+ years to crack.",
        completed: false,
        xp: 50,
        expiresAt
      }
    ];
    
    setDailyChallenges(newChallenges);
    localStorage.setItem("dailyChallenges", JSON.stringify(newChallenges));
  };
  
  // Update user streak
  const updateUserStreak = async () => {
    try {
      const lastUpdate = localStorage.getItem("lastStreakUpdate");
      const now = new Date();
      const today = now.toDateString();
      
      // If no last update or it wasn't today, increment streak
      if (!lastUpdate || new Date(lastUpdate).toDateString() !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("passwordStreak", newStreak.toString());
        localStorage.setItem("lastStreakUpdate", now.toISOString());
        return newStreak;
      }
      
      return streak;
    } catch (error) {
      console.error("Error updating streak:", error);
      return streak;
    }
  };

  // Handle daily challenge completion
  const handleDailyChallengeComplete = (challenge: DailyChallenge) => {
    if (challenge.completed) return;
    
    const updatedChallenges = dailyChallenges.map(c => {
      if (c.id === challenge.id) {
        return { ...c, completed: true };
      }
      return c;
    });
    
    setDailyChallenges(updatedChallenges);
    localStorage.setItem("dailyChallenges", JSON.stringify(updatedChallenges));
    
    addXp(challenge.xp);
    
    localStorage.setItem("lastDailyChallengeCompletion", new Date().toDateString());
    setTodayCompleted(true);
    
    const lastUpdate = localStorage.getItem("lastStreakUpdate");
    if (!lastUpdate || new Date(lastUpdate).toDateString() !== new Date().toDateString()) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("passwordStreak", newStreak.toString());
      localStorage.setItem("lastStreakUpdate", new Date().toISOString());
      
      if (newStreak >= 7 && !achievements.find(a => a.id === "streakMaster")?.unlocked) {
        const updatedAchievements = achievements.map(a => {
          if (a.id === "streakMaster") {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        setAchievements(updatedAchievements);
        localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
      }
    }
  };
  
  return {
    streak, setStreak,
    achievements, setAchievements,
    questsCompleted, setQuestsCompleted,
    passwordsTestedCount, setPasswordsTestedCount,
    dailyChallenges, setDailyChallenges,
    playerLevel,
    playerXp,
    xpToNextLevel,
    todayCompleted, setTodayCompleted,
    globalRank,
    addXp,
    checkGlobalRank,
    generateDailyChallenges,
    updateUserStreak,
    handleDailyChallengeComplete
  };
};

export default useGameProgress;
