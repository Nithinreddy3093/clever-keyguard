
import { useState } from "react";
import { analyzePassword } from "@/lib/passwordAnalyzer"; // Keep using the compatibility export
import { useToast } from "@/hooks/use-toast";
import useGameProgress from "@/hooks/useGameProgress";

export const usePasswordAnalysis = () => {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const {
    passwordsTestedCount,
    setPasswordsTestedCount,
    achievements,
    setAchievements,
    dailyChallenges,
    handleDailyChallengeComplete
  } = useGameProgress();

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

  return {
    password,
    analysis,
    handlePasswordChange
  };
};
