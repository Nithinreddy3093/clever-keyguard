
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analyzePassword } from "@/lib/password/analyzer";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Star, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordStrengthGameProps {
  onComplete: (score: number) => void;
}

interface PasswordOption {
  password: string;
  score: number;
  entropy: number;
  attackResistance: number;
}

const PasswordStrengthGame = ({ onComplete }: PasswordStrengthGameProps) => {
  const { toast } = useToast();
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<PasswordOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [challengeMode, setChallengeMode] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  
  // Challenge types for added difficulty
  const challengeTypes = [
    "Must contain an emoji",
    "No more than 2 repeating characters",
    "Must include a special character",
    "Must include both uppercase and lowercase",
    "Must be palindromic"
  ];
  
  // Generate password options for current round
  useEffect(() => {
    if (gameComplete) return;
    
    // Generate three unique passwords with different strength levels
    const passwordOptions: PasswordOption[] = [];
    
    // Weak password
    passwordOptions.push(generatePasswordWithStrength('weak'));
    
    // Medium password
    passwordOptions.push(generatePasswordWithStrength('medium'));
    
    // Strong password
    passwordOptions.push(generatePasswordWithStrength('strong'));
    
    // Shuffle the options
    const shuffled = [...passwordOptions].sort(() => 0.5 - Math.random());
    setOptions(shuffled);
    
    // Find the correct answer (strongest password)
    const strongestIndex = shuffled.reduce(
      (maxIndex, current, currentIndex, arr) => 
        current.score > arr[maxIndex].score ? currentIndex : maxIndex, 
      0
    );
    setCorrectIndex(strongestIndex);
    
    // Set a random challenge for advanced rounds
    if (currentRound > 2) {
      const randomChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      setChallengeMode(randomChallenge);
    } else {
      setChallengeMode(null);
    }
    
  }, [currentRound, gameComplete]);

  // Handle password selection
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    
    // Check if selection is correct
    if (index === correctIndex) {
      const roundPoints = 20 + (currentRound * 2);
      setScore(score + roundPoints);
      setStreakCount(streakCount + 1);
      
      // Bonus for streak
      if (streakCount >= 2) {
        const streakBonus = streakCount * 5;
        setScore(prevScore => prevScore + streakBonus);
        
        toast({
          title: `${streakCount + 1}x Streak!`,
          description: `+${streakBonus} bonus points!`,
          duration: 2000,
        });
      }
      
      // Special achievement for perfect game
      if (currentRound === totalRounds && streakCount + 1 === totalRounds) {
        toast({
          title: "Achievement Unlocked!",
          description: "Entropy Blade: Perfect strength judgment!",
          duration: 3000,
        });
      }
    } else {
      setStreakCount(0);
    }
    
    // Wait a bit before moving to next round
    setTimeout(() => {
      if (currentRound < totalRounds) {
        setCurrentRound(currentRound + 1);
        setSelectedIndex(null);
      } else {
        setGameComplete(true);
        onComplete(score + (index === correctIndex ? 20 + (currentRound * 2) : 0));
      }
    }, 2000);
  };

  // Generate password based on desired strength with more detailed properties
  const generatePasswordWithStrength = (strength: 'weak' | 'medium' | 'strong'): PasswordOption => {
    const commonWords = ['password', 'welcome', 'admin', 'user', 'login', 'hello', 'secret'];
    let generatedPassword = '';
    
    if (strength === 'weak') {
      // Simple common password or just lowercase
      generatedPassword = Math.random() > 0.5 ? 
        commonWords[Math.floor(Math.random() * commonWords.length)] : 
        generateRandomString(5, 'abcdefghijklmnopqrstuvwxyz');
    } else if (strength === 'medium') {
      // Mix of lowercase and numbers or capitalized common word with number
      generatedPassword = Math.random() > 0.5 ? 
        generateRandomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789') :
        capitalize(commonWords[Math.floor(Math.random() * commonWords.length)]) + 
        Math.floor(Math.random() * 100);
    } else {
      // Strong password
      generatedPassword = generateRandomString(12, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()');
    }
    
    // Apply challenge mode modifications if needed
    if (challengeMode === "Must contain an emoji" && strength === 'strong') {
      const emojis = ['😀', '🔒', '🚀', '⭐', '🔑'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      generatedPassword = generatedPassword.substring(0, generatedPassword.length - 1) + randomEmoji;
    }
    
    // Run password through analyzer to get its metrics
    const analysis = analyzePassword(generatedPassword);
    
    return {
      password: generatedPassword,
      score: analysis.score,
      entropy: analysis.entropy,
      attackResistance: analysis.attackResistance.overall
    };
  };

  // Helper functions
  const generateRandomString = (length: number, charset: string): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };
  
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Get colored strength badge based on score
  const getStrengthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Strong</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge className="bg-red-500">Weak</Badge>;
  };

  return (
    <div className="space-y-6">
      {!gameComplete ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Entropy Arena</h3>
              <p className="text-sm text-muted-foreground">
                Select the strongest password in each round
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10">
                Round {currentRound}/{totalRounds}
              </Badge>
              {streakCount > 0 && (
                <Badge variant="outline" className="bg-amber-500/20 text-amber-500">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> {streakCount}x Streak
                </Badge>
              )}
            </div>
          </div>
          
          <Progress value={(currentRound / totalRounds) * 100} className="h-2 mb-6" />
          
          {challengeMode && (
            <div className="mb-4 p-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md text-sm">
              <span className="font-semibold">Challenge:</span> {challengeMode}
            </div>
          )}
          
          <div className="space-y-4">
            {options.map((option, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedIndex === index 
                    ? (correctIndex === index 
                      ? "border-green-500 shadow-md" 
                      : "border-red-500 shadow-md") 
                    : "hover:border-primary hover:shadow-sm"
                }`}
                onClick={() => selectedIndex === null && handleSelect(index)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="font-mono text-lg">{option.password}</div>
                    <div className="flex flex-col items-end">
                      {selectedIndex !== null && (
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Entropy:</span>
                            <Progress 
                              value={Math.min(100, option.entropy)} 
                              className="h-1 w-16" 
                              indicatorClassName={option.entropy > 70 ? "bg-green-500" : option.entropy > 40 ? "bg-yellow-500" : "bg-red-500"} 
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Defense:</span>
                            <Progress 
                              value={option.attackResistance} 
                              className="h-1 w-16" 
                              indicatorClassName={option.attackResistance > 70 ? "bg-green-500" : option.attackResistance > 40 ? "bg-yellow-500" : "bg-red-500"} 
                            />
                          </div>
                        </div>
                      )}
                      {getStrengthBadge(option.score)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Current score: <span className="font-medium">{score}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Challenge Complete!</h3>
          <p className="text-3xl font-bold text-primary mb-4">{score}/100</p>
          <p className="mb-6">
            You've completed the Entropy Arena!
          </p>
          <Button onClick={() => onComplete(score)}>
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthGame;
