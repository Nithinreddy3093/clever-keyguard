
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Award, ArrowUp, ArrowDown, Minus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  tier: string;
  rank: number;
  change: "up" | "down" | "same";
  streak?: number;
}

const getTierColor = (tier: string): string => {
  const colors: Record<string, string> = {
    "S": "bg-purple-600 hover:bg-purple-700",
    "A": "bg-indigo-600 hover:bg-indigo-700",
    "B": "bg-blue-600 hover:bg-blue-700",
    "C": "bg-green-600 hover:bg-green-700",
    "D": "bg-yellow-600 hover:bg-yellow-700",
    "E": "bg-red-600 hover:bg-red-700"
  };
  return colors[tier] || "bg-slate-600 hover:bg-slate-700";
};

const getTierName = (tier: string): string => {
  const names: Record<string, string> = {
    "S": "Shadow Sovereign",
    "A": "Nightmare King/Queen",
    "B": "Abyssal Phantom",
    "C": "Eclipsed Knight",
    "D": "Void Walker", 
    "E": "Shadow Novice"
  };
  return names[tier] || "Unknown";
};

const LeaderboardTab = () => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRankings, setFilteredRankings] = useState<LeaderboardEntry[]>([]);
  const [previousRankings, setPreviousRankings] = useState<Map<string, number>>(new Map());
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
    
    // Set up real-time subscription for rankings updates
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

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
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
      setFilteredRankings(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierForScore = (score: number): string => {
    if (score >= 90) return "S";
    if (score >= 80) return "A";
    if (score >= 65) return "B";
    if (score >= 50) return "C";
    if (score >= 35) return "D";
    return "E";
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Password Security Leaderboard
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRankings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      {searchQuery ? "No players found with that name." : "No rankings yet. Be the first to submit your score!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRankings.map((ranking) => (
                    <TableRow 
                      key={ranking.userId}
                      className={ranking.userId === user?.id ? "bg-primary/10" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold mr-2">
                            {ranking.rank}
                          </div>
                          {ranking.change === "up" && <ArrowUp className="h-4 w-4 text-green-500" />}
                          {ranking.change === "down" && <ArrowDown className="h-4 w-4 text-red-500" />}
                          {ranking.change === "same" && <Minus className="h-4 w-4 text-slate-400" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {ranking.rank === 1 && <Crown className="h-4 w-4 mr-1 text-amber-500" />}
                          {ranking.userId === user?.id ? (
                            <span className="text-primary font-medium">You</span>
                          ) : (
                            <span>{ranking.displayName}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getTierColor(ranking.tier)} text-white`}
                          title={getTierName(ranking.tier)}
                        >
                          {ranking.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {ranking.score}
                      </TableCell>
                      <TableCell className="text-right">
                        {ranking.streak ? (
                          <div className="flex items-center justify-end">
                            <Award className="h-4 w-4 text-amber-500 mr-1" />
                            <span>{ranking.streak} days</span>
                          </div>
                        ) : (
                          <span>0 days</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardTab;
