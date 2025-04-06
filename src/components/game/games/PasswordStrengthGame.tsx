
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { analyzePassword } from "@/lib/passwordAnalyzer";

interface PasswordStrengthGameProps {
  onComplete: (score: number) => void;
}

const PasswordStrengthGame = ({ onComplete }: PasswordStrengthGameProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [score, setScore] = useState(0);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Generate a set of passwords with varying strengths
  const generatePasswordSet = () => {
    // Password templates of varying strength
    const templates = [
      // Weak passwords
      { base: "password", suffix: "123", prefix: "" },
      { base: "qwerty", suffix: "!", prefix: "" },
      { base: "welcome", suffix: "2024", prefix: "" },
      // Medium passwords
      { base: "sunshine", suffix: "2024!", prefix: "My" },
      { base: "butterfly", suffix: "#1", prefix: "Blue" },
      { base: "football", suffix: "$$", prefix: "Fantasy" },
      // Strong passwords
      { base: "mountain", suffix: "Trek#2024", prefix: "Epic" },
      { base: "nebula", suffix: "Star&99", prefix: "Cosmic" },
      { base: "adventure", suffix: "Time!2024", prefix: "Wild" }
    ];
    
    // Select 3 templates randomly to create passwords
    const shuffledTemplates = [...templates].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Create passwords and analyze them
    const passwordsWithStrengths = shuffledTemplates.map(template => {
      const pwd = `${template.prefix}${template.base}${template.suffix}`;
      const analysis = analyzePassword(pwd);
      return { password: pwd, score: analysis.score };
    });
    
    // Sort by strength to find the strongest
    passwordsWithStrengths.sort((a, b) => b.score - a.score);
    setCorrectIndex(0); // The strongest password is now at index 0
    
    // Shuffle again for display
    const shuffled = [...passwordsWithStrengths].sort(() => 0.5 - Math.random());
    setPasswords(shuffled.map(p => p.password));
    
    // Find where the strongest password is now
    const strongestPassword = passwordsWithStrengths[0].password;
    const newCorrectIndex = shuffled.findIndex(p => p === strongestPassword);
    setCorrectIndex(newCorrectIndex);
    
    setTimeLeft(15);
    setSelectedIndex(null);
    setFeedback("");
  };

  useEffect(() => {
    generatePasswordSet();
  }, [currentRound]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTimeout = () => {
    if (selectedIndex === null) {
      setFeedback("Time's up! You didn't select a password.");
      setTimeout(() => nextRound(), 2000);
    }
  };

  const handleSelection = (index: number) => {
    setSelectedIndex(index);
    
    if (index === correctIndex) {
      setFeedback("Correct! That was the strongest password.");
      setScore(prev => prev + 20);
    } else {
      setFeedback("Incorrect! That wasn't the strongest password.");
    }
    
    setTimeout(() => nextRound(), 2000);
  };

  const nextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
    } else {
      setGameComplete(true);
      onComplete(score);
    }
  };

  const getScoreColor = (finalScore: number) => {
    if (finalScore >= 80) return "text-green-500";
    if (finalScore >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Password Strength Challenge</h3>
          <p className="text-sm text-slate-500">Select the strongest password</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Round: {currentRound}/{totalRounds}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
            Score: {score}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Progress value={(currentRound / totalRounds) * 100} className="w-2/3" />
        <div className="text-sm font-medium">
          Time: <span className={timeLeft < 5 ? "text-red-500" : "text-primary"}>{timeLeft}s</span>
        </div>
      </div>
      
      {!gameComplete ? (
        <div className="space-y-3">
          {passwords.map((password, index) => (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-colors ${
                selectedIndex === index
                  ? index === correctIndex
                    ? "bg-green-100 dark:bg-green-900/20 border-green-500"
                    : "bg-red-100 dark:bg-red-900/20 border-red-500"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              onClick={() => selectedIndex === null && handleSelection(index)}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-base">{password}</div>
                {selectedIndex === index && (
                  <div>
                    {index === correctIndex ? (
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {feedback && (
            <div className={`mt-2 p-2 rounded text-center ${
              feedback.includes("Correct") 
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            }`}>
              {feedback}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Lock className="h-12 w-12 mx-auto mb-2 text-primary" />
          <h3 className="text-xl font-bold mb-2">Game Complete!</h3>
          <p className="text-lg">
            Final Score: <span className={getScoreColor(score)}>{score}</span>/100
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {score >= 80 
              ? "Excellent! You're a password security expert!" 
              : score >= 50 
                ? "Good job! You have a solid understanding of password strength."
                : "Keep practicing to improve your password security skills!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthGame;
