
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Lock, PhoneIcon, Brain, X, Trophy, Shield, Swords, Puzzle, Zap, Terminal, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BruteForceGame from "./games/BruteForceGame";
import PhishingGame from "./games/PhishingGame";
import PasswordStrengthGame from "./games/PasswordStrengthGame";
import BreachSimulatorGame from "./games/BreachSimulatorGame";
import PasswordMatchingGame from "./games/PasswordMatchingGame";
import HackingDefenseGame from "./games/HackingDefenseGame";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import useGameProgress from "@/hooks/useGameProgress";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/components/SecretAchievements";
import AchievementPopup from "./AchievementPopup";

const PasswordGames = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGameDialog, setShowGameDialog] = useState(false);
  const [unlockedGames, setUnlockedGames] = useState<Record<string, boolean>>({});
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    playerLevel, 
    addXp, 
    checkGlobalRank, 
    incrementGamesPlayed,
    achievements,
    setAchievements
  } = useGameProgress();

  // Load unlocked games from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unlockedGames');
      if (saved) {
        setUnlockedGames(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load unlocked games:", e);
    }
  }, []);

  const games = [
    {
      id: "bruteforce",
      title: "Terminal Breach",
      description: "Crack the system password with strategic guesses and clever deduction in this Wordle-style hacking game.",
      icon: <Terminal className="h-6 w-6" />,
      difficulty: "Intermediate",
      baseXp: 120,
      levelRequired: 1,
      component: (props: any) => <BruteForceGame {...props} />
    },
    {
      id: "strengthchallenge",
      title: "Entropy Arena",
      description: "Test your password strength judgment and transform weak passwords into unbreakable ones.",
      icon: <Shield className="h-6 w-6" />,
      difficulty: "Beginner",
      baseXp: 100,
      levelRequired: 1,
      component: (props: any) => <PasswordStrengthGame {...props} />
    },
    {
      id: "phishing",
      title: "Hook or Hoax?",
      description: "Train your eye to spot sophisticated phishing attempts across emails, SMS, and social messages.",
      icon: <Target className="h-6 w-6" />,
      difficulty: "Intermediate",
      baseXp: 150,
      levelRequired: 2,
      component: (props: any) => <PhishingGame {...props} />
    },
    {
      id: "passwordmatching",
      title: "Cipher Sync",
      description: "Match weak passwords with stronger alternatives in this multi-level memory game with encoded challenges.",
      icon: <Puzzle className="h-6 w-6" />,
      difficulty: "Beginner",
      baseXp: 125,
      levelRequired: 1,
      component: (props: any) => <PasswordMatchingGame {...props} />
    },
    {
      id: "breachsimulator",
      title: "Breach Simulator",
      description: "Test your knowledge about proper responses to data breaches and security incidents.",
      icon: <Swords className="h-6 w-6" />,
      difficulty: "Intermediate",
      baseXp: 150,
      levelRequired: 3,
      component: (props: any) => <BreachSimulatorGame {...props} />
    },
    {
      id: "hackingdefense",
      title: "Firewall Frenzy",
      description: "Defend your system against waves of increasingly sophisticated cyber attacks with strategic countermeasures.",
      icon: <Zap className="h-6 w-6" />,
      difficulty: "Advanced",
      baseXp: 175,
      levelRequired: 4,
      component: (props: any) => <HackingDefenseGame {...props} />
    }
  ];

  const handleGameComplete = (gameId: string, score: number) => {
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    // Record that the game was played
    incrementGamesPlayed();
    
    // Calculate XP based on score and difficulty
    const earnedXp = Math.round((score / 100) * game.baseXp);
    
    // Award XP to player
    addXp(earnedXp);
    
    // Check for perfect score achievement
    if (score >= 100 && !achievements.find(a => a.id === "perfect_score")?.unlocked) {
      const perfectScoreAchievement = achievements.find(a => a.id === "perfect_score");
      if (perfectScoreAchievement) {
        const updatedAchievement = {
          ...perfectScoreAchievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        
        // Update achievements
        const updatedAchievements = achievements.map(a => 
          a.id === "perfect_score" ? updatedAchievement : a
        );
        setAchievements(updatedAchievements);
        localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
        
        // Show achievement popup
        setTimeout(() => {
          setShowAchievement(updatedAchievement);
        }, 1000);
      }
    }
    
    // Show completion message
    toast({
      title: "Game complete!",
      description: `You earned ${earnedXp} XP ${user ? 'and your score was saved to the leaderboard!' : ''}`,
    });
    
    // Close dialog after delay
    setTimeout(() => {
      setShowGameDialog(false);
      setActiveGame(null);
      
      // Update global rank if user is logged in
      if (user) {
        setTimeout(() => {
          checkGlobalRank();
        }, 1500);
      }
    }, 3000);
  };

  const startGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    // Check if game is unlocked
    if (unlockedGames[gameId] || playerLevel >= game.levelRequired) {
      // If not already marked as unlocked but meets level requirements, save it
      if (!unlockedGames[gameId] && playerLevel >= game.levelRequired) {
        const newUnlockedGames = {...unlockedGames, [gameId]: true};
        setUnlockedGames(newUnlockedGames);
        localStorage.setItem('unlockedGames', JSON.stringify(newUnlockedGames));
      }
      
      // Start the game
      setActiveGame(gameId);
      setShowGameDialog(true);
    } else {
      // Not unlocked
      toast({
        title: "Game Locked",
        description: `Reach level ${game.levelRequired} to unlock this game`,
        variant: "destructive"
      });
    }
  };

  const isGameUnlocked = (gameId: string): boolean => {
    const game = games.find(g => g.id === gameId);
    if (!game) return false;
    
    return unlockedGames[gameId] || playerLevel >= game.levelRequired;
  };

  const ActiveGameComponent = activeGame ? 
    games.find(game => game.id === activeGame)?.component : 
    null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Gamepad2 className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Password Security Games
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Test and improve your security knowledge through interactive games
        </p>
        <div className="mt-3 flex justify-center">
          <Badge variant="outline" className="bg-primary/10">
            <Trophy className="h-3.5 w-3.5 mr-1 text-primary" />
            Level {playerLevel} Player
          </Badge>
          {user ? (
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Trophy className="h-3.5 w-3.5 mr-1 text-primary" />
              Scores saved to Leaderboard
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800">
              <Lock className="h-3.5 w-3.5 mr-1" />
              Sign in to save scores
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col transition-all hover:shadow-md ${
                !isGameUnlocked(game.id) ? 'opacity-75 dark:opacity-50' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {game.icon}
                    </div>
                    <Badge variant={
                      game.difficulty === "Beginner" 
                        ? "outline" 
                        : game.difficulty === "Intermediate" 
                          ? "secondary" 
                          : "destructive"
                    }>
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {game.title}
                    {!isGameUnlocked(game.id) && (
                      <Lock className="h-4 w-4 ml-2 text-slate-400" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isGameUnlocked(game.id) ? game.description : `Unlock at level ${game.levelRequired}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Base XP:</span>
                      <span className="font-medium">{game.baseXp} XP</span>
                    </div>
                    {!isGameUnlocked(game.id) && (
                      <div className="mt-2 py-1 px-2 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-md">
                        🔓 Reach level {game.levelRequired} to unlock
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => startGame(game.id)} 
                    className="w-full"
                    disabled={!isGameUnlocked(game.id)}
                  >
                    {isGameUnlocked(game.id) ? 'Play Now' : 'Locked'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {games.find(game => game.id === activeGame)?.title || "Game"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGameDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Complete the challenges to earn XP and improve your ranking
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {ActiveGameComponent && (
              <ActiveGameComponent
                onComplete={(score: number) => handleGameComplete(activeGame as string, score)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AchievementPopup 
        achievement={showAchievement} 
        onClose={() => setShowAchievement(null)} 
      />
    </div>
  );
};

export default PasswordGames;
