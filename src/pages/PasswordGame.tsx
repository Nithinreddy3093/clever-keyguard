import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, Trophy, ArrowLeft, Eye, EyeOff, Flag, 
  Zap, Target, Award, Sparkles, Gamepad2, Gift, Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StrengthMeter from "@/components/StrengthMeter";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import PasswordQuests from "@/components/PasswordQuests";
import SecurityDashboard from "@/components/SecurityDashboard";
import SecretAchievements from "@/components/SecretAchievements";
import crypto from "crypto-js";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordQuestData {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

interface AchievementData {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  secret: boolean;
  icon: string;
}

const PasswordGame = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [questsCompleted, setQuestsCompleted] = useState<PasswordQuestData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([
    {
      id: "cryptographer",
      title: "The Cryptographer",
      description: "Created a password with 100+ bits of entropy",
      unlocked: false,
      rarity: "rare",
      secret: false,
      icon: "🔐"
    },
    {
      id: "hackersNightmare",
      title: "Hacker's Nightmare",
      description: "Generated a password unbreakable for 1,000+ years",
      unlocked: false,
      rarity: "legendary",
      secret: false,
      icon: "🛡️"
    },
    {
      id: "diversityChamp",
      title: "Diversity Champion",
      description: "Used all four character types in one password",
      unlocked: false,
      rarity: "uncommon",
      secret: false,
      icon: "🔡"
    },
    {
      id: "marathonRunner",
      title: "Marathon Runner",
      description: "Created a password with 20+ characters",
      unlocked: false,
      rarity: "uncommon",
      secret: false,
      icon: "📏"
    },
    {
      id: "perfectScore",
      title: "Perfect Score",
      description: "Achieved the maximum password security score",
      unlocked: false,
      rarity: "rare",
      secret: false,
      icon: "⭐"
    },
    {
      id: "thinkOutside",
      title: "Think Outside The Box",
      description: "Created a password with unexpected patterns",
      unlocked: false,
      rarity: "rare",
      secret: true,
      icon: "🎭"
    },
    {
      id: "persistence",
      title: "Persistence Pays Off",
      description: "Tested 10 different passwords in one session",
      unlocked: false,
      rarity: "common",
      secret: true,
      icon: "🔄"
    }
  ]);
  const [streak, setStreak] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [passwordsTestedCount, setPasswordsTestedCount] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const storedUsername = localStorage.getItem("passwordGameUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    const storedStreak = localStorage.getItem("passwordStreak");
    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10) || 0);
    }
    
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    if (lastStreakUpdate) {
      const lastUpdate = new Date(lastStreakUpdate);
      const now = new Date();
      const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate > 1) {
        setStreak(0);
        localStorage.setItem("passwordStreak", "0");
      }
    }
    
    const storedAchievements = localStorage.getItem("passwordAchievements");
    if (storedAchievements) {
      try {
        const parsedAchievements = JSON.parse(storedAchievements);
        setAchievements(state => {
          return state.map(achievement => {
            const storedAchievement = parsedAchievements.find((a: any) => a.id === achievement.id);
            if (storedAchievement) {
              return { ...achievement, ...storedAchievement };
            }
            return achievement;
          });
        });
      } catch (e) {
        console.error("Failed to parse stored achievements", e);
      }
    }
    
    const storedQuests = localStorage.getItem("passwordQuests");
    if (storedQuests) {
      try {
        const parsedQuests = JSON.parse(storedQuests);
        setQuestsCompleted(parsedQuests);
      } catch (e) {
        console.error("Failed to parse stored quests", e);
      }
    }
    
    const storedCount = localStorage.getItem("passwordsTestedCount");
    if (storedCount) {
      setPasswordsTestedCount(parseInt(storedCount, 10) || 0);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("passwordGameUsername", newUsername);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value) {
      const results = analyzePassword(value);
      setAnalysis(results);
      
      const newCount = passwordsTestedCount + 1;
      setPasswordsTestedCount(newCount);
      localStorage.setItem("passwordsTestedCount", newCount.toString());
      
      if (newCount >= 10 && !achievements.find(a => a.id === "persistence")?.unlocked) {
        const updatedAchievements = achievements.map(a => {
          if (a.id === "persistence") {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        setAchievements(updatedAchievements);
        localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
        
        toast({
          title: "Achievement Unlocked!",
          description: "Persistence Pays Off - Tested 10 different passwords",
        });
      }
      
      if (results.achievements && results.achievements.length > 0) {
        let newAchievementsUnlocked = false;
        
        const updatedAchievements = achievements.map(achievement => {
          const matchingAchievement = results.achievements.find((a: any) => a.id === achievement.id);
          
          if (matchingAchievement && !achievement.unlocked) {
            newAchievementsUnlocked = true;
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            };
          }
          
          return achievement;
        });
        
        if (newAchievementsUnlocked) {
          setAchievements(updatedAchievements);
          localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
          
          toast({
            title: "Achievement Unlocked!",
            description: "You've earned a new achievement! Check the achievements section.",
          });
        }
      }
    } else {
      setAnalysis(null);
    }
  };

  const handleQuestComplete = (quest: any) => {
    if (questsCompleted.some(q => q.id === quest.id)) {
      return;
    }
    
    const completedQuest: PasswordQuestData = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    const updatedQuests = [...questsCompleted, completedQuest];
    setQuestsCompleted(updatedQuests);
    localStorage.setItem("passwordQuests", JSON.stringify(updatedQuests));
    
    const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
    const today = new Date().toDateString();
    
    if (!lastStreakUpdate || new Date(lastStreakUpdate).toDateString() !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("passwordStreak", newStreak.toString());
      localStorage.setItem("lastStreakUpdate", new Date().toISOString());
    }
    
    setRewardText(`You've completed the "${quest.title}" quest and earned ${quest.xp} XP!`);
    setShowReward(true);
    
    toast({
      title: "Quest Completed!",
      description: `You've completed the "${quest.title}" quest!`,
    });
  };

  const viewAchievement = (achievement: any) => {
    setSelectedAchievement(achievement);
  };

  const saveToSupabase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your progress",
        variant: "destructive",
      });
      return;
    }

    if (!analysis) {
      toast({
        title: "No password",
        description: "Please enter a password first",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      const passwordHash = crypto.SHA256(password).toString();
      
      const clampedScore = Math.min(Math.max(Math.round(analysis.score * 25), 0), 100);
      
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
        metadata: { 
          username: username,
          quests_completed: questsCompleted.length,
          achievements_unlocked: achievements.filter(a => a.unlocked).length,
          streak: streak
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Progress saved!",
        description: `Your password game progress has been saved as ${username}`,
      });
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save progress",
        variant: "destructive",
      });
    }
  };

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
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password Security Game
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Complete quests, earn achievements and improve your security!
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
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
                    Your Username
                  </label>
                  <Input
                    id="username"
                    placeholder="Enter your display name"
                    value={username}
                    onChange={handleUsernameChange}
                  />
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
                </div>
                
                {analysis && (
                  <div className="space-y-4">
                    <StrengthMeter score={analysis.score} />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex flex-col h-full">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center mb-1">
                            <Target className="h-4 w-4 mr-1 text-blue-500" />
                            Crack Time
                          </h3>
                          <p className="text-lg font-semibold">
                            {analysis.hackabilityScore?.timeToHack || "-"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
                            Time to break your password
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex flex-col h-full">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center mb-1">
                            <Award className="h-4 w-4 mr-1 text-amber-500" />
                            Current Streak
                          </h3>
                          <p className="text-lg font-semibold">
                            {streak} days
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
                            Complete quests to maintain streak
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={saveToSupabase} 
                      className="w-full"
                    >
                      Save My Progress
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {analysis && (
            <SecurityDashboard
              passwordScore={analysis.score}
              passwordEntropy={analysis.entropy}
              hasCommonPattern={analysis.hasCommonPattern}
              isCommon={analysis.isCommon}
              hackabilityScore={analysis.hackabilityScore}
              passwordStreak={streak}
              questsCompleted={questsCompleted.length}
              totalQuests={4}
            />
          )}
        </div>
        
        {analysis && (
          <div className="space-y-6">
            <PasswordQuests
              passwordLength={analysis.length}
              hasUpper={analysis.hasUpper}
              hasLower={analysis.hasLower}
              hasDigit={analysis.hasDigit}
              hasSpecial={analysis.hasSpecial}
              entropy={analysis.entropy}
              score={analysis.score}
              onQuestComplete={handleQuestComplete}
            />
            
            <SecretAchievements
              achievements={achievements.map(achievement => ({
                ...achievement,
                icon: (() => {
                  switch (achievement.icon) {
                    case "🔐": return <Zap className="h-5 w-5 text-indigo-500" />;
                    case "🛡️": return <Shield className="h-5 w-5 text-blue-500" />;
                    case "🔡": return <Flag className="h-5 w-5 text-green-500" />;
                    case "📏": return <Target className="h-5 w-5 text-amber-500" />;
                    case "⭐": return <Sparkles className="h-5 w-5 text-purple-500" />;
                    case "🎭": return <Gift className="h-5 w-5 text-red-500" />;
                    case "🔄": return <Trophy className="h-5 w-5 text-orange-500" />;
                    default: return <Award className="h-5 w-5 text-primary" />;
                  }
                })()
              }))}
              onViewAchievement={viewAchievement}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                    <Zap className="mr-2 h-5 w-5 text-amber-500" />
                    Time-to-Crack Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Beat Your Best Time
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Create a password that takes longer to crack than your previous best!
                        </p>
                        {analysis && (
                          <div className="mt-3">
                            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-600">
                              Current: {analysis.hackabilityScore?.timeToHack || "N/A"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <Target className="h-8 w-8 text-amber-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Badge className="bg-indigo-500">Challenge</Badge>
                      <p className="text-sm font-medium mt-2 text-slate-800 dark:text-slate-200">
                        Can you create a password that would take 1,000+ years to crack?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    Security Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Daily Security Habit
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Complete at least one quest every day to maintain your streak
                        </p>
                        <div className="mt-3">
                          <Badge className={streak > 0 ? "bg-green-500" : "bg-slate-400"}>
                            {streak} day{streak !== 1 ? 's' : ''} streak
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Award className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                          Maintain a 7-day streak to unlock the "Consistency Champion" badge!
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedAchievement?.unlocked ? (
                <Award className="h-5 w-5 mr-2 text-amber-500" />
              ) : (
                <Lock className="h-5 w-5 mr-2 text-slate-400" />
              )}
              {selectedAchievement?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAchievement?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex justify-between items-center">
              <Badge 
                variant="outline" 
                className={
                  selectedAchievement?.rarity === "common" ? "text-slate-500" :
                  selectedAchievement?.rarity === "uncommon" ? "text-green-500" :
                  selectedAchievement?.rarity === "rare" ? "text-blue-500" :
                  "text-purple-500"
                }
              >
                {selectedAchievement?.rarity.charAt(0).toUpperCase() + (selectedAchievement?.rarity.slice(1) || "")}
              </Badge>
              
              <Badge variant={selectedAchievement?.unlocked ? "default" : "outline"} className={selectedAchievement?.unlocked ? "bg-emerald-500" : ""}>
                {selectedAchievement?.unlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            
            {selectedAchievement?.unlocked && selectedAchievement.unlockedAt && (
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Unlocked on: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Quest Completed!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {rewardText}
            </p>
            <Button onClick={() => setShowReward(false)} className="w-full">
              Claim Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordGame;
