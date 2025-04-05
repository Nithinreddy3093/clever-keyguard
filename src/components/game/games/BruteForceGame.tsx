
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, TimerIcon, Shield, Keyboard, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import crypto from "crypto-js";

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
  const [username, setUsername] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("shadowTierUsername") || localStorage.getItem("passwordGameUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    // Get current streak
    fetchUserStreak();
  }, [user]);

  // Fetch user's streak
  const fetchUserStreak = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("password_history")
        .select("daily_streak")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) {
        console.error("Error fetching user streak:", error);
        return;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        setCurrentStreak(data[0].daily_streak || 0);
      }
    } catch (error) {
      console.error("Error fetching user streak:", error);
    }
  };

  // Update user streak
  const updateUserStreak = async () => {
    if (!user) return currentStreak;
    
    try {
      // Get current streak
      const { data: streakData, error: streakError } = await supabase
        .from("password_history")
        .select("daily_streak, last_interaction_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (streakError) {
        console.error("Error fetching streak data:", streakError);
        return currentStreak;
      }
      
      let userStreak = currentStreak;
      let lastDate = null;
      
      if (streakData && Array.isArray(streakData) && streakData.length > 0) {
        userStreak = streakData[0].daily_streak || 0;
        lastDate = streakData[0].last_interaction_date;
      }
      
      // Check if last interaction was yesterday or earlier
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastInteraction = lastDate ? new Date(lastDate) : null;
      if (lastInteraction) {
        lastInteraction.setHours(0, 0, 0, 0);
      }
      
      // Calculate days difference
      const daysDiff = lastInteraction 
        ? Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
      
      // Update streak based on days difference
      let newStreak = userStreak;
      if (daysDiff === 1) {
        // Yesterday - increment streak
        newStreak = userStreak + 1;
      } else if (daysDiff > 1) {
        // More than a day - reset streak
        newStreak = 1;
      } else if (daysDiff === 0) {
        // Same day - no change to streak
        newStreak = Math.max(userStreak, 1);
      }
      
      return newStreak;
    } catch (error) {
      console.error("Error updating streak:", error);
      return currentStreak;
    }
  };

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

  // Save the score to Supabase
  const saveScoreToRankings = async (finalScore: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your score to rankings",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      const randomUsername = `Hacker${Math.floor(Math.random() * 10000)}`;
      setUsername(randomUsername);
      localStorage.setItem("shadowTierUsername", randomUsername);
      toast({
        title: "Username generated",
        description: `Using auto-generated username: ${randomUsername}`,
      });
    }

    try {
      setSavingScore(true);
      const gameData = {
        game_type: "brute_force",
        rounds_completed: currentRound,
        passwords_cracked: crackedPasswords.length,
        time_remaining: timeLeft,
      };
      
      const passwordHash = crypto.SHA256("game-score-" + Date.now()).toString();
      const newStreak = await updateUserStreak();
      
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: finalScore,
        length: 10, // Not relevant for game score
        has_upper: true,
        has_lower: true,
        has_digit: true,
        has_special: true,
        is_common: false,
        has_common_pattern: false,
        entropy: 70,
        metadata: { 
          username: username,
          game_data: gameData,
          game_type: "brute_force",
          streak: newStreak
        },
        daily_streak: newStreak,
        last_interaction_date: new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      
      setCurrentStreak(newStreak);
      
      toast({
        title: "Score saved!",
        description: `Your game score (${finalScore}) has been saved to the Shadow Realm rankings!`,
      });
    } catch (error: any) {
      console.error("Error saving score:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save score to rankings",
        variant: "destructive",
      });
    } finally {
      setSavingScore(false);
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
    
    // Save score to rankings if user is logged in
    if (user) {
      saveScoreToRankings(finalScore);
    }
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
          
          {user && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
              <div className="flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-sm">
                  Your scores will be saved to the Shadow Realm Rankings!
                </p>
              </div>
              {currentStreak > 0 && (
                <p className="text-xs text-center mt-2 text-amber-600 dark:text-amber-400">
                  Current streak: {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
          
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
          
          {user && (
            <div className={`p-4 rounded-lg ${savingScore ? "bg-blue-50 dark:bg-blue-900/20" : "bg-green-50 dark:bg-green-900/20"}`}>
              <div className="flex items-center justify-center">
                <Trophy className={`h-5 w-5 mr-2 ${savingScore ? "text-blue-500" : "text-green-500"}`} />
                <p className="text-sm">
                  {savingScore ? "Saving your score to the Shadow Realm..." : "Your score has been saved to the Shadow Realm Rankings!"}
                </p>
              </div>
            </div>
          )}
          
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
