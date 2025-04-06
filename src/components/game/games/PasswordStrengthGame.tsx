
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import { Badge } from "@/components/ui/badge";

interface PasswordStrengthGameProps {
  onComplete: (score: number) => void;
}

interface PasswordOption {
  password: string;
  score: number;
}

const PasswordStrengthGame = ({ onComplete }: PasswordStrengthGameProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<PasswordOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Generate password options for current round
  useEffect(() => {
    if (gameComplete) return;
    
    // Generate three unique passwords with different strength levels
    const passwordOptions: PasswordOption[] = [];
    
    // Weak password
    passwordOptions.push({
      password: generatePassword('weak'),
      score: 1
    });
    
    // Medium password
    passwordOptions.push({
      password: generatePassword('medium'),
      score: 2
    });
    
    // Strong password
    passwordOptions.push({
      password: generatePassword('strong'),
      score: 4
    });
    
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
    
  }, [currentRound, gameComplete]);

  // Handle password selection
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    
    // Check if selection is correct
    if (index === correctIndex) {
      setScore(score + 20);
    }
    
    // Wait a bit before moving to next round
    setTimeout(() => {
      if (currentRound < totalRounds) {
        setCurrentRound(currentRound + 1);
        setSelectedIndex(null);
      } else {
        setGameComplete(true);
        onComplete(score + (index === correctIndex ? 20 : 0));
      }
    }, 2000);
  };

  // Generate password based on desired strength
  const generatePassword = (strength: 'weak' | 'medium' | 'strong'): string => {
    const commonWords = ['password', 'welcome', 'admin', 'user', 'login', 'hello', 'secret'];
    
    if (strength === 'weak') {
      // Simple common password or just lowercase
      return Math.random() > 0.5 ? 
        commonWords[Math.floor(Math.random() * commonWords.length)] : 
        generateRandomString(5, 'abcdefghijklmnopqrstuvwxyz');
    }
    
    if (strength === 'medium') {
      // Mix of lowercase and numbers or capitalized common word with number
      return Math.random() > 0.5 ? 
        generateRandomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789') :
        capitalize(commonWords[Math.floor(Math.random() * commonWords.length)]) + 
        Math.floor(Math.random() * 100);
    }
    
    // Strong password
    return generateRandomString(12, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()');
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

  return (
    <div className="space-y-6">
      {!gameComplete ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Password Strength Challenge</h3>
              <p className="text-sm text-muted-foreground">
                Select the strongest password in each round
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              Round {currentRound}/{totalRounds}
            </Badge>
          </div>
          
          <Progress value={(currentRound / totalRounds) * 100} className="h-2 mb-6" />
          
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
                  <div className="font-mono text-lg">{option.password}</div>
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
          <h3 className="text-xl font-bold mb-2">Challenge Complete!</h3>
          <p className="text-3xl font-bold text-primary mb-4">{score}/100</p>
          <p className="mb-6">
            You've completed the Password Strength Challenge!
          </p>
          <Button onClick={() => onComplete(score)}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthGame;
