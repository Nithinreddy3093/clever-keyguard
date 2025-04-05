
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, TimerIcon, Shield, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const commonPasswords = [
  "password", "123456", "qwerty", "admin", "welcome", 
  "football", "baseball", "dragon", "sunshine", "monkey",
  "letmein", "abc123", "111111", "mustang", "shadow"
];

interface BruteForceGameProps {
  onComplete: (score: number) => void;
}

const BruteForceGame = ({ onComplete }: BruteForceGameProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetPassword, setTargetPassword] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [attackHints, setAttackHints] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [gameComplete, setGameComplete] = useState(false);
  const [crackedPasswords, setCrackedPasswords] = useState<string[]>([]);
  const { toast } = useToast();

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setCurrentRound(1);
    setScore(0);
    setCrackedPasswords([]);
    selectNewPasswordTarget();
  };

  // Select a new password target for the current round
  const selectNewPasswordTarget = () => {
    const randomIndex = Math.floor(Math.random() * commonPasswords.length);
    const newTarget = commonPasswords[randomIndex];
    setTargetPassword(newTarget);
    setTimeLeft(30);
    setUserGuess("");
    setAttackHints([]);
    setFeedbackMessage("");

    // Generate hints based on password complexity
    generateHints(newTarget);
  };

  // Generate hints for the current password
  const generateHints = (password: string) => {
    const hints = [];
    
    // Length hint
    hints.push(`Length: ${password.length} characters`);
    
    // Character type hints
    if (/[0-9]/.test(password)) {
      hints.push("Contains numbers");
    }
    if (/[a-z]/.test(password)) {
      hints.push("Contains lowercase letters");
    }
    if (/[A-Z]/.test(password)) {
      hints.push("Contains uppercase letters");
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      hints.push("Contains special characters");
    }

    // First character hint
    hints.push(`First character: ${password[0]}`);
    
    setAttackHints(hints);
  };

  // Check the user's guess
  const checkGuess = () => {
    if (userGuess.toLowerCase() === targetPassword.toLowerCase()) {
      // Success
      const roundScore = Math.ceil(timeLeft * 10);
      const newScore = score + roundScore;
      setScore(newScore);
      
      setCrackedPasswords([...crackedPasswords, targetPassword]);
      
      toast({
        title: "Password Cracked!",
        description: `Password "${targetPassword}" successfully hacked! +${roundScore} points`,
        variant: "default", // Changed from "success" to "default"
      });
      
      setFeedbackMessage("Password cracked successfully! Moving to next target...");
      
      // Move to next round or end game
      if (currentRound >= totalRounds) {
        endGame(newScore);
      } else {
        setTimeout(() => {
          setCurrentRound(currentRound + 1);
          selectNewPasswordTarget();
        }, 2000);
      }
    } else {
      // Wrong guess
      setFeedbackMessage("Incorrect password! Try again.");
      // Apply small time penalty for wrong guesses
      setTimeLeft(prev => Math.max(prev - 2, 0));
    }
  };

  // End the game
  const endGame = (finalScore: number) => {
    setGameComplete(true);
    setGameStarted(false);
    
    toast({
      title: "Game Complete!",
      description: `You've completed the Hack the Password game with ${finalScore} points!`,
    });
    
    onComplete(finalScore);
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameStarted && timeLeft === 0) {
      toast({
        title: "Time's Up!",
        description: "You ran out of time to crack this password.",
        variant: "destructive",
      });
      
      setFeedbackMessage(`Time's up! The password was "${targetPassword}"`);
      
      // Move to next round or end game
      if (currentRound >= totalRounds) {
        endGame(score);
      } else {
        setTimeout(() => {
          setCurrentRound(currentRound + 1);
          selectNewPasswordTarget();
        }, 2000);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameStarted, timeLeft]);

  return (
    <div className="flex flex-col space-y-6">
      {!gameStarted && !gameComplete ? (
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold">Hack the Password</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You're an ethical hacker practicing against a database of common passwords. 
            Use the hints provided to guess each weak password within the time limit.
          </p>
          
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Game Rules:</h4>
            <ul className="list-disc list-inside text-left text-sm space-y-1">
              <li>You'll have 30 seconds to crack each password</li>
              <li>Hints will be provided based on the password's characteristics</li>
              <li>Points are awarded based on how quickly you crack each password</li>
              <li>Incorrect guesses will cost you 2 seconds</li>
              <li>Complete 5 rounds to finish the game</li>
            </ul>
          </div>
          
          <Button 
            onClick={startGame}
            size="lg" 
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Start Hacking
          </Button>
        </motion.div>
      ) : gameComplete ? (
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold">Game Complete!</h3>
          <div className="py-6">
            <span className="text-4xl font-bold text-primary">{score}</span>
            <p className="text-slate-500 dark:text-slate-400">Final Score</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Passwords Cracked:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {crackedPasswords.map((password, index) => (
                <Badge key={index} className="py-2">
                  {password}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={() => {
                setGameComplete(false);
              }} 
              variant="outline" 
              className="mr-2"
            >
              Close
            </Button>
            <Button 
              onClick={startGame}
            >
              Play Again
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Badge 
                variant="outline" 
                className="mr-2 bg-slate-100 dark:bg-slate-800"
              >
                Round {currentRound}/{totalRounds}
              </Badge>
            </div>
            <div className="flex items-center">
              <TimerIcon className="h-4 w-4 mr-1 text-amber-500" />
              <span className={`font-mono ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          <div>
            <Progress 
              value={(timeLeft / 30) * 100} 
              className="h-2"
              indicatorClassName={timeLeft <= 10 ? "bg-red-500" : ""}
            />
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="text-sm font-semibold flex items-center mb-2">
              <Shield className="h-4 w-4 mr-1 text-blue-500" />
              Password Hints
            </h4>
            <ul className="text-sm space-y-1">
              {attackHints.map((hint, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  {hint}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <Keyboard className="h-4 w-4 mr-1 text-indigo-500" />
              Enter Password
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type your guess here..."
                className="font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') checkGuess();
                }}
              />
              <Button onClick={checkGuess}>Try</Button>
            </div>
          </div>
          
          {feedbackMessage && (
            <motion.div 
              className={`p-3 rounded-lg ${
                feedbackMessage.includes("successfully") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                {feedbackMessage.includes("successfully") ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {feedbackMessage}
              </div>
            </motion.div>
          )}
          
          <div className="pt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Current Score: <span className="font-semibold text-primary">{score}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BruteForceGame;
