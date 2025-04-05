
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Gamepad2, TimerIcon, BrainCircuit, KeySquare, Lock, UserCheck, TerminalSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BruteForceGame from "./games/BruteForceGame";
import PhishingGame from "./games/PhishingGame";

// Game interfaces
interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  level: "beginner" | "intermediate" | "advanced";
  points: number;
  available: boolean;
  comingSoon?: boolean;
}

// Future game components placeholders
const PasswordLabyrinthGame = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Password Labyrinth</h2>
    <p className="mb-6">Navigate a maze by remembering secure passphrases.</p>
    <p className="text-lg text-center text-muted-foreground">Game content coming soon!</p>
  </div>
);

const CryptographyGame = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Cryptography Challenge</h2>
    <p className="mb-6">Decrypt secret messages using hashing algorithms.</p>
    <p className="text-lg text-center text-muted-foreground">Game content coming soon!</p>
  </div>
);

const AIShowdownGame = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">AI vs. Human Showdown</h2>
    <p className="mb-6">Create passwords AI cannot crack in under 1 minute.</p>
    <p className="text-lg text-center text-muted-foreground">Game content coming soon!</p>
  </div>
);

const DarkWebGame = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Escape the Dark Web</h2>
    <p className="mb-6">Solve security puzzles to escape the dark web.</p>
    <p className="text-lg text-center text-muted-foreground">Game content coming soon!</p>
  </div>
);

const PasswordGames = () => {
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [activeGameComponent, setActiveGameComponent] = useState<React.ReactNode | null>(null);
  const [showGameDialog, setShowGameDialog] = useState(false);
  const [recentScores, setRecentScores] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const games: GameInfo[] = [
    {
      id: "brute-force",
      title: "Hack the Password",
      description: "Crack weak passwords within a time limit as an ethical hacker.",
      icon: <Lock className="h-10 w-10 text-red-500" />,
      level: "beginner",
      points: 100,
      available: true
    },
    {
      id: "phishing",
      title: "Phishing Mastermind",
      description: "Identify fake vs. real websites & emails before time runs out.",
      icon: <UserCheck className="h-10 w-10 text-blue-500" />,
      level: "intermediate",
      points: 150,
      available: true
    },
    {
      id: "labyrinth",
      title: "Password Labyrinth",
      description: "Navigate a maze by remembering randomized secure passphrases.",
      icon: <KeySquare className="h-10 w-10 text-green-500" />,
      level: "advanced",
      points: 200,
      available: false,
      comingSoon: true
    },
    {
      id: "cryptography",
      title: "Cryptography Challenge",
      description: "Decrypt secret messages using hashing algorithms & ciphers.",
      icon: <TerminalSquare className="h-10 w-10 text-purple-500" />,
      level: "advanced",
      points: 250,
      available: false,
      comingSoon: true
    },
    {
      id: "ai-showdown",
      title: "AI vs. Human Showdown",
      description: "Create a password that AI cannot crack in under 1 minute.",
      icon: <BrainCircuit className="h-10 w-10 text-indigo-500" />,
      level: "intermediate",
      points: 150,
      available: false,
      comingSoon: true
    },
    {
      id: "dark-web",
      title: "Escape the Dark Web",
      description: "Solve cybersecurity puzzles to escape the dark web.",
      icon: <Shield className="h-10 w-10 text-slate-500" />,
      level: "advanced",
      points: 300,
      available: false,
      comingSoon: true
    }
  ];

  // Load recent scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('gameScores');
    if (savedScores) {
      try {
        setRecentScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse saved game scores", e);
      }
    }
  }, []);

  const startGame = (game: GameInfo) => {
    setSelectedGame(game);
    
    // Determine which game component to show based on selected game
    switch (game.id) {
      case "brute-force":
        setActiveGameComponent(<BruteForceGame onComplete={(score) => handleGameComplete(game.id, score)} />);
        break;
      case "phishing":
        setActiveGameComponent(<PhishingGame onComplete={(score) => handleGameComplete(game.id, score)} />);
        break;
      case "labyrinth":
        setActiveGameComponent(<PasswordLabyrinthGame />);
        break;
      case "cryptography":
        setActiveGameComponent(<CryptographyGame />);
        break;
      case "ai-showdown":
        setActiveGameComponent(<AIShowdownGame />);
        break;
      case "dark-web":
        setActiveGameComponent(<DarkWebGame />);
        break;
      default:
        setActiveGameComponent(null);
    }
    
    setShowGameDialog(true);
  };

  // Handle game completion
  const handleGameComplete = async (gameId: string, score: number) => {
    // Update local scores
    const updatedScores = { ...recentScores, [gameId]: score };
    setRecentScores(updatedScores);
    localStorage.setItem('gameScores', JSON.stringify(updatedScores));
    
    // Award XP based on game and score
    const game = games.find(g => g.id === gameId);
    const baseXp = game?.points || 50;
    const earnedXp = Math.ceil(baseXp * (score / 100));
    
    // Save to database if user is logged in
    if (user) {
      try {
        const gameMetadata = {
          game_id: gameId,
          score: score,
          completed_at: new Date().toISOString()
        };
        
        // Get user's current data
        const { data: userData, error: userError } = await supabase
          .from("password_history")
          .select("score, metadata")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (userError) throw userError;
        
        let currentScore = 0;
        let metadata: any = { username: 'Player', games: [] };
        
        if (userData && userData.length > 0) {
          currentScore = userData[0].score || 0;
          metadata = userData[0].metadata || { username: 'Player', games: [] };
        }
        
        // Update metadata with game result
        if (!metadata.games) metadata.games = [];
        metadata.games = [...metadata.games.filter((g: any) => g.game_id !== gameId), gameMetadata];
        
        // Save updated data
        const { error } = await supabase
          .from("password_history")
          .upsert({
            user_id: user.id,
            score: currentScore + earnedXp,
            metadata,
            // Include other required fields
            password_hash: `game_${gameId}_${Date.now()}`, // This is just a placeholder
            length: 12, // Default values for required fields
            has_upper: true,
            has_lower: true,
            has_digit: true,
            has_special: true,
            is_common: false,
            has_common_pattern: false,
            entropy: 80
          });
        
        if (error) throw error;
        
        toast({
          title: "Progress Saved!",
          description: `You've earned ${earnedXp} XP for completing ${game?.title}!`,
        });
      } catch (error) {
        console.error("Error saving game progress:", error);
        toast({
          title: "Error saving progress",
          description: "Your game score couldn't be saved to the leaderboard.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: `Game Completed!`,
        description: `You scored ${score} points. Sign in to save your progress.`,
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500 hover:bg-green-600";
      case "intermediate":
        return "bg-blue-500 hover:bg-blue-600";
      case "advanced":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };

  const getBestScore = (gameId: string) => {
    return recentScores[gameId] || 0;
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Gamepad2 className="mr-2 h-5 w-5 text-primary" />
          Password Security Games
        </CardTitle>
        <CardDescription>
          Test your security knowledge with interactive games
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map((game) => (
                <motion.div 
                  key={game.id}
                  className={`p-4 rounded-lg border ${game.available ? 'border-slate-200 dark:border-slate-700' : 'border-dashed border-slate-300 dark:border-slate-600'} hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {game.title}
                        </h3>
                        <Badge className={`${getLevelColor(game.level)} text-white`}>
                          {game.level.charAt(0).toUpperCase() + game.level.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {game.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <TimerIcon className="h-4 w-4 mr-1" />
                            <span>{game.points} XP</span>
                          </div>
                          {getBestScore(game.id) > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Best: {getBestScore(game.id)}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          onClick={() => startGame(game)} 
                          variant={game.available ? "default" : "outline"}
                          disabled={!game.available || game.comingSoon}
                        >
                          {game.available ? "Play" : "Coming Soon"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="available" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.filter(game => game.available).map((game) => (
                <motion.div 
                  key={game.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {game.title}
                        </h3>
                        <Badge className={`${getLevelColor(game.level)} text-white`}>
                          {game.level.charAt(0).toUpperCase() + game.level.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {game.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <TimerIcon className="h-4 w-4 mr-1" />
                            <span>{game.points} XP</span>
                          </div>
                          {getBestScore(game.id) > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Best: {getBestScore(game.id)}
                            </Badge>
                          )}
                        </div>
                        <Button onClick={() => startGame(game)}>
                          Play
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coming-soon" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.filter(game => game.comingSoon).map((game) => (
                <motion.div 
                  key={game.id}
                  className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {game.title}
                        </h3>
                        <Badge className={`${getLevelColor(game.level)} text-white`}>
                          {game.level.charAt(0).toUpperCase() + game.level.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {game.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <TimerIcon className="h-4 w-4 mr-1" />
                          <span>{game.points} XP</span>
                        </div>
                        <Button variant="outline" disabled>
                          Coming Soon
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Game Dialog */}
        <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedGame?.title}</DialogTitle>
              <DialogDescription>
                {selectedGame?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {activeGameComponent}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowGameDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PasswordGames;
