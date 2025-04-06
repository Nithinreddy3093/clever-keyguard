
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Gamepad2, Skull, Flame, Trophy, Crown, Lock, Key, Star } from "lucide-react";
import { motion } from "framer-motion";
import PasswordArcadeIntro from "@/components/game/PasswordArcadeIntro";

const PasswordArcade = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [playerLevel, setPlayerLevel] = useState(1);
  
  // Check local storage to see if they've seen the intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('passwordArcadeIntroSeen');
    if (hasSeenIntro === 'true') {
      setShowIntro(false);
    }
    
    // For demo purposes, get player level from localStorage or default to 1
    const savedLevel = localStorage.getItem('arcadePlayerLevel');
    if (savedLevel) {
      setPlayerLevel(parseInt(savedLevel, 10));
    }
  }, []);

  // Save that they've seen the intro
  useEffect(() => {
    if (!showIntro) {
      localStorage.setItem('passwordArcadeIntroSeen', 'true');
    }
  }, [showIntro]);

  const handleEnterArcade = () => {
    setShowIntro(false);
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
            <div className="relative">
              <Gamepad2 className="h-12 w-12 text-primary" />
              <Skull className="h-7 w-7 text-red-500 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            PASSWORD ARCADE
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Temple of Password Doom
          </p>
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">
            Unlock generators, play mini-games, and climb the shadow leaderboard!
          </p>
        </header>
        
        {showIntro ? (
          <PasswordArcadeIntro onEnter={handleEnterArcade} playerLevel={playerLevel} />
        ) : (
          <div className="space-y-8">
            <section>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  🔓 Unlockable Generators
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Unlock powerful password generators as you progress
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Classic Strength Test",
                    theme: "Normal password test",
                    requirement: "Free / Default",
                    unlocked: true,
                    icon: <Lock className="h-5 w-5 text-primary" />
                  },
                  {
                    name: "Shadow Codename Forge",
                    theme: "Alias + password",
                    requirement: "Score 20+",
                    unlocked: playerLevel >= 2,
                    icon: <Skull className="h-5 w-5 text-red-500" />
                  },
                  {
                    name: "Emoji Craze Generator",
                    theme: "Emojis + chaos",
                    requirement: "Share the site / Play 2 games",
                    unlocked: false,
                    icon: <Star className="h-5 w-5 text-yellow-500" />
                  },
                  {
                    name: "Monster Mash Passcodes",
                    theme: "Mythical + battle",
                    requirement: "Solve mini puzzle",
                    unlocked: false,
                    icon: <Flame className="h-5 w-5 text-orange-500" />
                  },
                  {
                    name: "Ancient Spellbook Mode",
                    theme: "Latin-style spell passwords",
                    requirement: "3-day login streak",
                    unlocked: false,
                    icon: <Key className="h-5 w-5 text-amber-500" />
                  },
                  {
                    name: "Locked Chest Puzzle",
                    theme: "Riddle-based password",
                    requirement: "Win leaderboard challenge",
                    unlocked: false,
                    icon: <Trophy className="h-5 w-5 text-yellow-500" />
                  },
                  {
                    name: "Sci-Fi Synth Generator",
                    theme: "Time travel + robots",
                    requirement: "Score 80+",
                    unlocked: false,
                    icon: <Crown className="h-5 w-5 text-purple-500" />
                  },
                  {
                    name: "Chaos Dice (Randomizer)",
                    theme: "Meme + myth + madness",
                    requirement: "Win 5 games / Invite a friend",
                    unlocked: false,
                    icon: <Gamepad2 className="h-5 w-5 text-primary" />
                  }
                ].map((generator, index) => (
                  <motion.div
                    key={generator.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${generator.unlocked ? 
                      'bg-white dark:bg-slate-800 border-primary/20' : 
                      'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${generator.unlocked ? 'bg-primary/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {generator.icon}
                      </div>
                      <div>
                        <h3 className={`font-medium ${generator.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {generator.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {generator.theme}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {generator.requirement}
                      </span>
                      {generator.unlocked ? (
                        <Button size="sm">Use Generator</Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
            
            <section>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  🎮 Mini Games
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Win points and unlock special features
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 rounded-lg bg-white dark:bg-slate-800 border border-primary/20"
                >
                  <h3 className="text-lg font-bold mb-2 flex items-center">
                    <div className="p-2 rounded-full bg-yellow-500/10 mr-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    Shadow Leaderboard
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Compete for top ranks and earn exclusive titles
                  </p>
                  <div className="text-sm">
                    <p className="mb-1 flex items-center">
                      <Crown className="h-4 w-4 text-yellow-500 mr-1" /> 
                      <span className="font-medium">S:</span> 
                      <span className="ml-1 text-slate-600 dark:text-slate-400">Shadow Sovereign</span>
                    </p>
                    <p className="mb-1 flex items-center">
                      <Crown className="h-4 w-4 text-slate-400 mr-1" /> 
                      <span className="font-medium">A:</span> 
                      <span className="ml-1 text-slate-600 dark:text-slate-400">Nightmare Warden</span>
                    </p>
                    <Button className="mt-3 w-full" asChild>
                      <Link to="/rankings">View Leaderboard</Link>
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-6 rounded-lg bg-white dark:bg-slate-800 border border-primary/20"
                >
                  <h3 className="text-lg font-bold mb-2 flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 mr-2">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                    </div>
                    Password Mini-Games
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Test your skills and earn XP through fun challenges
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/password-game">Play Mini-Games</Link>
                  </Button>
                </motion.div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordArcade;
