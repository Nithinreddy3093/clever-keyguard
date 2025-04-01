
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Trophy, ArrowLeft, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type RankingData = {
  user_email: string;
  avg_score: number;
  password_count: number;
  highest_score: number;
  rank: string;
};

const PasswordRankings = () => {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [userRank, setUserRank] = useState<RankingData | null>(null);
  const { user } = useAuth();
  
  // Function to determine rank based on score
  const determineRank = (score: number): string => {
    if (score >= 95) return "S";
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 50) return "C";
    if (score >= 30) return "D";
    return "E";
  };
  
  // Get the display name based on rank
  const getRankDisplayName = (rank: string): string => {
    switch (rank) {
      case "S": return "Shadow Sovereign";
      case "A": return "Nightmare King/Queen";
      case "B": return "Abyssal Phantom";
      case "C": return "Eclipsed Knight";
      case "D": return "Void Walker";
      case "E": return "Shadow Novice";
      default: return "";
    }
  };
  
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Fetch password history data grouped by user
        const { data, error } = await supabase
          .from('password_history')
          .select('user_id, score')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Process the data to create rankings
          const userScores: Record<string, number[]> = {};
          
          // Group scores by user_id
          data.forEach(item => {
            if (!userScores[item.user_id]) {
              userScores[item.user_id] = [];
            }
            userScores[item.user_id].push(item.score);
          });
          
          // Get user details for each user_id
          const userRankings: RankingData[] = [];
          
          for (const [userId, scores] of Object.entries(userScores)) {
            // Fetch user email
            const { data: userData } = await supabase
              .from('auth')
              .select('email')
              .eq('id', userId)
              .single();
              
            const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const highestScore = Math.max(...scores);
            
            userRankings.push({
              user_email: userData?.email || `User-${userId.slice(0, 6)}`,
              avg_score: parseFloat(avgScore.toFixed(2)),
              password_count: scores.length,
              highest_score: highestScore,
              rank: determineRank(avgScore)
            });
            
            // If this is the current user, set their rank
            if (user && userId === user.id) {
              setUserRank({
                user_email: userData?.email || `User-${userId.slice(0, 6)}`,
                avg_score: parseFloat(avgScore.toFixed(2)),
                password_count: scores.length,
                highest_score: highestScore,
                rank: determineRank(avgScore)
              });
            }
          }
          
          // Sort by average score in descending order
          userRankings.sort((a, b) => b.avg_score - a.avg_score);
          
          setRankings(userRankings);
        }
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };
    
    fetchRankings();
  }, [user]);
  
  // Rank color based on rank
  const getRankColor = (rank: string): string => {
    switch (rank) {
      case "S": return "text-purple-600 dark:text-purple-400";
      case "A": return "text-emerald-600 dark:text-emerald-400";
      case "B": return "text-blue-600 dark:text-blue-400";
      case "C": return "text-yellow-600 dark:text-yellow-400";
      case "D": return "text-orange-600 dark:text-orange-400";
      case "E": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };
  
  // Icon based on rank
  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "S": return <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "A": return <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "B": return <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "C": return <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case "D": return <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case "E": return <Star className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4">
        <div className="mb-8 flex items-center">
          <Button asChild variant="outline" className="mr-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shadow Tier Rankings
          </h1>
        </div>
        
        <div className="flex justify-center mb-8">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        
        {userRank && (
          <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800 transition-colors duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                Your Shadow Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className={`text-2xl font-bold mr-2 ${getRankColor(userRank.rank)}`}>
                    {userRank.rank}-Rank
                  </span>
                  {getRankIcon(userRank.rank)}
                  <span className="text-slate-600 dark:text-slate-300 ml-3">
                    {getRankDisplayName(userRank.rank)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-slate-600 dark:text-slate-300">Average Score: <span className="font-semibold">{userRank.avg_score}</span></div>
                  <div className="text-slate-600 dark:text-slate-300">Passwords Analyzed: <span className="font-semibold">{userRank.password_count}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800 transition-colors duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Trophy className="mr-2 h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.length > 0 ? (
              <div className="space-y-4">
                {rankings.map((rank, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-md ${
                      user && rank.user_email === (user.email || '') 
                        ? 'bg-primary/10 dark:bg-primary/20' 
                        : 'bg-slate-50 dark:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl font-bold mr-3 w-6 text-center text-slate-700 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center">
                          <span className={`font-semibold mr-2 ${getRankColor(rank.rank)}`}>
                            {rank.rank}-Rank
                          </span>
                          {getRankIcon(rank.rank)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {rank.user_email.split('@')[0]}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">{rank.avg_score}</span> avg score
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {rank.password_count} passwords
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No rankings available yet. Start analyzing passwords to earn your rank!
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 space-y-6 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shadow Tier Ranking System</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <span className={`text-xl font-bold mr-3 ${getRankColor("S")}`}>S-Rank</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Shadow Sovereign</div>
                <p className="text-slate-600 dark:text-slate-400">A password that is virtually impossible to crack. It's long, complex, contains a mix of upper/lowercase letters, numbers, special characters, and is not found in any dictionary.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className={`text-xl font-bold mr-3 ${getRankColor("A")}`}>A-Rank</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Nightmare King/Queen</div>
                <p className="text-slate-600 dark:text-slate-400">A robust password that uses a combination of letters, numbers, and special characters, but may be a little shorter than the "S-Rank" password.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className={`text-xl font-bold mr-3 ${getRankColor("B")}`}>B-Rank</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Abyssal Phantom</div>
                <p className="text-slate-600 dark:text-slate-400">A solid password with a good mix of characters, but possibly lacking in length or randomness.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className={`text-xl font-bold mr-3 ${getRankColor("C")}`}>C-Rank</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Eclipsed Knight</div>
                <p className="text-slate-600 dark:text-slate-400">A password that includes both letters and numbers but is shorter or simpler.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className={`text-xl font-bold mr-3 ${getRankColor("D")}`}>D-Rank</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Void Walker</div>
                <p className="text-slate-600 dark:text-slate-400">A password that may only be one word or easy to guess. It lacks complexity and is vulnerable to common attack methods.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className={`text-xl font-bold mr-3 ${getRankColor("E")}`}>E-Rank</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Shadow Novice</div>
                <p className="text-slate-600 dark:text-slate-400">A password that is easily cracked. It may be a common word, simple phrase, or include predictable patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRankings;
