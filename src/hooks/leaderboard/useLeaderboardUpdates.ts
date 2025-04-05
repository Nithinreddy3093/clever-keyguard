
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { LeaderboardEntry } from "@/types/leaderboard";

export const useLeaderboardUpdates = () => {
  const [updateQueued, setUpdateQueued] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousRankingsCountRef = useRef(0);
  const { toast } = useToast();

  // Debounce update notifications
  const notifyChanges = (rankings: LeaderboardEntry[]) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (rankings.length > previousRankingsCountRef.current) {
        const newPlayers = rankings.length - previousRankingsCountRef.current;
        
        toast({
          title: `${newPlayers} new challenger${newPlayers > 1 ? 's' : ''} appeared!`,
          description: "The Shadow Realm rankings have been updated with new players.",
          duration: 3000,
        });
      } else if (rankings.length === previousRankingsCountRef.current) {
        // Same number of players but rankings may have changed
        const changedRankings = rankings.filter(r => r.change !== "same");
        if (changedRankings.length > 0) {
          toast({
            title: "Rankings shifted",
            description: `${changedRankings.length} player${changedRankings.length > 1 ? 's' : ''} changed position in the Shadow Realm.`,
            duration: 2500,
          });
        }
      }
      
      previousRankingsCountRef.current = rankings.length;
      updateTimeoutRef.current = null;
    }, 500);
  };
  
  // Allow or block updates with debounce
  const queueUpdate = (callback: () => void) => {
    if (updateQueued) return;
    
    setUpdateQueued(true);
    callback();
    
    // Allow next update after a short delay
    setTimeout(() => {
      setUpdateQueued(false);
    }, 300);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifyChanges,
    queueUpdate,
    updateQueued
  };
};
