import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import crypto from "crypto-js";
import useGameProgress from "@/hooks/useGameProgress";
import GameTabs from "@/components/game/GameTabs";
import GameDialogs from "@/components/game/GameDialogs";

const PasswordGame = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const gameProgress = useGameProgress();
  
  const {
    streak, setStreak,
    achievements, setAchievements,
    questsCompleted, setQuestsCompleted,
    passwordsTestedCount, setPasswordsTestedCount,
    dailyChallenges, setDailyChallenges,
    playerLevel, playerXp, xpToNextLevel,
    todayCompleted, setTodayCompleted,
    globalRank,
    addXp, checkGlobalRank, generateDailyChallenges,
    updateUserStreak
  } = gameProgress;

  useEffect(() => {
    const storedUsername = localStorage.getItem("passwordGameUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    if (lastStreakUpdate) {
      const lastUpdate = new Date(lastStreakUpdate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        setShowDailyCheckin(true);
      }
    }
    
    generateDailyChallenges();
  }, []);

  const handleCheckIn = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("passwordStreak", newStreak.toString());
    localStorage.setItem("lastStreakUpdate", new Date().toISOString());
    
    addXp(25);
    
    toast({
      title: "Daily Check-In Complete!",
      description: `You've maintained a ${newStreak}-day streak. +25 XP`,
    });
    
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

  const handleDailyChallengeComplete = (challenge: any) => {
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
    
    toast({
      title: "Daily Challenge Completed!",
      description: `You've completed "${challenge.title}". +${challenge.xp} XP`,
    });
    
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
      
      if (!dailyChallenges[0]?.completed && results.hasUpper && results.hasLower && results.hasDigit && results.hasSpecial) {
        handleDailyChallengeComplete(dailyChallenges[0]);
      }
      
      if (!dailyChallenges[1]?.completed && results.entropy >= 80) {
        handleDailyChallengeComplete(dailyChallenges[1]);
      }
      
      if (!dailyChallenges[2]?.completed && results.hackabilityScore?.timeToHack && results.hackabilityScore.timeToHack.includes("years") && parseInt(results.hackabilityScore.timeToHack.split(" ")[0], 10) >= 100) {
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
    
    const completedQuest = {
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
    
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    const today = new Date().toDateString();
    
    if (!lastStreakUpdate || new Date(lastStreakUpdate).toDateString() !== today) {
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
        
        toast({
          title: "Achievement Unlocked!",
          description: "Streak Master - Maintained a 7-day streak",
        });
      }
    }
    
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
        </header>
        
        <GameTabs
          username={username}
          onUsernameChange={handleUsernameChange}
          password={password}
          onPasswordChange={handlePasswordChange}
          analysis={analysis}
          streak={streak}
          onSaveProgress={saveToSupabase}
          onChallengeComplete={handleDailyChallengeComplete}
          dailyChallenges={dailyChallenges}
          todayCompleted={todayCompleted}
          playerLevel={playerLevel}
          playerXp={playerXp}
          xpToNextLevel={xpToNextLevel}
          globalRank={globalRank}
          questsCompleted={questsCompleted}
          onQuestComplete={handleQuestComplete}
          achievements={achievements}
          onViewAchievement={viewAchievement}
        />
      </div>
      
      <GameDialogs 
        selectedAchievement={selectedAchievement}
        setSelectedAchievement={setSelectedAchievement}
        showReward={showReward}
        setShowReward={setShowReward}
        rewardText={rewardText}
        showDailyCheckin={showDailyCheckin}
        setShowDailyCheckin={setShowDailyCheckin}
        handleCheckIn={handleCheckIn}
      />
    </div>
  );
};

export default PasswordGame;
