import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Trophy, ArrowUp, ArrowDown, Minus, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StrengthMeter from "@/components/StrengthMeter";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import crypto from "crypto-js";

type RankTier = "S" | "A" | "B" | "C" | "D" | "E";

interface UserRanking {
  userId: string;
  displayName: string;
  score: number;
  tier: RankTier;
  rank: number;
  change: "up" | "down" | "same"; // Made change required and properly typed
}

interface PasswordMetadata {
  username?: string;
  [key: string]: any;
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
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [testScore, setTestScore] = useState(0);
  const [savedToRankings, setSavedToRankings] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const storedUsername = localStorage.getItem("shadowTierUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data: passwordData, error } = await supabase
        .from("password_history")
        .select("user_id, score, metadata")
        .order("score", { ascending: false });

      if (error) throw error;

      if (!passwordData) {
        setRankings([]);
        return;
      }

      const userMap = new Map<string, { score: number, displayName: string }>();
      
      passwordData.forEach((entry) => {
        if (!entry.user_id) return;

        const metadata = (entry.metadata || {}) as PasswordMetadata;
        const displayName = metadata.username || `User ${entry.user_id.substring(0, 4)}`;
        
        if (!userMap.has(entry.user_id)) {
          userMap.set(entry.user_id, { score: entry.score, displayName });
        } else {
          const current = userMap.get(entry.user_id)!;
          if (entry.score > current.score) {
            userMap.set(entry.user_id, { score: entry.score, displayName });
          }
        }
      });

      const rankingsData = Array.from(userMap.entries()).map(([userId, data], index) => ({
        userId,
        displayName: data.displayName,
        score: data.score,
        tier: getTierForScore(data.score),
        rank: index + 1,
        change: "same" as const
      }));

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value) {
      const results = analyzePassword(value);
      setAnalysis(results);
      
      const rankingScore = Math.min(Math.max(Math.round(results.score * 25), 0), 100);
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
      
      const clampedScore = Math.min(Math.max(Math.round(testScore), 0), 100);
      
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: clampedScore,
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
        title: "Score saved!",
        description: `Your password strength (${clampedScore}) has been saved to the rankings as ${username}`,
      });
      
      setSavedToRankings(true);
      fetchRankings();
    } catch (error: any) {
      console.error("Error saving score:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save password score",
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
            Password Strength Rankings
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Test your password and see how it compares to others
          </p>
        </header>

        <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Test Your Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                  Display Name
                </label>
                <Input
                  id="username"
                  placeholder="Enter your display name"
                  value={username}
                  onChange={handleUsernameChange}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This will be shown on the leaderboard
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                  Password to Test
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a password to test"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  We don't store your password, only a secure hash
                </p>
              </div>
              
              {password && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Password Strength
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {analysis?.feedback || "Analyzing..."}
                        </p>
                      </div>
                      <Badge className={getTierColor(getTierForScore(testScore))}>
                        {testScore}/100
                      </Badge>
                    </div>
                    <StrengthMeter score={analysis?.score || 0} />
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {getTierName(getTierForScore(testScore))}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Tier: {getTierForScore(testScore)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg font-mono">
                        {getTierForScore(testScore)}
                      </Badge>
                    </div>
                  </div>
                  
                  {user ? (
                    <Button 
                      onClick={saveToRankings} 
                      disabled={savedToRankings}
                      className="w-full"
                    >
                      {savedToRankings ? "Score Saved to Rankings!" : "Save My Score to Rankings"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">
                        Sign In to Save Your Score
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {userRank && (
          <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                Your Current Ranking
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">Strength Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : rankings.length === 0 ? (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No rankings yet. Be the first to test and save a password!
              </p>
            ) : (
              <div className="space-y-3">
                {rankings.map((ranking) => (
                  <div 
                    key={ranking.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      ranking.userId === user?.id 
                        ? "bg-primary/10 dark:bg-primary/20 border border-primary/30" 
                        : "bg-slate-50 dark:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold mr-4">
                        {ranking.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center">
                          {ranking.userId === user?.id ? (
                            <span className="text-primary">You</span>
                          ) : (
                            <>
                              <User className="h-4 w-4 mr-1 opacity-70" />
                              {ranking.displayName}
                            </>
                          )}
                        </p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className={`text-xs ${getTierColor(ranking.tier)}`}>
                            {ranking.tier}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                            {getTierName(ranking.tier)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{ranking.score}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            How Password Strength is Calculated
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-bold mb-2 text-slate-900 dark:text-white">Scoring Factors</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Length (longer is better)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Uppercase letters</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Lowercase letters</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Numbers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Special characters</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Uncommon patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Not found in breach databases</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              {(["S", "A", "B", "C", "D", "E"] as RankTier[]).map((tier) => (
                <div key={tier} className={`p-3 rounded-lg flex items-start ${tier === "S" ? "bg-purple-50 dark:bg-purple-900/20" : tier === "A" ? "bg-indigo-50 dark:bg-indigo-900/20" : tier === "B" ? "bg-blue-50 dark:bg-blue-900/20" : tier === "C" ? "bg-green-50 dark:bg-green-900/20" : tier === "D" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                  <Badge className={getTierColor(tier)}>{tier}</Badge>
                  <div className="ml-3">
                    <p className="font-bold text-slate-900 dark:text-white">{getTierName(tier)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {tier === "S" ? "90-100" : tier === "A" ? "80-89" : tier === "B" ? "65-79" : tier === "C" ? "50-64" : tier === "D" ? "35-49" : "0-34"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRankings;
