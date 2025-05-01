import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Settings, Shield, LockKeyhole, Puzzle, KeyRound } from "lucide-react";
import { analyzePassword } from "@/lib/password/analyzer";
import PasswordTester from "@/components/game/PasswordTester";
import DailyChallenges from "@/components/game/DailyChallenges";
import { useQuestCompletion } from "@/hooks/game/useQuestCompletion";
import useGameProgress from "@/hooks/useGameProgress";
import PasswordStrengthGame from "@/components/game/games/PasswordStrengthGame";
import SecretAchievements from "@/components/SecretAchievements";

function Index() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { handlePasswordChange } = usePasswordAnalysis();
  const { handleQuestComplete } = useQuestCompletion();
  const {
    playerLevel,
    playerXp,
    questsCompleted,
    achievements,
    passwordsTestedCount,
    gamesPlayedCount,
    streak,
    addXp,
    completeQuest,
    handleDailyChallengeComplete,
    updateUserStreak,
    checkGlobalRank,
    incrementGamesPlayed,
    dailyChallenges,
    todayCompleted,
    generateDailyChallenges
  } = useGameProgress();
  const [gameScore, setGameScore] = useState<number | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    // Generate daily challenges on mount
    generateDailyChallenges();
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordTest = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordChange(e);
    setPassword(e.target.value);
  };

  const handleSaveProgress = () => {
    if (username && password && analysis) {
      // Save progress logic here
      toast({
        title: "Progress Saved!",
        description: "Your progress has been saved.",
      });
      handleQuestComplete({
        id: "first_password",
        title: "Test Your First Password",
        description: "Test a password to see its strength",
        xp: 50
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a username and password to save progress.",
        variant: "destructive",
      });
    }
  };

  const handleGameComplete = (score: number) => {
    setGameScore(score);
    setShowGame(false);
    incrementGamesPlayed();

    if (score === 100) {
      completeQuest("perfect_score", 100);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Sparkles className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Password Fortress
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          Analyze, strengthen, and remember your passwords
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PasswordTester
          username={username}
          onUsernameChange={handleUsernameChange}
          password={password}
          onPasswordChange={handlePasswordTest}
          analysis={analysis}
          streak={streak}
          onSaveProgress={handleSaveProgress}
        />

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium mb-2">Level Up Your Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete challenges and games to earn rewards
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowGame(true)}>
                <div className="flex items-center">
                  <Puzzle className="mr-2 h-4 w-4" />
                  <span>Password Strength Game</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowAchievements(true)}>
                <div className="flex items-center">
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  <span>View Secret Achievements</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/rankings">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Global Rankings</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium mb-2">Password Tools</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced tools to manage your passwords
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/passphrase-generator">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Passphrase Generator</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/theme-password-generator">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Theme Password Generator</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <DailyChallenges
          challenges={dailyChallenges}
          onChallengeComplete={handleDailyChallengeComplete}
          todayCompleted={todayCompleted}
        />
      </div>

      {showGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-items-center">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Password Strength Game</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <PasswordStrengthGame onComplete={handleGameComplete} />
            </CardContent>
          </Card>
        </div>
      )}

      {showAchievements && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-items-center">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Secret Achievements</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <SecretAchievements achievements={achievements} />
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => setShowAchievements(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Index;

import { usePasswordAnalysis } from "@/hooks/game/usePasswordAnalysis";
