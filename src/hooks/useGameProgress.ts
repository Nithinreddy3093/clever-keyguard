
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PasswordQuestData {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  xp?: number;
}

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  secret: boolean;
  icon: string;
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
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<AchievementData[]>([
    {
      id: "cryptographer",
      title: "The Cryptographer",
      description: "Created a password with 100+ bits of entropy",
      unlocked: false,
      rarity: "rare",
      secret: false,
      icon: "🔐"
    },
    {
      id: "hackersNightmare",
      title: "Hacker's Nightmare",
      description: "Generated a password unbreakable for 1,000+ years",
      unlocked: false,
      rarity: "legendary",
      secret: false,
      icon: "🛡️"
    },
    {
      id: "diversityChamp",
      title: "Diversity Champion",
      description: "Used all four character types in one password",
      unlocked: false,
      rarity: "uncommon",
      secret: false,
      icon: "🔡"
    },
    {
      id: "marathonRunner",
      title: "Marathon Runner",
      description: "Created a password with 20+ characters",
      unlocked: false,
      rarity: "uncommon",
      secret: false,
      icon: "📏"
    },
    {
      id: "perfectScore",
      title: "Perfect Score",
      description: "Achieved the maximum password security score",
      unlocked: false,
      rarity: "rare",
      secret: false,
      icon: "⭐"
    },
    {
      id: "thinkOutside",
      title: "Think Outside The Box",
      description: "Created a password with unexpected patterns",
      unlocked: false,
      rarity: "rare",
      secret: true,
      icon: "🎭"
    },
    {
      id: "persistence",
      title: "Persistence Pays Off",
      description: "Tested 10 different passwords in one session",
      unlocked: false,
      rarity: "common",
      secret: true,
      icon: "🔄"
    },
    {
      id: "streakMaster",
      title: "Streak Master",
      description: "Maintained a 7-day password testing streak",
      unlocked: false,
      rarity: "rare",
      secret: false,
      icon: "🔥"
    },
    {
      id: "globalElite",
      title: "Global Elite",
      description: "Ranked in the top 10 on the global leaderboard",
      unlocked: false,
      rarity: "legendary",
      secret: true,
      icon: "🌎"
    }
  ]);
  const [questsCompleted, setQuestsCompleted] = useState<PasswordQuestData[]>([]);
  const [passwordsTestedCount, setPasswordsTestedCount] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXp, setPlayerXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const storedStreak = localStorage.getItem("passwordStreak");
    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10) || 0);
    }
    
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    if (lastStreakUpdate) {
      const lastUpdate = new Date(lastStreakUpdate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        setStreak(0);
        localStorage.setItem("passwordStreak", "0");
      }
    }
    
    const storedAchievements = localStorage.getItem("passwordAchievements");
    if (storedAchievements) {
      try {
        const parsedAchievements = JSON.parse(storedAchievements);
        setAchievements(state => {
          return state.map(achievement => {
            const storedAchievement = parsedAchievements.find((a: any) => a.id === achievement.id);
            if (storedAchievement) {
              return { ...achievement, ...storedAchievement };
            }
            return achievement;
          });
        });
      } catch (e) {
        console.error("Failed to parse stored achievements", e);
      }
    }
    
    const storedQuests = localStorage.getItem("passwordQuests");
    if (storedQuests) {
      try {
        const parsedQuests = JSON.parse(storedQuests);
        setQuestsCompleted(parsedQuests);
      } catch (e) {
        console.error("Failed to parse stored quests", e);
      }
    }
    
    const storedCount = localStorage.getItem("passwordsTestedCount");
    if (storedCount) {
      setPasswordsTestedCount(parseInt(storedCount, 10) || 0);
    }
    
    const storedLevel = localStorage.getItem("playerLevel");
    if (storedLevel) {
      setPlayerLevel(parseInt(storedLevel, 10) || 1);
    }
    
    const storedXp = localStorage.getItem("playerXp");
    if (storedXp) {
      setPlayerXp(parseInt(storedXp, 10) || 0);
    }
    
    const lastCompletionDate = localStorage.getItem("lastDailyChallengeCompletion");
    if (lastCompletionDate) {
      const today = new Date().toDateString();
      if (lastCompletionDate === today) {
        setTodayCompleted(true);
      }
    }
    
    if (user) {
      checkGlobalRank();
    }
  }, [user]);

  const calculateXpToNextLevel = (level: number) => {
    return Math.round(100 * Math.pow(1.5, level - 1));
  };

  const addXp = (amount: number) => {
    const newXp = playerXp + amount;
    let newLevel = playerLevel;
    let newXpToNextLevel = xpToNextLevel;
    
    if (newXp >= xpToNextLevel) {
      newLevel++;
      newXpToNextLevel = calculateXpToNextLevel(newLevel);
      
      toast({
        title: "Level Up!",
        description: `You've reached level ${newLevel}!`,
      });
      
      if (newLevel >= 10 && !achievements.find(a => a.id === "streakMaster")?.unlocked) {
        const updatedAchievements = achievements.map(a => {
          if (a.id === "streakMaster") {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        setAchievements(updatedAchievements);
        localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
        
        toast({
          title: "Achievement Unlocked!",
          description: "Streak Master - Reached level 10",
        });
      }
    }
    
    setPlayerXp(newXp);
    setPlayerLevel(newLevel);
    setXpToNextLevel(newXpToNextLevel);
    
    localStorage.setItem("playerXp", newXp.toString());
    localStorage.setItem("playerLevel", newLevel.toString());
  };

  const generateDailyChallenges = () => {
    const lastGeneration = localStorage.getItem("dailyChallengesGenerated");
    const today = new Date().toDateString();
    
    if (lastGeneration === today) {
      const storedChallenges = localStorage.getItem("dailyChallenges");
      if (storedChallenges) {
        try {
          const parsedChallenges = JSON.parse(storedChallenges);
          setDailyChallenges(parsedChallenges);
          return;
        } catch (e) {
          console.error("Failed to parse stored daily challenges", e);
        }
      }
    }
    
    const challenges: DailyChallenge[] = [
      {
        id: "daily1",
        title: "Character Diversity",
        description: "Create a password with uppercase, lowercase, numbers and special characters",
        completed: false,
        xp: 50,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      },
      {
        id: "daily2",
        title: "Entropy Master",
        description: "Create a password with at least 80 bits of entropy",
        completed: false,
        xp: 75,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      },
      {
        id: "daily3",
        title: "Crack Resistant",
        description: "Create a password that would take at least 100 years to crack",
        completed: false,
        xp: 100,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      }
    ];
    
    setDailyChallenges(challenges);
    localStorage.setItem("dailyChallenges", JSON.stringify(challenges));
    localStorage.setItem("dailyChallengesGenerated", today);
  };

  const checkGlobalRank = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("password_history")
        .select("user_id, score")
        .order("score", { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const userMap = new Map<string, number>();
        
        data.forEach((entry) => {
          if (!entry.user_id) return;
          
          if (!userMap.has(entry.user_id)) {
            userMap.set(entry.user_id, entry.score);
          } else {
            const currentScore = userMap.get(entry.user_id) || 0;
            if (entry.score > currentScore) {
              userMap.set(entry.user_id, entry.score);
            }
          }
        });
        
        const rankings = Array.from(userMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([userId], index) => ({ userId, rank: index + 1 }));
        
        const userRanking = rankings.find(r => r.userId === user.id);
        if (userRanking) {
          setGlobalRank(userRanking.rank);
          
          if (userRanking.rank <= 10 && !achievements.find(a => a.id === "globalElite")?.unlocked) {
            const updatedAchievements = achievements.map(a => {
              if (a.id === "globalElite") {
                return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
              }
              return a;
            });
            setAchievements(updatedAchievements);
            localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
            
            toast({
              title: "Achievement Unlocked!",
              description: "Global Elite - Ranked in the top 10",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking global rank:", error);
    }
  };

  const updateUserStreak = async () => {
    if (!user) return;
    
    try {
      const { data: streakData, error: streakError } = await supabase
        .from("password_history")
        .select("daily_streak, last_interaction_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (streakError) {
        console.error("Error updating streak:", streakError);
        return streak;
      }
      
      let currentStreak = 0;
      let lastDate = null;
      
      if (streakData && Array.isArray(streakData) && streakData.length > 0) {
        currentStreak = streakData[0].daily_streak || 0;
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
      
      let newStreak = currentStreak;
      if (daysDiff === 1) {
        newStreak = currentStreak + 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      } else if (daysDiff === 0) {
        newStreak = Math.max(currentStreak, 1);
      }
      
      return newStreak;
      
    } catch (error) {
      console.error("Error updating streak:", error);
      return streak;
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
    setPlayerLevel,
    playerXp,
    setPlayerXp,
    xpToNextLevel,
    setXpToNextLevel,
    todayCompleted,
    setTodayCompleted,
    globalRank,
    setGlobalRank,
    addXp,
    checkGlobalRank,
    generateDailyChallenges,
    updateUserStreak,
    calculateXpToNextLevel,
  };
};

export default useGameProgress;
