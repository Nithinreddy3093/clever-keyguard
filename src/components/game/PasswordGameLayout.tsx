
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gamepad2, Skull, Trophy, Bot, Shield } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import useGameProgress from "@/hooks/useGameProgress";
import { Progress } from "@/components/ui/progress";

interface PasswordGameLayoutProps {
  children: ReactNode;
  showBackToArcade?: boolean;
}

const PasswordGameLayout = ({ children, showBackToArcade = true }: PasswordGameLayoutProps) => {
  const navigate = useNavigate();
  const { playerLevel, playerXp, levelProgress, nextLevelXp } = useGameProgress();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          {showBackToArcade && (
            <Button variant="ghost" onClick={() => navigate("/password-arcade")} className="flex items-center">
              <Skull className="h-4 w-4 mr-2 text-red-500" />
              Arcade Hub
            </Button>
          )}
        </div>
        
        <header className="text-center mb-10">
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <Gamepad2 className="h-12 w-12 text-primary" />
              <Skull className="h-7 w-7 text-red-500 absolute -bottom-2 -right-2" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            PASSWORD ARCADE
          </motion.h1>
          <motion.p 
            className="text-xl text-slate-600 dark:text-slate-300"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Temple of Password Doom
          </motion.p>
        </header>
        
        {mounted && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-4 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">Level {playerLevel}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {playerXp} XP
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {levelProgress} / {nextLevelXp} XP to next level
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/rankings">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Leaderboard</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/chat">
                    <Bot className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">AI Assistant</span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <Progress value={(levelProgress / nextLevelXp) * 100} className="h-2" />
          </div>
        )}
        
        {children}
        
        <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Complete quests and challenges to earn XP and climb the leaderboard.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link to="/rankings">Leaderboard</Link>
            </Button>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link to="/password-arcade">Arcade Hub</Link>
            </Button>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link to="/chat">AI Assistant</Link>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PasswordGameLayout;
