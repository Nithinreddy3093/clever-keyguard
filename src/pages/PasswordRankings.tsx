
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Trophy, ArrowUp, ArrowDown, Minus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Define types for user ranking data
type RankTier = "S" | "A" | "B" | "C" | "D" | "E";

interface UserRanking {
  userId: string;
  displayName: string;
  score: number;
  tier: RankTier;
  rank: number;
  change?: "up" | "down" | "same";
}

const getTierForScore = (score: number): RankTier => {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
};

const getTierName = (tier: RankTier): string => {
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

const getTierColor = (tier: RankTier): string => {
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

const PasswordRankings = () => {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        // Get password history data which includes user_id and scores
        const { data: passwordData, error: passwordError } = await supabase
          .from("password_history")
          .select("user_id, score");

        if (passwordError) throw passwordError;

        // Process the rankings
        const userScores: Record<string, number[]> = {};
        
        // Group scores by user
        passwordData.forEach((entry) => {
          if (!userScores[entry.user_id]) {
            userScores[entry.user_id] = [];
          }
          userScores[entry.user_id].push(entry.score);
        });
        
        // Calculate average scores and create rankings
        const rankingsData: UserRanking[] = [];
        
        Object.entries(userScores).forEach(([userId, scores]) => {
          // Find the max score for each user
          const maxScore = Math.max(...scores);
          
          // Generate an anonymous display name based on user ID
          const displayName = userId ? `User ${userId.substring(0, 4)}` : "Anonymous";
          
          rankingsData.push({
            userId,
            displayName,
            score: maxScore,
            tier: getTierForScore(maxScore),
            rank: 0, // Will be calculated later
            change: "same" // Default value
          });
        });
        
        // Sort by score descending
        rankingsData.sort((a, b) => b.score - a.score);
        
        // Assign ranks
        rankingsData.forEach((ranking, index) => {
          ranking.rank = index + 1;
        });
        
        setRankings(rankingsData);
      } catch (error: any) {
        console.error("Error fetching rankings:", error);
        toast({
          title: "Error",
          description: "Failed to load rankings data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [toast]);

  const getUserRank = () => {
    if (!user) return null;
    return rankings.find(r => r.userId === user.id);
  };

  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Shadow Tier Rankings
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            See how your password strength compares to others
          </p>
        </header>

        {userRank && (
          <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Your Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-lg font-bold">
                      {userRank.rank}
                    </div>
                    <Badge className={`absolute -top-2 -right-2 ${getTierColor(userRank.tier)}`}>
                      {userRank.tier}
                    </Badge>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-slate-900 dark:text-white">You</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getTierName(userRank.tier)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{userRank.score}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Password Strength</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              Global Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {rankings.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No rankings data available yet. Be the first to submit a password!
                  </p>
                ) : (
                  rankings.map((ranking, index) => (
                    <div 
                      key={ranking.userId}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        ranking.userId === user?.id 
                          ? "bg-primary/10 dark:bg-primary/20" 
                          : "bg-slate-50 dark:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold">
                            {ranking.rank}
                          </div>
                          <Badge className={`absolute -top-2 -right-2 ${getTierColor(ranking.tier)}`}>
                            {ranking.tier}
                          </Badge>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {ranking.userId === user?.id ? (
                                <span>You</span>
                              ) : (
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {ranking.displayName}
                                </span>
                              )}
                            </p>
                            {ranking.change === "up" && (
                              <ArrowUp className="ml-2 h-4 w-4 text-green-500" />
                            )}
                            {ranking.change === "down" && (
                              <ArrowDown className="ml-2 h-4 w-4 text-red-500" />
                            )}
                            {ranking.change === "same" && (
                              <Minus className="ml-2 h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {getTierName(ranking.tier)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{ranking.score}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Password Strength</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            Shadow Tier System
          </h2>
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Badge className={getTierColor("S")}>S</Badge>
              <div className="ml-4">
                <p className="font-bold text-slate-900 dark:text-white">Shadow Sovereign (90-100)</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  A password that is virtually impossible to crack. It's long, complex, contains a mix of
                  upper/lowercase letters, numbers, special characters, and is not found in any dictionary.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Badge className={getTierColor("A")}>A</Badge>
              <div className="ml-4">
                <p className="font-bold text-slate-900 dark:text-white">Nightmare King/Queen (80-89)</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  A robust password that uses a combination of letters, numbers, and special characters, but 
                  may be a little shorter than the "S-Rank" password.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Badge className={getTierColor("B")}>B</Badge>
              <div className="ml-4">
                <p className="font-bold text-slate-900 dark:text-white">Abyssal Phantom (65-79)</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  A solid password with a good mix of characters, but possibly lacking in length or randomness.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Badge className={getTierColor("C")}>C</Badge>
              <div className="ml-4">
                <p className="font-bold text-slate-900 dark:text-white">Eclipsed Knight (50-64)</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  A password that includes both letters and numbers but is shorter or simpler. 
                  It's decent but could be vulnerable to attacks.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Badge className={getTierColor("D")}>D</Badge>
              <div className="ml-4">
                <p className="font-bold text-slate-900 dark:text-white">Void Walker (35-49)</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  A password that may only be one word or easy to guess. It lacks complexity and 
                  is vulnerable to common attack methods.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Badge className={getTierColor("E")}>E</Badge>
              <div className="ml-4">
                <p className="font-bold text-slate-900 dark:text-white">Shadow Novice (0-34)</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  A password that is easily cracked. It may be a common word, simple phrase, 
                  or include predictable patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRankings;
