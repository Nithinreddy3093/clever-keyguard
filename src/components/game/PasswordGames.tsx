
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Lock, PhoneIcon, Brain, X, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BruteForceGame from "./games/BruteForceGame";
import PhishingGame from "./games/PhishingGame";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import useGameProgress from "@/hooks/useGameProgress";
import { motion } from "framer-motion";

const PasswordGames = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGameDialog, setShowGameDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addXp, checkGlobalRank } = useGameProgress();

  const games = [
    {
      id: "bruteforce",
      title: "Hack the Password",
      description: "Test your skills against common passwords in a realistic hacking scenario.",
      icon: <Lock className="h-6 w-6" />,
      difficulty: "Beginner",
      baseXp: 100,
      component: (props: any) => <BruteForceGame {...props} />
    },
    {
      id: "phishing",
      title: "Phishing Mastermind",
      description: "Spot phishing attempts and protect your credentials in this security awareness game.",
      icon: <PhoneIcon className="h-6 w-6" />,
      difficulty: "Intermediate",
      baseXp: 150,
      component: (props: any) => <PhishingGame {...props} />
    }
  ];

  const handleGameComplete = (gameId: string, score: number) => {
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    // Calculate XP based on score and difficulty
    const earnedXp = Math.round((score / 100) * game.baseXp);
    
    // Award XP to player
    addXp(earnedXp);
    
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
    setActiveGame(gameId);
    setShowGameDialog(true);
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
        {user ? (
          <Badge variant="outline" className="mt-2 bg-primary/10">
            <Trophy className="h-3.5 w-3.5 mr-1 text-primary" />
            Your scores will be saved to the Shadow Realm Leaderboard
          </Badge>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Sign in to save your game scores to the Shadow Realm Leaderboard
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="h-full flex flex-col transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {game.icon}
                  </div>
                  <Badge variant={game.difficulty === "Beginner" ? "outline" : "secondary"}>
                    {game.difficulty}
                  </Badge>
                </div>
                <CardTitle>{game.title}</CardTitle>
                <CardDescription>
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Base XP:</span>
                    <span className="font-medium">{game.baseXp} XP</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => startGame(game.id)} 
                  className="w-full"
                >
                  Play Now
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
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
    </div>
  );
};

export default PasswordGames;
