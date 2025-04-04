
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTierForScore } from "./utils";
import { useToast } from "@/hooks/use-toast";

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
  const previousRankingsRef = useRef(new Map<string, number>());
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  
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
      const previousRankings = new Map<string, number>();
      rankings.forEach((entry) => {
        previousRankings.set(entry.userId, entry.rank);
      });
      previousRankingsRef.current = previousRankings;
      
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
    
    // Create a channel for real-time updates
    const channel = supabase
      .channel('public:password_history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'password_history'
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchLeaderboardData();
          
          // Show toast notification for updates
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New player joined!",
              description: "Someone new has entered the Shadow Realm.",
              duration: 3000,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Rankings updated",
              description: "A player's score has changed.",
              duration: 2000,
            });
          }
        }
      )
      .subscribe();
      
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    rankings,
    loading,
    fetchLeaderboardData
  };
};
