import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Trophy, ArrowLeft, Eye, EyeOff, User, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StrengthMeter from "@/components/StrengthMeter";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import crypto from "crypto-js";
import LeaderboardTable, { UserRanking, getTierForScore, getTierName, getTierColor } from "@/components/LeaderboardTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface PasswordMetadata {
  username?: string;
  [key: string]: any;
}

const PasswordRankings = () => {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [testScore, setTestScore] = useState(0);
  const [savedToRankings, setSavedToRankings] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const storedUsername = localStorage.getItem("shadowTierUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchRankings();
    fetchUserStreak();
  }, [user]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data: passwordData, error } = await supabase
        .from("password_history")
        .select("user_id, score, metadata, daily_streak")
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching rankings:", error);
        toast({
          title: "Error",
          description: "Failed to load rankings data",
          variant: "destructive",
        });
        setRankings([]);
        setLoading(false);
        return;
      }

      if (!passwordData || !Array.isArray(passwordData)) {
        setRankings([]);
        setLoading(false);
        return;
      }

      const userMap = new Map<string, { score: number, displayName: string, streak?: number }>();
      
      passwordData.forEach((entry) => {
        if (!entry.user_id) return;

        const metadata = (entry.metadata || {}) as PasswordMetadata;
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

      const rankingsData = Array.from(userMap.entries()).map(([userId, data], index) => ({
        userId,
        displayName: data.displayName,
        score: data.score,
        tier: getTierForScore(data.score),
        rank: index + 1,
        change: "same" as const,
        streak: data.streak
      }));

      setRankings(rankingsData);
    } catch (error: any) {
      console.error("Error fetching rankings:", error);
      toast({
        title: "Error",
        description: "Failed to load rankings data",
        variant: "destructive",
      });
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStreak = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("password_history")
        .select("daily_streak, last_interaction_date")
        .eq("user_id", user.id)
        .order("daily_streak", { ascending: false })
        .limit(1);
        
      if (error) {
        console.error("Error fetching user streak:", error);
        return;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        setCurrentStreak(data[0].daily_streak || 0);
      }
    } catch (error) {
      console.error("Error fetching user streak:", error);
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

  const updateUserStreak = async () => {
    if (!user) return;
    
    try {
      // Get current streak
      const { data: streakData, error: streakError } = await supabase
        .from("password_history")
        .select("daily_streak, last_interaction_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (streakError) {
        console.error("Error fetching streak data:", streakError);
        return currentStreak;
      }
      
      let currentStreak = 0;
      let lastDate = null;
      
      if (streakData && Array.isArray(streakData) && streakData.length > 0) {
        currentStreak = streakData[0].daily_streak || 0;
        lastDate = streakData[0].last_interaction_date;
      }
      
      // Check if last interaction was yesterday or earlier
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastInteraction = lastDate ? new Date(lastDate) : null;
      if (lastInteraction) {
        lastInteraction.setHours(0, 0, 0, 0);
      }
      
      // Calculate days difference
      const daysDiff = lastInteraction 
        ? Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
      
      // Update streak based on days difference
      let newStreak = currentStreak;
      if (daysDiff === 1) {
        // Yesterday - increment streak
        newStreak = currentStreak + 1;
      } else if (daysDiff > 1) {
        // More than a day - reset streak
        newStreak = 1;
      } else if (daysDiff === 0) {
        // Same day - no change to streak
        newStreak = Math.max(currentStreak, 1);
      }
      
      return newStreak;
      
    } catch (error) {
      console.error("Error updating streak:", error);
      return currentStreak;
    }
  };

  const saveToRankings = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your score to rankings",
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
      const newStreak = await updateUserStreak();
      
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
        metadata: { username: username },
        daily_streak: newStreak,
        last_interaction_date: new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      
      toast({
        title: "Score saved!",
        description: `Your password strength (${clampedScore}) has been saved to the rankings as ${username}`,
      });
      
      setSavedToRankings(true);
      fetchRankings();
      setCurrentStreak(newStreak);
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
            Shadow Tier Rankings
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Test your password and see how you rank against other shadow warriors
          </p>
          {currentStreak > 0 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Award className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-medium">
                {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
              </span>
            </div>
          )}
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
                  Shadow Warrior Name
                </label>
                <Input
                  id="username"
                  placeholder="Enter your shadow name"
                  value={username}
                  onChange={handleUsernameChange}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This will be shown on the shadow leaderboard
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
                      <Link to="/auth">
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
                  <div className="flex items-center justify-end mt-1">
                    <Award className="h-4 w-4 text-amber-500 mr-1" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {userRank.streak || 0} day streak
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center justify-between text-slate-900 dark:text-white">
              <div className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                Shadow Realm Leaderboard
              </div>
              <Badge variant="outline" className="ml-2">
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="leaderboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="leaderboard">Global Rankings</TabsTrigger>
                <TabsTrigger value="tiers">Tier Distribution</TabsTrigger>
              </TabsList>
              
              <TabsContent value="leaderboard" className="mt-0">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <LeaderboardTable 
                    initialRankings={rankings} 
                    onRankingsChange={setRankings}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="tiers" className="mt-0">
                <div className="space-y-4">
                  {(["S", "A", "B", "C", "D", "E"] as const).map((tier) => {
                    const tierUsers = rankings.filter(r => r.tier === tier);
                    const percentage = rankings.length > 0 
                      ? Math.round((tierUsers.length / rankings.length) * 100) 
                      : 0;
                    
                    return (
                      <div key={tier} className={`p-4 rounded-lg ${tier === "S" ? "bg-purple-50 dark:bg-purple-900/20" : tier === "A" ? "bg-indigo-50 dark:bg-indigo-900/20" : tier === "B" ? "bg-blue-50 dark:bg-blue-900/20" : tier === "C" ? "bg-green-50 dark:bg-green-900/20" : tier === "D" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Badge className={getTierColor(tier)}>{tier}</Badge>
                            <span className="ml-3 font-bold text-slate-900 dark:text-white">
                              {getTierName(tier)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {tierUsers.length} player{tierUsers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${tier === "S" ? "bg-purple-600" : tier === "A" ? "bg-indigo-600" : tier === "B" ? "bg-blue-600" : tier === "C" ? "bg-green-600" : tier === "D" ? "bg-yellow-600" : "bg-red-600"}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                          {percentage}% of players
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            Shadow Tier System Explained
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
              {(["S", "A", "B", "C", "D", "E"] as const).map((tier) => (
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
