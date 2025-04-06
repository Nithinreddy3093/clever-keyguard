
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gamepad2, Swords, Shield, Skull, Flame, Trophy, Crown, Lock, Key, Star } from "lucide-react";

interface PasswordArcadeIntroProps {
  onEnter: () => void;
  playerLevel: number;
}

const PasswordArcadeIntro = ({ onEnter, playerLevel }: PasswordArcadeIntroProps) => {
  const [showFullIntro, setShowFullIntro] = useState(false);

  // Show the full intro after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFullIntro(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-center mb-6"
      >
        <div className="relative">
          <Skull className="h-16 w-16 text-red-500" />
          <Lock className="h-8 w-8 absolute bottom-0 right-0 text-slate-800" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-4xl sm:text-5xl font-extrabold mb-2 text-red-500 tracking-tight"
      >
        TEMPLE OF PASSWORD DOOM
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex items-center justify-center space-x-2 mb-4"
      >
        <Swords className="h-5 w-5 text-yellow-500" />
        <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">PASSWORD ARCADE</p>
        <Swords className="h-5 w-5 text-yellow-500" />
      </motion.div>
      
      {showFullIntro && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-lg mx-auto space-y-6"
        >
          <p className="text-slate-700 dark:text-slate-300">
            Welcome, brave warrior of Level {playerLevel}! 
            Enter the Temple of Password Doom, where your security skills will be tested and forged.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
              <Gamepad2 className="h-5 w-5 text-primary mb-1" />
              <p>Mini-Games</p>
            </div>
            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
              <Key className="h-5 w-5 text-amber-500 mb-1" />
              <p>Unlockables</p>
            </div>
            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
              <p>Leaderboards</p>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={onEnter}
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              <Flame className="mr-2 h-5 w-5" />
              ENTER THE TEMPLE
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PasswordArcadeIntro;
