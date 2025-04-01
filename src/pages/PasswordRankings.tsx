
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Trophy, ArrowUp, ArrowDown, Minus, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import crypto from "crypto-js";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [testScore, setTestScore] = useState(0);
  const [savedToRankings, setSavedToRankings] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get stored username from localStorage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("shadowTierUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
    
    // Set up real-time subscription for rankings updates
    const channel = supabase
      .channel('rankings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'password_history'
        },
        () => {
          fetchRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      // Get password history data which includes user_id and scores
      const { data: passwordData, error: passwordError } = await supabase
        .from("password_history")
        .select("user_id, score, metadata");

      if (passwordError) {
        console.error("Error fetching password data:", passwordError);
        throw passwordError;
      }

      if (!passwordData) {
        console.log("No password data found");
        setRankings([]);
        setLoading(false);
        return;
      }

      // Process the rankings
      const userScores: Record<string, { scores: number[], displayName: string }> = {};
      
      // Group scores by user
      passwordData.forEach((entry) => {
        if (!entry.user_id) return; // Skip entries without user_id
        
        if (!userScores[entry.user_id]) {
          userScores[entry.user_id] = {
            scores: [],
            displayName: entry.metadata?.username || `User ${entry.user_id.substring(0, 4)}`
          };
        }
        userScores[entry.user_id].scores.push(entry.score);
      });
      
      // Calculate average scores and create rankings
      const rankingsData: UserRanking[] = [];
      
      Object.entries(userScores).forEach(([userId, userData]) => {
        // Find the max score for each user
        const maxScore = Math.max(...userData.scores);
        
        rankingsData.push({
          userId,
          displayName: userData.displayName,
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

  const getUserRank = () => {
    if (!user) return null;
    return rankings.find(r => r.userId === user.id);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("shadowTierUsername", newUsername);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const results = analyzePassword(value);
      setAnalysis(results);
      
      // Convert score (0-4) to a ranking score (0-100)
      const rankingScore = Math.round(results.score * 25);
      setTestScore(rankingScore);
    } else {
      setAnalysis(null);
      setTestScore(0);
    }
    setSavedToRankings(false);
  };

  const saveToRankings = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save this score to rankings",
        variant: "destructive",
      });
      return;
    }

    if (!password || !analysis) {
      toast({
        title: "No password",
        description: "Please enter a password to test and save",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to identify yourself on the leaderboard",
        variant: "destructive",
      });
      return;
    }

    try {
      const passwordHash = crypto.SHA256(password).toString();
      
      // Save to Supabase with username in metadata
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: testScore, // Use the ranking score (0-100)
        length: analysis.length,
        has_upper: analysis.hasUpper,
        has_lower: analysis.hasLower,
        has_digit: analysis.hasDigit,
        has_special: analysis.hasSpecial,
        is_common: analysis.isCommon,
        has_common_pattern: analysis.hasCommonPattern,
        entropy: analysis.entropy,
        metadata: { username: username }
      });
      
      if (error) throw error;
      
      toast({
        title: "Score saved",
        description: "Your password score has been saved to the rankings",
      });
      
      setSavedToRankings(true);
      fetchRankings(); // Refresh rankings
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <Button asChild variant="outline" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
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

        <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Test Your Password Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                Choose your Shadow Username
              </label>
              <Input
                id="username"
                placeholder="Enter your shadow name"
                value={username}
                onChange={handleUsernameChange}
                className="mb-4"
              />
            </div>
            
            <PasswordInput password={password} onChange={handlePasswordChange} />
            
            {analysis && (
              <div className="mt-4 space-y-4">
                <StrengthMeter score={analysis.score} />
                
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Tier: {getTierForScore(testScore)}
                    </p>
                    <Badge className={getTierColor(getTierForScore(testScore))}>
                      {getTierName(getTierForScore(testScore))}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    This password would score {testScore}/100 on our ranking system
                  </p>
                </div>
                
                {user && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveToRankings} 
                      disabled={savedToRankings}
                    >
                      {savedToRankings ? "Score Saved" : "Save to Rankings"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                    <p className="font-semibold text-slate-900 dark:text-white">{userRank.displayName}</p>
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
                                <span>You ({ranking.displayName})</span>
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
