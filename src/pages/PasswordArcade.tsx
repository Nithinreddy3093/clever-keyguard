
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Gamepad2, Skull, Flame, Trophy, Crown, Lock, 
  Key, Star, Shield, Zap, Brain, Bot
} from "lucide-react";
import { motion } from "framer-motion";
import PasswordArcadeIntro from "@/components/game/PasswordArcadeIntro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementPopup from "@/components/game/AchievementPopup";
import { Achievement } from "@/components/SecretAchievements";
import useGameProgress from "@/hooks/useGameProgress";
import { toast } from "@/hooks/use-toast";

const PasswordArcade = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedTab, setSelectedTab] = useState("generators");
  const [selectedGenerator, setSelectedGenerator] = useState<string | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const { 
    playerLevel, 
    addXp, 
    achievements, 
    setAchievements,
    dailyStreak
  } = useGameProgress();
  
  // Check local storage to see if they've seen the intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('passwordArcadeIntroSeen');
    if (hasSeenIntro === 'true') {
      setShowIntro(false);
    }
    
    // Show "welcome back" achievement if returning with a streak
    if (dailyStreak > 1 && !achievements.find(a => a.id === "returningHero")?.unlocked) {
      const newAchievement: Achievement = {
        id: "returningHero",
        title: "Returning Hero",
        description: `You've returned for ${dailyStreak} days in a row!`,
        icon: <Flame className="h-5 w-5 text-amber-500" />,
        unlocked: true,
        secret: false,
        rarity: dailyStreak > 5 ? "legendary" : dailyStreak > 3 ? "rare" : "uncommon"
      };
      
      // Show achievement popup
      setTimeout(() => {
        setShowAchievement(newAchievement);
        
        // Add to achievements list
        const updatedAchievements = [...achievements, newAchievement];
        setAchievements(updatedAchievements);
        localStorage.setItem("passwordAchievements", JSON.stringify(updatedAchievements));
        
        // Award XP based on streak
        const streakXp = dailyStreak * 15;
        addXp(streakXp);
        toast({
          title: "Daily Streak Bonus!",
          description: `You earned ${streakXp} XP for your ${dailyStreak}-day streak!`,
        });
      }, 1500);
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
  
  const unlockGenerator = (generatorId: string) => {
    // Award XP for trying to unlock
    addXp(5);
    
    const generator = generators.find(g => g.id === generatorId);
    if (!generator) return;
    
    if (generator.unlocked) {
      setSelectedGenerator(generatorId);
      return;
    }
    
    // Check if player meets requirements
    if (playerLevel >= (generator.levelRequired || 0)) {
      toast({
        title: "Generator Unlocked!",
        description: `You've unlocked the ${generator.name} generator!`,
      });
      
      // Save unlocked status to local storage
      const unlockedGenerators = JSON.parse(localStorage.getItem('unlockedGenerators') || '{}');
      unlockedGenerators[generatorId] = true;
      localStorage.setItem('unlockedGenerators', JSON.stringify(unlockedGenerators));
      
      // Refresh the list
      setSelectedGenerator(generatorId);
      
      // Award XP
      addXp(25);
    } else {
      toast({
        title: "Generator Locked",
        description: `You need to reach level ${generator.levelRequired} to unlock this generator.`,
        variant: "destructive"
      });
    }
  };
  
  // Get unlocked generators from local storage
  const unlockedGeneratorsMap = JSON.parse(localStorage.getItem('unlockedGenerators') || '{}');
  
  const generators = [
    {
      id: "classic",
      name: "Classic Strength Test",
      theme: "Normal password test",
      requirement: "Free / Default",
      unlocked: true,
      levelRequired: 1,
      icon: <Lock className="h-5 w-5 text-primary" />,
      description: "Test your passwords against our advanced AI analysis engine"
    },
    {
      id: "shadow",
      name: "Shadow Codename Forge",
      theme: "Alias + password",
      requirement: "Level 2+",
      unlocked: playerLevel >= 2 || unlockedGeneratorsMap["shadow"],
      levelRequired: 2,
      icon: <Skull className="h-5 w-5 text-red-500" />,
      description: "Generate secure codenames paired with strong passwords for maximum protection"
    },
    {
      id: "emoji",
      name: "Emoji Craze Generator",
      theme: "Emojis + chaos",
      requirement: "Level 3+",
      unlocked: playerLevel >= 3 || unlockedGeneratorsMap["emoji"],
      levelRequired: 3,
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      description: "Create memorable passwords with emoji patterns that are surprisingly secure"
    },
    {
      id: "monster",
      name: "Monster Mash Passcodes",
      theme: "Mythical + battle",
      requirement: "Level 4+",
      unlocked: playerLevel >= 4 || unlockedGeneratorsMap["monster"],
      levelRequired: 4,
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      description: "Summon legendary creatures to forge passwords of mythic strength"
    },
    {
      id: "spellbook",
      name: "Ancient Spellbook Mode",
      theme: "Latin-style spell passwords",
      requirement: "Level 5+",
      unlocked: playerLevel >= 5 || unlockedGeneratorsMap["spellbook"],
      levelRequired: 5,
      icon: <Key className="h-5 w-5 text-amber-500" />,
      description: "Cast powerful protection spells with Latin-inspired incantations"
    },
    {
      id: "chest",
      name: "Locked Chest Puzzle",
      theme: "Riddle-based password",
      requirement: "Level 6+",
      unlocked: playerLevel >= 6 || unlockedGeneratorsMap["chest"],
      levelRequired: 6,
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      description: "Solve riddles to create memorable yet highly secure passwords"
    },
    {
      id: "scifi",
      name: "Sci-Fi Synth Generator",
      theme: "Time travel + robots",
      requirement: "Level 7+",
      unlocked: playerLevel >= 7 || unlockedGeneratorsMap["scifi"],
      levelRequired: 7,
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      description: "Generate futuristic passwords inspired by sci-fi universes and technology"
    },
    {
      id: "chaos",
      name: "Chaos Dice (Randomizer)",
      theme: "Meme + myth + madness",
      requirement: "Level 8+",
      unlocked: playerLevel >= 8 || unlockedGeneratorsMap["chaos"],
      levelRequired: 8,
      icon: <Zap className="h-5 w-5 text-primary" />,
      description: "Roll the chaos dice for truly unpredictable password combinations"
    }
  ];

  const challenges = [
    {
      id: "dailyStreak",
      name: "Daily Login Challenge",
      description: "Log in 7 days in a row to earn exclusive rewards",
      progress: `${dailyStreak}/7 days`,
      progressPercent: (dailyStreak / 7) * 100,
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      reward: "250 XP + Rare Achievement"
    },
    {
      id: "passwordMaster",
      name: "Password Mastery",
      description: "Test 20 different passwords in the analyzer",
      progress: "0/20 passwords",
      progressPercent: 0,
      icon: <Shield className="h-5 w-5 text-primary" />,
      reward: "200 XP + Generator Unlock"
    },
    {
      id: "gameChampion",
      name: "Game Champion",
      description: "Win 5 password mini-games with 90%+ score",
      progress: "0/5 games",
      progressPercent: 0,
      icon: <Gamepad2 className="h-5 w-5 text-green-500" />,
      reward: "300 XP + Legendary Title"
    },
    {
      id: "securityGuru",
      name: "Security Guru",
      description: "Chat with the AI assistant 3 times",
      progress: "0/3 conversations",
      progressPercent: 0,
      icon: <Bot className="h-5 w-5 text-blue-500" />,
      reward: "150 XP + Exclusive Theme"
    }
  ];

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
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white">Level {playerLevel}</span>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/password-game">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Play Mini-Games
                </Link>
              </Button>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="generators" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Generators</span>
                  <span className="sm:hidden">Gens</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Challenges</span>
                  <span className="sm:hidden">Quests</span>
                </TabsTrigger>
                <TabsTrigger value="rewards" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Rewards</span>
                  <span className="sm:hidden">Loot</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generators" className="space-y-6">
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
                    {generators.map((generator, index) => (
                      <motion.div
                        key={generator.id}
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
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                          {generator.description}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {generator.requirement}
                          </span>
                          {generator.unlocked ? (
                            <Button 
                              size="sm" 
                              onClick={() => unlockGenerator(generator.id)}
                              className={selectedGenerator === generator.id ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {selectedGenerator === generator.id ? "Selected" : "Use Generator"}
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => unlockGenerator(generator.id)}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              Unlock
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
            
                {selectedGenerator && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 border rounded-lg bg-white dark:bg-slate-800"
                  >
                    <h2 className="text-xl font-bold mb-4">
                      {generators.find(g => g.id === selectedGenerator)?.name || "Password Generator"}
                    </h2>
                    
                    <div className="p-10 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded">
                      <p className="text-slate-600 dark:text-slate-300">
                        Generator functionality will be implemented soon!
                      </p>
                      <Button asChild className="mt-4">
                        <Link to="/theme-passwords">
                          Try Theme Password Generator
                        </Link>
                      </Button>
                    </div>
                  </motion.section>
                )}
              </TabsContent>
              
              <TabsContent value="challenges" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    🏆 Password Challenges
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Complete challenges to earn XP and unlock rewards
                  </p>
                </div>
                
                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 border rounded-lg bg-white dark:bg-slate-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {challenge.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white">{challenge.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 my-1">
                            {challenge.description}
                          </p>
                          
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{challenge.progress}</span>
                              <span className="text-primary">{challenge.reward}</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${challenge.progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="rewards" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    🎁 Shadow Rewards
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Earn exclusive titles and special features
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 border rounded-lg bg-white dark:bg-slate-800">
                    <div className="text-center mb-4">
                      <div className="inline-block p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-2">
                        <Crown className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold">Shadow Titles</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-slate-400 mr-2" />
                          <span>Password Novice</span>
                        </div>
                        <span className="text-xs text-green-500">Unlocked</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-blue-500 mr-2" />
                          <span>Security Apprentice</span>
                        </div>
                        <span className="text-xs text-green-500">Unlocked</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-purple-500 mr-2" />
                          <span>Encryption Guardian</span>
                        </div>
                        <span className="text-xs">Level 5 Required</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Crown className="h-4 w-4 text-amber-500 mr-2" />
                          <span>Shadow Sovereign</span>
                        </div>
                        <span className="text-xs">Level 10 Required</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 border rounded-lg bg-white dark:bg-slate-800">
                    <div className="text-center mb-4">
                      <div className="inline-block p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
                        <Skull className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold">Special Abilities</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-amber-500 mr-2" />
                          <span>Password History</span>
                        </div>
                        <span className="text-xs text-green-500">Unlocked</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-purple-500 mr-2" />
                          <span>Dark Theme</span>
                        </div>
                        <span className="text-xs text-green-500">Unlocked</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 text-blue-500 mr-2" />
                          <span>Password Analysis+</span>
                        </div>
                        <span className="text-xs">Level 4 Required</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 text-green-500 mr-2" />
                          <span>AI Assistant Pro</span>
                        </div>
                        <span className="text-xs">Level 8 Required</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link to="/rankings">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Shadow Realm Leaderboard
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        <AchievementPopup 
          achievement={showAchievement} 
          onClose={() => setShowAchievement(null)} 
        />
      </div>
    </div>
  );
};

export default PasswordArcade;
