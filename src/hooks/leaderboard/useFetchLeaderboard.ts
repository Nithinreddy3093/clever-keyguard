
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTierForScore } from "@/components/game/leaderboard/utils";
import { LeaderboardEntry } from "@/types/leaderboard";

export const useFetchLeaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Transform raw Supabase data into LeaderboardEntry objects
  const transformLeaderboardData = (
    passwordData: any[], 
    previousRankings: Map<string, number>
  ): LeaderboardEntry[] => {
    const userMap = new Map<string, { score: number, displayName: string, streak?: number }>();
      
    passwordData.forEach((entry) => {
      if (!entry.user_id) return;

      const metadata = (entry.metadata || {}) as any;
      const displayName = metadata.username || `User ${entry.user_id.substring(0, 4)}`;
      
      if (!userMap.has(entry.user_id)) {
        userMap.set(entry.user_id, { 
          score: entry.score, 
          displayName,
          streak: entry.daily_streak
        });
      } else {
        const current = userMap.get(entry.user_id)!;
        if (entry.score > current.score) {
          userMap.set(entry.user_id, { 
            score: entry.score, 
            displayName,
            streak: entry.daily_streak
          });
        }
      }
    });

    return Array.from(userMap.entries()).map(([userId, data], index) => {
      const rank = index + 1;
      const previousRank = previousRankings.get(userId) || rank;
      
      let change: "up" | "down" | "same" = "same";
      if (previousRank < rank) {
        change = "down";
      } else if (previousRank > rank) {
        change = "up";
      }
      
      return {
        userId,
        displayName: data.displayName,
        score: data.score,
        tier: getTierForScore(data.score),
        rank,
        change,
        streak: data.streak
      };
    });
  };

  const fetchLeaderboardData = async (
    previousRankings: Map<string, number>
  ): Promise<LeaderboardEntry[] | null> => {
    setLoading(true);
    try {
      const { data: passwordData, error } = await supabase
        .from("password_history")
        .select("user_id, score, metadata, daily_streak, password_hash")
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard data:", error);
        setError(new Error(`Failed to load leaderboard data: ${error.message}`));
        return null;
      }

      if (!passwordData || !Array.isArray(passwordData)) {
        return null;
      }

      return transformLeaderboardData(passwordData, previousRankings);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      setError(new Error(`Failed to load leaderboard: ${error.message}`));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchLeaderboardData,
    loading,
    error,
  };
};
