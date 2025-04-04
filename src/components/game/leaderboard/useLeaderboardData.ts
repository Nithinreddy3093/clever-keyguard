
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTierForScore } from "./utils";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  tier: string;
  rank: number;
  change: "up" | "down" | "same";
  streak?: number;
}

export const useLeaderboardData = () => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousRankings, setPreviousRankings] = useState<Map<string, number>>(new Map());
  
  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const { data: passwordData, error } = await supabase
        .from("password_history")
        .select("user_id, score, metadata, daily_streak, password_hash")
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard data:", error);
        setLoading(false);
        return;
      }

      if (!passwordData || !Array.isArray(passwordData)) {
        setLoading(false);
        return;
      }

      // Create a map of previous rankings to track changes
      const newPreviousRankings = new Map<string, number>();
      rankings.forEach((entry, index) => {
        newPreviousRankings.set(entry.userId, index + 1);
      });
      
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

      const leaderboardData = Array.from(userMap.entries()).map(([userId, data], index) => {
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

      setPreviousRankings(newPreviousRankings);
      setRankings(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set up subscription for real-time updates
  useEffect(() => {
    fetchLeaderboardData();
    
    const channel = supabase
      .channel('public:password_history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'password_history'
        },
        () => {
          fetchLeaderboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    rankings,
    loading,
    fetchLeaderboardData
  };
};
