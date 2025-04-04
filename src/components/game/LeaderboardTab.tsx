
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LeaderboardHeader from "./leaderboard/LeaderboardHeader";
import LeaderboardTable from "./leaderboard/LeaderboardTable";
import LeaderboardLoading from "./leaderboard/LeaderboardLoading";
import { useLeaderboardData } from "./leaderboard/useLeaderboardData";
import { getTierColor, getTierName, getGlowColor } from "./leaderboard/utils";
import { useToast } from "@/hooks/use-toast";

const LeaderboardTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRankings, setFilteredRankings] = useState<any[]>([]);
  const { rankings, loading, fetchLeaderboardData } = useLeaderboardData();
  const { user } = useAuth();
  const { toast } = useToast();
  const isInitialLoad = useRef(true);
  const previousRankingsCount = useRef(0);
  
  // Real-time update notification
  useEffect(() => {
    if (!loading && rankings.length > 0 && !isInitialLoad.current) {
      // Only show toast after initial load when rankings update
      if (rankings.length > previousRankingsCount.current) {
        toast({
          title: "New challenger appeared!",
          description: "Someone new has joined the Shadow Realm rankings.",
          duration: 3000,
        });
      } else {
        // Rankings changed but not a new player
        toast({
          title: "Rankings updated",
          description: "The Shadow Realm rankings have been updated.",
          duration: 2000,
        });
      }
    }
    
    if (!loading) {
      isInitialLoad.current = false;
      previousRankingsCount.current = rankings.length;
    }
  }, [rankings, loading, toast]);

  // Filter rankings when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRankings(rankings);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = rankings.filter(entry => 
      entry.displayName.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredRankings(filtered);
  }, [searchQuery, rankings]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchLeaderboardData();
    toast({
      title: "Refreshing rankings",
      description: "Getting the latest shadow realm data...",
      duration: 2000,
    });
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      
      <LeaderboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={handleRefresh}
      />
      
      <CardContent>
        {loading ? (
          <LeaderboardLoading />
        ) : (
          <LeaderboardTable 
            filteredRankings={filteredRankings}
            currentUser={user}
            searchQuery={searchQuery}
            getTierColor={getTierColor}
            getTierName={getTierName}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardTab;
