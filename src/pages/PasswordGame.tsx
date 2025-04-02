
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, Trophy, ArrowLeft, Eye, EyeOff, Flag, 
  Zap, Target, Award, Sparkles, Gamepad2, Gift, Lock,
  Calendar, Globe, Crown, Timer, ThumbsUp 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StrengthMeter from "@/components/StrengthMeter";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import PasswordQuests from "@/components/PasswordQuests";
import SecurityDashboard from "@/components/SecurityDashboard";
import SecretAchievements from "@/components/SecretAchievements";
import crypto from "crypto-js";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface PasswordQuestData {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  xp?: number;
}

interface AchievementData {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  secret: boolean;
  icon: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
  expiresAt: string;
}

const PasswordGame = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [questsCompleted, setQuestsCompleted] = useState<PasswordQuestData[]>([]);
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
  const [streak, setStreak] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [passwordsTestedCount, setPasswordsTestedCount] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXp, setPlayerXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const storedUsername = localStorage.getItem("passwordGameUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    const storedStreak = localStorage.getItem("passwordStreak");
    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10) || 0);
    }
    
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    if (lastStreakUpdate) {
      const lastUpdate = new Date(lastStreakUpdate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Show check-in dialog if one day has passed
        setShowDailyCheckin(true);
      } else if (daysDiff > 1) {
        // Reset streak if more than one day has passed
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
    
    // Generate daily challenges
    generateDailyChallenges();
    
    // Check if today's challenges have been completed
    const lastCompletionDate = localStorage.getItem("lastDailyChallengeCompletion");
    if (lastCompletionDate) {
      const today = new Date().toDateString();
      if (lastCompletionDate === today) {
        setTodayCompleted(true);
      }
    }
    
    // Check global rank if user is logged in
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
      
      // Unlock "Streak Master" achievement at level 10
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

  const checkGlobalRank = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("password_history")
        .select("user_id, score")
        .order("score", { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get unique users with their highest score
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
        
        // Convert to array sorted by score
        const rankings = Array.from(userMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([userId], index) => ({ userId, rank: index + 1 }));
        
        // Find user's rank
        const userRanking = rankings.find(r => r.userId === user.id);
        if (userRanking) {
          setGlobalRank(userRanking.rank);
          
          // Unlock global elite achievement if ranked in top 10
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

  const generateDailyChallenges = () => {
    // Check if challenges were already generated today
    const lastGeneration = localStorage.getItem("dailyChallengesGenerated");
    const today = new Date().toDateString();
    
    if (lastGeneration === today) {
      // Challenges already generated today, load them
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
    
    // Generate new challenges
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

  const handleCheckIn = () => {
    // Increment streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("passwordStreak", newStreak.toString());
    localStorage.setItem("lastStreakUpdate", new Date().toISOString());
    
    // Add XP for checking in
    addXp(25);
    
    toast({
      title: "Daily Check-In Complete!",
      description: `You've maintained a ${newStreak}-day streak. +25 XP`,
    });
    
    // Unlock streak master achievement at 7 days
    if (newStreak >= 7 && !achievements.find(a => a.id === "streakMaster")?.unlocked) {
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
        description: "Streak Master - Maintained a 7-day streak",
      });
    }
    
    setShowDailyCheckin(false);
  };

  const handleDailyChallengeComplete = (challenge: DailyChallenge) => {
    if (challenge.completed) return;
    
    // Mark challenge as completed
    const updatedChallenges = dailyChallenges.map(c => {
      if (c.id === challenge.id) {
        return { ...c, completed: true };
      }
      return c;
    });
    
    setDailyChallenges(updatedChallenges);
    localStorage.setItem("dailyChallenges", JSON.stringify(updatedChallenges));
    
    // Add XP
    addXp(challenge.xp);
    
    // Update last completion date
    localStorage.setItem("lastDailyChallengeCompletion", new Date().toDateString());
    setTodayCompleted(true);
    
    toast({
      title: "Daily Challenge Completed!",
      description: `You've completed "${challenge.title}". +${challenge.xp} XP`,
    });
    
    // Update streak
    const lastUpdate = localStorage.getItem("lastStreakUpdate");
    if (!lastUpdate || new Date(lastUpdate).toDateString() !== new Date().toDateString()) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("passwordStreak", newStreak.toString());
      localStorage.setItem("lastStreakUpdate", new Date().toISOString());
      
      // Unlock streak master achievement at 7 days
      if (newStreak >= 7 && !achievements.find(a => a.id === "streakMaster")?.unlocked) {
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
          description: "Streak Master - Maintained a 7-day streak",
        });
      }
    }
  };
  
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("passwordGameUsername", newUsername);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value) {
      const results = analyzePassword(value);
      setAnalysis(results);
      
      const newCount = passwordsTestedCount + 1;
      setPasswordsTestedCount(newCount);
      localStorage.setItem("passwordsTestedCount", newCount.toString());
      
      if (newCount >= 10 && !achievements.find(a => a.id === "persistence")?.unlocked) {
        const updatedAchievements = achievements.map(a => {
          if (a.id === "persistence") {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        setAchievements(updatedAchievements);
        localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
        
        toast({
          title: "Achievement Unlocked!",
          description: "Persistence Pays Off - Tested 10 different passwords",
        });
      }
      
      // Check daily challenges
      if (!dailyChallenges[0].completed && results.hasUpper && results.hasLower && results.hasDigit && results.hasSpecial) {
        handleDailyChallengeComplete(dailyChallenges[0]);
      }
      
      if (!dailyChallenges[1].completed && results.entropy >= 80) {
        handleDailyChallengeComplete(dailyChallenges[1]);
      }
      
      if (!dailyChallenges[2].completed && results.hackabilityScore?.timeToHack && results.hackabilityScore.timeToHack.includes("years") && parseInt(results.hackabilityScore.timeToHack.split(" ")[0], 10) >= 100) {
        handleDailyChallengeComplete(dailyChallenges[2]);
      }
      
      if (results.achievements && results.achievements.length > 0) {
        let newAchievementsUnlocked = false;
        
        const updatedAchievements = achievements.map(achievement => {
          const matchingAchievement = results.achievements.find((a: any) => a.id === achievement.id);
          
          if (matchingAchievement && !achievement.unlocked) {
            newAchievementsUnlocked = true;
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            };
          }
          
          return achievement;
        });
        
        if (newAchievementsUnlocked) {
          setAchievements(updatedAchievements);
          localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
          
          toast({
            title: "Achievement Unlocked!",
            description: "You've earned a new achievement! Check the achievements section.",
          });
        }
      }
    } else {
      setAnalysis(null);
    }
  };

  const handleQuestComplete = (quest: any) => {
    if (questsCompleted.some(q => q.id === quest.id)) {
      return;
    }
    
    const completedQuest: PasswordQuestData = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      completed: true,
      completedAt: new Date().toISOString(),
      xp: quest.xp || 50
    };
    
    const updatedQuests = [...questsCompleted, completedQuest];
    setQuestsCompleted(updatedQuests);
    localStorage.setItem("passwordQuests", JSON.stringify(updatedQuests));
    
    // Update streak if first quest completion today
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    const today = new Date().toDateString();
    
    if (!lastStreakUpdate || new Date(lastStreakUpdate).toDateString() !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("passwordStreak", newStreak.toString());
      localStorage.setItem("lastStreakUpdate", new Date().toISOString());
      
      // Unlock streak master achievement at 7 days
      if (newStreak >= 7 && !achievements.find(a => a.id === "streakMaster")?.unlocked) {
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
          description: "Streak Master - Maintained a 7-day streak",
        });
      }
    }
    
    // Add XP
    addXp(completedQuest.xp || 50);
    
    setRewardText(`You've completed the "${quest.title}" quest and earned ${quest.xp || 50} XP!`);
    setShowReward(true);
    
    toast({
      title: "Quest Completed!",
      description: `You've completed the "${quest.title}" quest!`,
    });
  };

  const viewAchievement = (achievement: any) => {
    setSelectedAchievement(achievement);
  };

  const updateUserStreak = async () => {
    if (!user) return;
    
    try {
      // Get current streak
      const { data: streakData, error: streakError } = await supabase
        .from("password_history")
        .select("daily_streak, last_interaction_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (streakError) throw streakError;
      
      let currentStreak = 0;
      let lastDate = null;
      
      if (streakData && streakData.length > 0) {
        currentStreak = streakData[0].daily_streak || 0;
        lastDate = streakData[0].last_interaction_date;
      }
      
      // Check if last interaction was yesterday or earlier
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastInteraction = lastDate ? new Date(lastDate) : null;
      if (lastInteraction) {
        lastInteraction.setHours(0, 0, 0, 0);
      }
      
      // Calculate days difference
      const daysDiff = lastInteraction 
        ? Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
      
      // Update streak based on days difference
      let newStreak = currentStreak;
      if (daysDiff === 1) {
        // Yesterday - increment streak
        newStreak = currentStreak + 1;
      } else if (daysDiff > 1) {
        // More than a day - reset streak
        newStreak = 1;
      } else if (daysDiff === 0) {
        // Same day - no change to streak
        newStreak = Math.max(currentStreak, 1);
      }
      
      return newStreak;
      
    } catch (error) {
      console.error("Error updating streak:", error);
      return streak;
    }
  };

  const saveToSupabase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your progress",
        variant: "destructive",
      });
      return;
    }

    if (!analysis) {
      toast({
        title: "No password",
        description: "Please enter a password first",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      const passwordHash = crypto.SHA256(password).toString();
      const clampedScore = Math.min(Math.max(Math.round(analysis.score * 25), 0), 100);
      const newStreak = await updateUserStreak();
      
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: clampedScore,
        length: analysis.length,
        has_upper: analysis.hasUpper,
        has_lower: analysis.hasLower,
        has_digit: analysis.hasDigit,
        has_special: analysis.hasSpecial,
        is_common: analysis.isCommon,
        has_common_pattern: analysis.hasCommonPattern,
        entropy: analysis.entropy,
        metadata: { 
          username: username,
          quests_completed: questsCompleted.length,
          achievements_unlocked: achievements.filter(a => a.unlocked).length,
          streak: newStreak,
          player_level: playerLevel,
          player_xp: playerXp
        },
        daily_streak: newStreak,
        last_interaction_date: new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      
      setStreak(newStreak);
      localStorage.setItem("passwordStreak", newStreak.toString());
      
      toast({
        title: "Progress saved!",
        description: `Your password game progress has been saved as ${username}`,
      });
      
      // Check global rank after saving
      checkGlobalRank();
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <Button asChild variant="outline" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password Security Game
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Complete quests, earn achievements and improve your security!
          </p>
          
          {/* Player Level Info */}
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4 text-left">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">Level {playerLevel}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Shadow Protector
                </div>
              </div>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1 flex justify-between text-xs">
                <span>{playerXp} XP</span>
                <span>{xpToNextLevel} XP</span>
              </div>
              <Progress value={(playerXp / xpToNextLevel) * 100} />
              <div className="mt-1 text-xs text-center text-slate-500 dark:text-slate-400">
                {xpToNextLevel - playerXp} XP until level {playerLevel + 1}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="flex items-center bg-slate-100 dark:bg-slate-700">
              <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
              <span>{streak} day streak</span>
            </Badge>
            {globalRank && (
              <Badge variant="outline" className="flex items-center bg-slate-100 dark:bg-slate-700">
                <Trophy className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                <span>Rank #{globalRank}</span>
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center bg-slate-100 dark:bg-slate-700">
              <Target className="h-3.5 w-3.5 mr-1 text-emerald-500" />
              <span>{questsCompleted.length} quests completed</span>
            </Badge>
          </div>
        </header>
        
        {/* Daily Challenges Section */}
        <Card className="mb-6 border-none shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600">
            <CardTitle className="text-xl flex items-center text-white">
              <Calendar className="mr-2 h-5 w-5 text-white" />
              Daily Challenges
              {todayCompleted && (
                <Badge className="ml-2 bg-green-500">Completed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {dailyChallenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className={`p-4 rounded-lg border ${
                    challenge.completed 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                        {challenge.title}
                        {challenge.completed && (
                          <ThumbsUp className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {challenge.description}
                      </p>
                      <div className="mt-2 flex items-center">
                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                          +{challenge.xp} XP
                        </Badge>
                        <div className="ml-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Timer className="h-3.5 w-3.5 mr-1" />
                          Expires at midnight
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`p-2 rounded-full ${
                        challenge.completed 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        {challenge.completed 
                          ? <ThumbsUp className="h-6 w-6 text-green-500" />
                          : <Target className="h-6 w-6 text-amber-500" />
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <Link to="/rankings">
                  <Globe className="mr-2 h-4 w-4" />
                  View Global Rankings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Test Your Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                    Your Username
                  </label>
                  <Input
                    id="username"
                    placeholder="Enter your display name"
                    value={username}
                    onChange={handleUsernameChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                    Password to Test
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a password to test"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {analysis && (
                  <div className="space-y-4">
                    <StrengthMeter score={analysis.score} />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex flex-col h-full">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center mb-1">
                            <Target className="h-4 w-4 mr-1 text-blue-500" />
                            Crack Time
                          </h3>
                          <p className="text-lg font-semibold">
                            {analysis.hackabilityScore?.timeToHack || "-"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
                            Time to break your password
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex flex-col h-full">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center mb-1">
                            <Award className="h-4 w-4 mr-1 text-amber-500" />
                            Current Streak
                          </h3>
                          <p className="text-lg font-semibold">
                            {streak} days
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
                            Complete quests to maintain streak
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={saveToSupabase} 
                      className="w-full"
                    >
                      Save My Progress
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {analysis && (
            <SecurityDashboard
              passwordScore={analysis.score}
              passwordEntropy={analysis.entropy}
              hasCommonPattern={analysis.hasCommonPattern}
              isCommon={analysis.isCommon}
              hackabilityScore={analysis.hackabilityScore}
              passwordStreak={streak}
              questsCompleted={questsCompleted.length}
              totalQuests={4}
            />
          )}
        </div>
        
        {analysis && (
          <div className="space-y-6">
            <PasswordQuests
              passwordLength={analysis.length}
              hasUpper={analysis.hasUpper}
              hasLower={analysis.hasLower}
              hasDigit={analysis.hasDigit}
              hasSpecial={analysis.hasSpecial}
              entropy={analysis.entropy}
              score={analysis.score}
              onQuestComplete={handleQuestComplete}
            />
            
            <SecretAchievements
              achievements={achievements.map(achievement => ({
                ...achievement,
                icon: (() => {
                  switch (achievement.icon) {
                    case "🔐": return <Zap className="h-5 w-5 text-indigo-500" />;
                    case "🛡️": return <Shield className="h-5 w-5 text-blue-500" />;
                    case "🔡": return <Flag className="h-5 w-5 text-green-500" />;
                    case "📏": return <Target className="h-5 w-5 text-amber-500" />;
                    case "⭐": return <Sparkles className="h-5 w-5 text-purple-500" />;
                    case "🎭": return <Gift className="h-5 w-5 text-red-500" />;
                    case "🔄": return <Trophy className="h-5 w-5 text-orange-500" />;
                    case "🔥": return <Crown className="h-5 w-5 text-amber-500" />;
                    case "🌎": return <Globe className="h-5 w-5 text-indigo-500" />;
                    default: return <Award className="h-5 w-5 text-primary" />;
                  }
                })()
              }))}
              onViewAchievement={viewAchievement}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                    <Zap className="mr-2 h-5 w-5 text-amber-500" />
                    Time-to-Crack Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Beat Your Best Time
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Create a password that takes longer to crack than your previous best!
                        </p>
                        {analysis && (
                          <div className="mt-3">
                            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-600">
                              Current: {analysis.hackabilityScore?.timeToHack || "N/A"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <Target className="h-8 w-8 text-amber-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Badge className="bg-indigo-500">Challenge</Badge>
                      <p className="text-sm font-medium mt-2 text-slate-800 dark:text-slate-200">
                        Can you create a password that would take 1,000+ years to crack?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    Security Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Daily Security Habit
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Complete at least one quest every day to maintain your streak
                        </p>
                        <div className="mt-3">
                          <Badge className={streak > 0 ? "bg-green-500" : "bg-slate-400"}>
                            {streak} day{streak !== 1 ? 's' : ''} streak
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Award className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                          Maintain a 7-day streak to unlock the "Streak Master" badge!
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedAchievement?.unlocked ? (
                <Award className="h-5 w-5 mr-2 text-amber-500" />
              ) : (
                <Lock className="h-5 w-5 mr-2 text-slate-400" />
              )}
              {selectedAchievement?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAchievement?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex justify-between items-center">
              <Badge 
                variant="outline" 
                className={
                  selectedAchievement?.rarity === "common" ? "text-slate-500" :
                  selectedAchievement?.rarity === "uncommon" ? "text-green-500" :
                  selectedAchievement?.rarity === "rare" ? "text-blue-500" :
                  "text-purple-500"
                }
              >
                {selectedAchievement?.rarity.charAt(0).toUpperCase() + (selectedAchievement?.rarity.slice(1) || "")}
              </Badge>
              
              <Badge variant={selectedAchievement?.unlocked ? "default" : "outline"} className={selectedAchievement?.unlocked ? "bg-emerald-500" : ""}>
                {selectedAchievement?.unlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            
            {selectedAchievement?.unlocked && selectedAchievement.unlockedAt && (
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Unlocked on: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Quest Completed!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {rewardText}
            </p>
            <Button onClick={() => setShowReward(false)} className="w-full">
              Claim Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDailyCheckin} onOpenChange={setShowDailyCheckin}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Daily Check-In</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Welcome back! Check in to continue your streak and get a bonus!
            </p>
            <Button onClick={handleCheckIn} className="w-full">
              Check In (+25 XP)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordGame;
