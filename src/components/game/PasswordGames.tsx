import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Gamepad2, TimerIcon, BrainCircuit, KeySquare, Lock, UserCheck, TerminalSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

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

// Individual game components - will be implemented in separate files
const BruteForceGame = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Hack the Password</h2>
    <p className="mb-6">Crack weak passwords as an ethical hacker.</p>
    <p className="text-lg text-center text-muted-foreground">Game content coming soon!</p>
  </div>
);

const PhishingGame = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Phishing Mastermind</h2>
    <p className="mb-6">Identify fake vs. real websites & emails.</p>
    <p className="text-lg text-center text-muted-foreground">Game content coming soon!</p>
  </div>
);

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

  const startGame = (game: GameInfo) => {
    setSelectedGame(game);
    
    // Determine which game component to show based on selected game
    switch (game.id) {
      case "brute-force":
        setActiveGameComponent(<BruteForceGame />);
        break;
      case "phishing":
        setActiveGameComponent(<PhishingGame />);
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
                <div 
                  key={game.id}
                  className={`p-4 rounded-lg border ${game.available ? 'border-slate-200 dark:border-slate-700' : 'border-dashed border-slate-300 dark:border-slate-600'} hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}
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
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="available" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.filter(game => game.available).map((game) => (
                <div 
                  key={game.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
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
                        <Button onClick={() => startGame(game)}>
                          Play
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coming-soon" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.filter(game => game.comingSoon).map((game) => (
                <div 
                  key={game.id}
                  className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
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
                </div>
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
