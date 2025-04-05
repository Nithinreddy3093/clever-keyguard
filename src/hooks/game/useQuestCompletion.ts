
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useGameProgress from "@/hooks/useGameProgress";

export const useQuestCompletion = () => {
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const { toast } = useToast();
  const {
    streak,
    setStreak,
    questsCompleted,
    setQuestsCompleted,
    achievements,
    setAchievements,
    addXp
  } = useGameProgress();

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

  return {
    showReward,
    setShowReward,
    rewardText,
    handleQuestComplete
  };
};
