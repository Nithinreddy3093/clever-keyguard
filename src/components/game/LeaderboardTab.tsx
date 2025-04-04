
import { useState, useEffect } from "react";
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

  // Real-time update notification
  useEffect(() => {
    // Only show toast when rankings update after initial load
    let isInitialLoad = true;
    
    return () => { isInitialLoad = false; };
  }, []);

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

  // Show notification when new players join (except on initial load)
  useEffect(() => {
    let lastCount = 0;
    
    if (rankings.length > 0 && lastCount > 0 && rankings.length > lastCount) {
      toast({
        title: "New challenger appeared!",
        description: "Someone new has joined the Shadow Realm rankings.",
        duration: 3000,
      });
    }
    
    lastCount = rankings.length;
  }, [rankings.length, toast]);

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
