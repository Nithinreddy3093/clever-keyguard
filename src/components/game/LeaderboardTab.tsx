
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LeaderboardHeader from "./leaderboard/LeaderboardHeader";
import LeaderboardTable from "./leaderboard/LeaderboardTable";
import LeaderboardLoading from "./leaderboard/LeaderboardLoading";
import { useLeaderboardData } from "./leaderboard/useLeaderboardData";
import { getTierColor, getTierName } from "./leaderboard/utils";

const LeaderboardTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRankings, setFilteredRankings] = useState<any[]>([]);
  const { rankings, loading } = useLeaderboardData();
  const { user } = useAuth();

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

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <LeaderboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
