
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import useGameProgress from "@/hooks/useGameProgress";

export const useDailyCheckin = () => {
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  const { toast } = useToast();
  const {
    streak,
    setStreak,
    achievements,
    setAchievements,
    addXp,
  } = useGameProgress();

  useEffect(() => {
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    if (lastStreakUpdate) {
      const lastUpdate = new Date(lastStreakUpdate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        setShowDailyCheckin(true);
      }
    }
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

  return {
    showDailyCheckin,
    setShowDailyCheckin,
    handleCheckIn
  };
};
