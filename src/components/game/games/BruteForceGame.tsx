
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Clock, Lock, Shield, CheckCircle, X, ZapOff, AlertTriangle, ArrowRight, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BruteForceGameProps {
  onComplete: (score: number) => void;
}

type PasswordCharacterState = {
  char: string;
  status: "correct" | "wrong-position" | "incorrect" | "unknown";
};

const BruteForceGame = ({ onComplete }: BruteForceGameProps) => {
  const { toast } = useToast();
  const [targetPassword, setTargetPassword] = useState("");
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [attemptResults, setAttemptResults] = useState<PasswordCharacterState[][]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [victory, setVictory] = useState(false);
  const [firewallHealth, setFirewallHealth] = useState(100);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [remainingGuesses, setRemainingGuesses] = useState(10);
  const [hintUsed, setHintUsed] = useState(false);
  const [bruteForceModeActive, setBruteForceModeActive] = useState(false);
  const [bruteForceCooldown, setBruteForceCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Password pools by difficulty
  const passwordPools = {
    easy: [
      "admin", "login", "secure", "server", "access",
      "system", "network", "portal", "digital", "cyber"
    ],
    medium: [
      "secure123", "network01", "admin2023", "Portal!21", "Access#99",
      "Server2022", "System!23", "Tech#User", "Data$2023", "WebAccess1"
    ],
    hard: [
      "S3cur3_N3tw0rk!", "Adm1n@P0rtal#22", "Syst3m$Acc3ss99", "D@ta_S3rv3r!21", "N3tw0rk#Us3r!23",
      "C0rp0r@te$2023!", "S3rv3r@Acc3ss#1", "Digit@l_P0rt@l!22", "T3ch$Pl@tf0rm#1", "S3cur3_L0g1n!23"
    ]
  };

  // Initialize the game with a random password
  useEffect(() => {
    resetGame(difficulty);
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (!gameComplete) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    // Brute force cooldown timer
    if (bruteForceCooldown > 0 && !gameComplete) {
      const bruteForceCooldownInterval = setInterval(() => {
        setBruteForceCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => {
        clearInterval(interval!);
        clearInterval(bruteForceCooldownInterval);
      };
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameComplete, bruteForceCooldown]);

  // Reset game with selected difficulty
  const resetGame = (gameDifficulty: "easy" | "medium" | "hard") => {
    // Select random password from pool
    const pool = passwordPools[gameDifficulty];
    const randomPassword = pool[Math.floor(Math.random() * pool.length)];
    
    setTargetPassword(randomPassword);
    setGuess("");
    setAttempts([]);
    setAttemptResults([]);
    setGameComplete(false);
    setVictory(false);
    setTimer(0);
    setHintUsed(false);
    setBruteForceModeActive(false);
    setBruteForceCooldown(0);
    
    // Set firewall health and remaining guesses based on difficulty
    if (gameDifficulty === "easy") {
      setFirewallHealth(100);
      setRemainingGuesses(10);
    } else if (gameDifficulty === "medium") {
      setFirewallHealth(80);
      setRemainingGuesses(8);
    } else {
      setFirewallHealth(60);
      setRemainingGuesses(6);
    }
    
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle guess submission
  const handleGuess = () => {
    if (!guess || gameComplete) return;
    
    // Add to attempts list
    const newAttempts = [...attempts, guess];
    setAttempts(newAttempts);
    
    // Check result with Wordle-like feedback
    const result = checkGuess(guess);
    const newResults = [...attemptResults, result];
    setAttemptResults(newResults);
    
    // Reduce firewall health (more for incorrect guesses)
    const correctChars = result.filter(r => r.status === "correct").length;
    const percentCorrect = (correctChars / targetPassword.length) * 100;
    
    // Health reduction based on how incorrect the guess is
    const healthReduction = Math.max(5, 20 - Math.floor(percentCorrect / 5));
    setFirewallHealth(prevHealth => Math.max(0, prevHealth - healthReduction));
    
    // Decrement remaining guesses
    setRemainingGuesses(prev => prev - 1);
    
    // Check for victory
    if (guess.toLowerCase() === targetPassword.toLowerCase()) {
      handleVictory();
    }
    // Check for game over conditions
    else if (remainingGuesses <= 1 || firewallHealth - healthReduction <= 0) {
      handleGameOver();
    }
    
    // Reset guess field
    setGuess("");
  };

  // Check guess against target password
  const checkGuess = (currentGuess: string): PasswordCharacterState[] => {
    const result: PasswordCharacterState[] = [];
    const target = targetPassword.toLowerCase();
    const guessLower = currentGuess.toLowerCase();
    
    // First pass: find exact matches
    const targetChars = target.split('');
    const usedTargetIndices: boolean[] = Array(target.length).fill(false);
    
    // First mark correct positions
    for (let i = 0; i < guessLower.length; i++) {
      if (i < target.length && guessLower[i] === target[i]) {
        result.push({ char: currentGuess[i], status: "correct" });
        usedTargetIndices[i] = true;
      } else if (i >= target.length) {
        // Extra characters
        result.push({ char: currentGuess[i], status: "incorrect" });
      } else {
        result.push({ char: currentGuess[i], status: "unknown" });
      }
    }
    
    // Fill in for shorter guesses
    if (currentGuess.length < target.length) {
      for (let i = currentGuess.length; i < target.length; i++) {
        result.push({ char: " ", status: "unknown" });
      }
    }
    
    // Second pass: find wrong positions
    for (let i = 0; i < result.length; i++) {
      if (result[i].status === "unknown") {
        const char = guessLower[i];
        let foundInWrongPosition = false;
        
        for (let j = 0; j < target.length; j++) {
          if (!usedTargetIndices[j] && target[j] === char) {
            result[i].status = "wrong-position";
            usedTargetIndices[j] = true;
            foundInWrongPosition = true;
            break;
          }
        }
        
        if (!foundInWrongPosition) {
          result[i].status = "incorrect";
        }
      }
    }
    
    return result;
  };

  // Handle victory state
  const handleVictory = () => {
    setVictory(true);
    setGameComplete(true);
    
    // Calculate score based on:
    // - Remaining health
    // - Time taken
    // - Difficulty
    // - Number of attempts
    // - Whether hint was used
    
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2;
    const healthBonus = Math.round(firewallHealth / 2);
    const attemptsBonus = Math.max(0, 30 - (attempts.length * 5));
    const timeBonus = Math.max(0, 30 - Math.min(30, Math.floor(timer / 10)));
    const hintPenalty = hintUsed ? -15 : 0;
    
    const rawScore = Math.round((healthBonus + attemptsBonus + timeBonus + hintPenalty) * difficultyMultiplier);
    const finalScore = Math.min(100, Math.max(0, rawScore));
    
    setScore(finalScore);
    
    // Special achievement for very quick wins
    if (attempts.length <= 3) {
      toast({
        title: "Hacker Extraordinaire!",
        description: "You cracked the password in 3 or fewer attempts!",
        duration: 3000,
      });
    }
    
    toast({
      title: "Access Granted!",
      description: "You've successfully hacked the system!",
      duration: 2000,
    });
    
    // Notify completion after a short delay
    setTimeout(() => {
      onComplete(finalScore);
    }, 2000);
  };

  // Handle game over state
  const handleGameOver = () => {
    setVictory(false);
    setGameComplete(true);
    
    const difficultyValue = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;
    const attemptsValue = Math.min(20, attempts.length * 3);
    
    // Even on loss, award some points for effort
    const consolationScore = Math.min(40, difficultyValue + attemptsValue);
    setScore(consolationScore);
    
    toast({
      title: "Security Alert!",
      description: "The system detected your breach attempt and locked down.",
      variant: "destructive",
      duration: 2000,
    });
    
    // Notify completion after a short delay
    setTimeout(() => {
      onComplete(consolationScore);
    }, 2000);
  };

  // Get hint - reveals one character
  const getHint = () => {
    if (hintUsed || gameComplete) return;
    
    // Find a character position to reveal
    const existingCorrectPositions = new Set<number>();
    attemptResults.forEach(result => {
      result.forEach((char, idx) => {
        if (char.status === "correct") {
          existingCorrectPositions.add(idx);
        }
      });
    });
    
    // Find positions not yet guessed correctly
    const possiblePositions = [];
    for (let i = 0; i < targetPassword.length; i++) {
      if (!existingCorrectPositions.has(i)) {
        possiblePositions.push(i);
      }
    }
    
    // If all positions have been guessed correctly, can't give hint
    if (possiblePositions.length === 0) {
      toast({
        title: "No Hint Available",
        description: "You've already discovered all characters correctly!",
        duration: 2000,
      });
      return;
    }
    
    // Choose a random position to reveal
    const revealPosition = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    
    toast({
      title: "Hint Activated",
      description: `Character at position ${revealPosition + 1} is "${targetPassword[revealPosition]}"`,
      duration: 3000,
    });
    
    // Mark hint as used
    setHintUsed(true);
    
    // Health penalty for using hint
    setFirewallHealth(prevHealth => Math.max(0, prevHealth - 15));
  };

  // Activate brute force mode
  const activateBruteForce = () => {
    if (bruteForceModeActive || bruteForceCooldown > 0 || gameComplete) return;
    
    setBruteForceModeActive(true);
    
    // For gameplay purposes, brute force gives a likely character
    const knownPositions = new Map<number, string>();
    
    // Collect known correct characters
    attemptResults.forEach(result => {
      result.forEach((char, idx) => {
        if (char.status === "correct") {
          knownPositions.set(idx, char.char);
        }
      });
    });
    
    // Choose a position we don't know yet
    const unknownPositions = [];
    for (let i = 0; i < targetPassword.length; i++) {
      if (!knownPositions.has(i)) {
        unknownPositions.push(i);
      }
    }
    
    // If we know all positions, brute force is not needed
    if (unknownPositions.length === 0) {
      toast({
        title: "Brute Force Failed",
        description: "You've already discovered all characters!",
        variant: "destructive",
        duration: 2000,
      });
      setBruteForceModeActive(false);
      return;
    }
    
    // Show "brute forcing" animation for a few seconds
    let progress = 0;
    const totalSteps = 5;
    const interval = setInterval(() => {
      progress++;
      
      if (progress <= totalSteps) {
        toast({
          title: `Brute forcing... (${progress}/${totalSteps})`,
          description: "Scanning possible character combinations...",
          duration: 1000,
        });
      } else {
        clearInterval(interval);
        
        // Pick a random unknown position
        const targetPos = unknownPositions[Math.floor(Math.random() * unknownPositions.length)];
        
        // Return potential characters for this position (include correct one)
        const correctChar = targetPassword[targetPos].toLowerCase();
        
        // Create a set of potential characters with the correct one included
        const charPool = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        let potentialChars = new Set([correctChar]);
        
        // Add 2-4 random characters
        const numExtra = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numExtra; i++) {
          const randomChar = charPool[Math.floor(Math.random() * charPool.length)];
          potentialChars.add(randomChar);
        }
        
        toast({
          title: "Brute Force Results",
          description: `Position ${targetPos + 1} likely contains one of: ${[...potentialChars].join(', ')}`,
          duration: 3000,
        });
        
        // Health penalty
        setFirewallHealth(prevHealth => Math.max(0, prevHealth - 25));
        
        // Set cooldown
        setBruteForceModeActive(false);
        setBruteForceCooldown(15); // 15 second cooldown
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {!gameComplete ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <Terminal className="mr-2 h-5 w-5" /> 
                Terminal Breach
              </h3>
              <p className="text-sm text-muted-foreground">
                Crack the password using strategic guesses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                <Clock className="h-3.5 w-3.5 mr-1" /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </Badge>
              <Badge variant="outline" className="bg-primary/10">
                Attempts: {attempts.length}/{remainingGuesses}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1.5 text-blue-500" />
                <span className="text-sm">Firewall Integrity</span>
              </div>
              <span className="text-xs text-muted-foreground">{firewallHealth}%</span>
            </div>
            <Progress 
              value={firewallHealth} 
              className="h-2" 
              indicatorClassName={
                firewallHealth > 60 ? "bg-green-500" : 
                firewallHealth > 30 ? "bg-yellow-500" : 
                "bg-red-500"
              } 
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-4 mb-6">
              {/* Display previous attempts with Wordle-style feedback */}
              {attemptResults.map((result, index) => (
                <div key={index} className="flex justify-center gap-1">
                  {result.map((charState, charIndex) => (
                    <div 
                      key={`${index}-${charIndex}`} 
                      className={`w-10 h-10 flex items-center justify-center font-mono text-lg border rounded-md ${
                        charState.status === "correct" 
                          ? "bg-green-500 text-white border-green-600" 
                          : charState.status === "wrong-position" 
                            ? "bg-yellow-500 text-white border-yellow-600" 
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {charState.char}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Current guess input */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.slice(0, targetPassword.length + 2))} // Allow slightly longer than target
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                placeholder="Enter password guess..."
                className="font-mono"
                autoFocus
              />
              <Button onClick={handleGuess}>Try</Button>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs text-muted-foreground my-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-1.5"></div>
                <span>Correct position</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-1.5"></div>
                <span>Wrong position</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-1.5"></div>
                <span>Not in password</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-3 flex flex-col items-center text-center">
                <Button 
                  variant={hintUsed ? "outline" : "default"}
                  disabled={hintUsed}
                  onClick={getHint}
                  className="w-full mb-2"
                >
                  <Lock className="h-4 w-4 mr-1.5" /> Get Hint
                </Button>
                <p className="text-xs text-muted-foreground">
                  Reveals one character position (-15% health)
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-3 flex flex-col items-center text-center">
                <Button 
                  variant={bruteForceCooldown > 0 ? "outline" : "default"}
                  disabled={bruteForceCooldown > 0 || bruteForceModeActive}
                  onClick={activateBruteForce}
                  className="w-full mb-2"
                >
                  <Cpu className="h-4 w-4 mr-1.5" /> 
                  {bruteForceCooldown > 0 
                    ? `Cooldown (${bruteForceCooldown}s)` 
                    : "Brute Force"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Tests multiple characters (-25% health)
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="space-y-1">
              <div className="text-xs font-medium">Difficulty</div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={difficulty === "easy" ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => difficulty !== "easy" && resetGame("easy")}
                >
                  Easy
                </Button>
                <Button 
                  size="sm" 
                  variant={difficulty === "medium" ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => difficulty !== "medium" && resetGame("medium")}
                >
                  Medium
                </Button>
                <Button 
                  size="sm" 
                  variant={difficulty === "hard" ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => difficulty !== "hard" && resetGame("hard")}
                >
                  Hard
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => resetGame(difficulty)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          {victory ? (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Access Granted!</h3>
              <p className="text-lg mb-4">
                Password: <span className="font-mono font-bold">{targetPassword}</span>
              </p>
              <div className="mb-6">
                <p className="text-3xl font-bold text-primary">{score}/100</p>
                <p className="text-sm text-slate-500">
                  Cracked in {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'} 
                  with {firewallHealth}% firewall remaining
                </p>
                
                {attempts.length <= 3 && (
                  <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
                    <p className="font-medium text-amber-800 dark:text-amber-300">Achievement Unlocked!</p>
                    <p className="text-sm">Hacker Toolset: Cracked in 3 or fewer attempts</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Access Denied!</h3>
              <p className="mb-4">
                The system detected your attempt and blocked access.
              </p>
              <div className="mb-6">
                <p className="text-lg mb-2">
                  Password was: <span className="font-mono font-bold">{targetPassword}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Score: <span className="font-medium">{score}</span>/100
                </p>
              </div>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => resetGame(difficulty)}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button onClick={() => onComplete(score)}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BruteForceGame;
