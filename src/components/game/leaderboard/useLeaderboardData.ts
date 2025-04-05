
import { useState, useEffect, useRef } from "react";
import { useFetchLeaderboard } from "@/hooks/leaderboard/useFetchLeaderboard";
import { useLeaderboardSubscription } from "@/hooks/leaderboard/useLeaderboardSubscription";
import { useLeaderboardUpdates } from "@/hooks/leaderboard/useLeaderboardUpdates";
import { LeaderboardEntry } from "@/types/leaderboard";

export { LeaderboardEntry } from "@/types/leaderboard";

export const useLeaderboardData = () => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const previousRankingsRef = useRef(new Map<string, number>());
  const initialLoadRef = useRef(true);
  
  const { fetchLeaderboardData, loading, error } = useFetchLeaderboard();
  const { notifyChanges, queueUpdate } = useLeaderboardUpdates();
  
  // Create fetch handler for subscription
  const handleUpdate = async () => {
    queueUpdate(async () => {
      const data = await fetchLeaderboardData(previousRankingsRef.current);
      
      if (data) {
        // Update previous rankings map
        const previousRankings = new Map<string, number>();
        data.forEach((entry) => {
          previousRankings.set(entry.userId, entry.rank);
        });
        previousRankingsRef.current = previousRankings;
        
        setRankings(data);
        
        if (!initialLoadRef.current) {
          notifyChanges(data);
        } else {
          initialLoadRef.current = false;
        }
      }
    });
  };
  
  // Setup subscription with update handler
  const { subscriptionStatus, reconnect } = useLeaderboardSubscription(handleUpdate);

  // Initial data fetch
  useEffect(() => {
    handleUpdate();
    
    // Set up periodic refresh as a fallback
    const refreshInterval = setInterval(() => {
      handleUpdate();
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  return {
    rankings,
    loading,
    error,
    fetchLeaderboardData: handleUpdate,
    subscriptionStatus,
    reconnect
  };
};
