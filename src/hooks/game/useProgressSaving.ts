
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import crypto from "crypto-js";
import useGameProgress from "@/hooks/useGameProgress";

export const useProgressSaving = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    playerLevel,
    playerXp,
    achievements,
    questsCompleted,
    updateUserStreak,
    checkGlobalRank
  } = useGameProgress();

  const saveToSupabase = async (username: string, password: string, analysis: any) => {
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

  return { saveToSupabase };
};
