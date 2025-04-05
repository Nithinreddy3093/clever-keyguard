
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
  const [error, setError] = useState<Error | null>(null);
  const previousRankingsRef = useRef(new Map<string, number>());
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const updateQueueRef = useRef<boolean>(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);
  
  const fetchLeaderboardData = async () => {
    if (updateQueueRef.current) return; // Skip if already processing an update
    
    updateQueueRef.current = true;
    if (!initialLoadRef.current) {
      // Don't show loading state for subsequent fetches to avoid UI flicker
      setLoading(true);
    }
    
    try {
      const { data: passwordData, error } = await supabase
        .from("password_history")
        .select("user_id, score, metadata, daily_streak, password_hash")
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard data:", error);
        setError(new Error(`Failed to load leaderboard data: ${error.message}`));
        setLoading(false);
        updateQueueRef.current = false;
        return;
      }

      if (!passwordData || !Array.isArray(passwordData)) {
        setLoading(false);
        updateQueueRef.current = false;
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
      setError(null);
      initialLoadRef.current = false;
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      setError(new Error(`Failed to load leaderboard: ${error.message}`));
    } finally {
      setLoading(false);
      // Allow next update after a short delay to prevent rapid refetches
      setTimeout(() => {
        updateQueueRef.current = false;
      }, 300);
    }
  };

  // Set up subscription for real-time updates with improved debounce handling
  useEffect(() => {
    fetchLeaderboardData();
    
    // Create a channel for real-time updates
    const channel = supabase
      .channel('shadow-realm-leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'password_history'
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          
          // Use debounce pattern to avoid multiple rapid updates
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          
          updateTimeoutRef.current = setTimeout(() => {
            fetchLeaderboardData();
            
            // Only show toast for certain update types to reduce notification spam
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New challenger!",
                description: "Someone new has entered the Shadow Realm.",
                duration: 3000,
              });
            }
            updateTimeoutRef.current = null;
          }, 500);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to leaderboard updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to leaderboard updates');
          // Attempt reconnection after delay
          setTimeout(() => {
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
            fetchLeaderboardData();
          }, 5000);
        }
      });
      
    channelRef.current = channel;

    // Set up periodic refresh as a fallback
    const refreshInterval = setInterval(() => {
      fetchLeaderboardData();
    }, 60000); // Refresh every minute

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(refreshInterval);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    rankings,
    loading,
    error,
    fetchLeaderboardData
  };
};
