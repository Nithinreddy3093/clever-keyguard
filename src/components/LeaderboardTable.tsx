
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { User, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type RankTier = "S" | "A" | "B" | "C" | "D" | "E";

export interface UserRanking {
  userId: string;
  displayName: string;
  score: number;
  tier: RankTier;
  rank: number;
  change: "up" | "down" | "same";
  streak?: number;
}

interface LeaderboardTableProps {
  initialRankings: UserRanking[];
  onRankingsChange?: (rankings: UserRanking[]) => void;
}

export const getTierForScore = (score: number): RankTier => {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
};

export const getTierName = (tier: RankTier): string => {
  const names: Record<RankTier, string> = {
    "S": "Shadow Sovereign",
    "A": "Nightmare King/Queen",
    "B": "Abyssal Phantom",
    "C": "Eclipsed Knight",
    "D": "Void Walker", 
    "E": "Shadow Novice"
  };
  return names[tier];
};

export const getTierColor = (tier: RankTier): string => {
  const colors: Record<RankTier, string> = {
    "S": "bg-purple-600 hover:bg-purple-700",
    "A": "bg-indigo-600 hover:bg-indigo-700",
    "B": "bg-blue-600 hover:bg-blue-700",
    "C": "bg-green-600 hover:bg-green-700",
    "D": "bg-yellow-600 hover:bg-yellow-700",
    "E": "bg-red-600 hover:bg-red-700"
  };
  return colors[tier];
};

const LeaderboardTable = ({ initialRankings, onRankingsChange }: LeaderboardTableProps) => {
  const [rankings, setRankings] = useState<UserRanking[]>(initialRankings);
  const { user } = useAuth();

  useEffect(() => {
    // Set initial rankings
    setRankings(initialRankings);
  }, [initialRankings]);

  // Setup realtime subscription
  useEffect(() => {
    // Subscribe to real-time updates
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
          // When data changes, fetch the latest rankings
          fetchLatestRankings();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch latest rankings when data changes
  const fetchLatestRankings = async () => {
    try {
      const { data: passwordData, error } = await supabase
        .from("password_history")
        .select("user_id, score, metadata, daily_streak")
        .order("score", { ascending: false });

      if (error) throw error;

      if (!passwordData) {
        return;
      }

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

      // Create a copy of current rankings to calculate changes
      const oldRankingsMap = new Map(
        rankings.map(ranking => [ranking.userId, ranking])
      );

      const newRankings = Array.from(userMap.entries()).map(([userId, data], index) => {
        const oldRanking = oldRankingsMap.get(userId);
        let change: "up" | "down" | "same" = "same";
        
        if (oldRanking) {
          if (index + 1 < oldRanking.rank) {
            change = "up";
          } else if (index + 1 > oldRanking.rank) {
            change = "down";
          }
        }
        
        return {
          userId,
          displayName: data.displayName,
          score: data.score,
          tier: getTierForScore(data.score),
          rank: index + 1,
          change,
          streak: data.streak
        };
      });

      setRankings(newRankings);
      if (onRankingsChange) {
        onRankingsChange(newRankings);
      }
    } catch (error) {
      console.error("Error fetching real-time rankings:", error);
    }
  };

  return (
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
          {rankings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No rankings yet. Be the first to submit your score!
              </TableCell>
            </TableRow>
          ) : (
            rankings.map((ranking) => (
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
                    {ranking.userId === user?.id ? (
                      <span className="text-primary font-medium">You</span>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-1 opacity-70" />
                        {ranking.displayName}
                      </>
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
                  {ranking.streak || 0} days
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
