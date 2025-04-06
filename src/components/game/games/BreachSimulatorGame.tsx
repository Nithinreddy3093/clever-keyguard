
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertCircle, Check, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { commonPasswords } from "@/lib/password/commonPasswords";

interface BreachSimulatorGameProps {
  onComplete: (score: number) => void;
}

// Convert to Set for faster lookups
const commonPasswordSet = new Set(commonPasswords);

const BreachSimulatorGame = ({ onComplete }: BreachSimulatorGameProps) => {
  const [stage, setStage] = useState(0);
  const [score, setScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Scenarios for the breach simulation game
  const scenarios = [
    {
      title: "Leaked Password Scenario",
      description: "Which of these passwords is most likely to be found in a data breach?",
      options: () => {
        // Generate one common password and two secure ones
        const commonIndex = Math.floor(Math.random() * commonPasswords.length);
        const commonPwd = commonPasswords[commonIndex];
        
        // Create secure passwords
        const securePasswords = [
          `Secure${Math.floor(Math.random() * 1000)}!${Math.floor(Math.random() * 10)}`,
          `Protected${Math.floor(Math.random() * 100)}#${Math.floor(Math.random() * 10)}`
        ];
        
        // Return shuffled array with 1 common and 2 secure passwords
        return [commonPwd, ...securePasswords].sort(() => 0.5 - Math.random());
      },
      correctAnswer: (options: string[]) => options.findIndex(pwd => commonPasswordSet.has(pwd))
    },
    {
      title: "Password Reset Policy",
      description: "After a data breach, what should a company do about user passwords?",
      options: () => [
        "Wait to see if hackers actually use the stolen data",
        "Force all users to reset their passwords immediately",
        "Only reset passwords for accounts showing unusual activity"
      ],
      correctAnswer: () => 1
    },
    {
      title: "After a Breach",
      description: "What should you do if your password was exposed in a data breach?",
      options: () => [
        "Change the password only on the affected site",
        "Change your password on all sites where you used the same password",
        "Wait for the company to fix the breach before taking action"
      ],
      correctAnswer: () => 1
    },
    {
      title: "Multi-Factor Authentication",
      description: "How does MFA (Multi-Factor Authentication) protect you during a breach?",
      options: () => [
        "It makes your password stronger and uncrackable",
        "It prevents all types of hacks from occurring",
        "It requires additional verification even if your password is compromised"
      ],
      correctAnswer: () => 2
    },
    {
      title: "Password Manager Security",
      description: "What should you do with your password manager after a breach?",
      options: () => [
        "Stop using it since it might be compromised",
        "Update your master password and check for affected sites",
        "Export all your passwords to a text file for safety"
      ],
      correctAnswer: () => 1
    }
  ];

  // Setup current scenario
  useEffect(() => {
    if (stage < scenarios.length) {
      const options = scenarios[stage].options();
      setCurrentOptions(options);
      setSelectedOption(null);
      setIsCorrect(null);
      setFeedback("");
    }
  }, [stage]);

  const handleSelection = (option: string, index: number) => {
    setSelectedOption(option);
    
    const correctIndex = scenarios[stage].correctAnswer(currentOptions);
    const correct = index === correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setFeedback("Correct! Good job identifying the security risk.");
      setScore(prev => prev + 20);
    } else {
      setFeedback(`Incorrect. The right answer was: ${currentOptions[correctIndex]}`);
    }
    
    // Move to next stage after delay
    setTimeout(() => {
      if (stage < scenarios.length - 1) {
        setStage(prev => prev + 1);
      } else {
        setGameComplete(true);
        onComplete(score + (correct ? 20 : 0));
      }
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Data Breach Simulator</h3>
          <p className="text-sm text-slate-500">Test your knowledge of password security during breaches</p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          Score: {score}/100
        </Badge>
      </div>
      
      <Progress 
        value={((stage) / scenarios.length) * 100} 
        className="h-1.5 mb-4"
      />

      {!gameComplete ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="text-base font-medium flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-primary" />
                {scenarios[stage].title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {scenarios[stage].description}
              </p>
              
              <div className="space-y-2">
                {currentOptions.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedOption === option 
                      ? isCorrect ? "outline" : "destructive" 
                      : "outline"}
                    className={`w-full justify-start h-auto py-3 px-4 text-left ${
                      selectedOption === option && isCorrect 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                        : ""
                    }`}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelection(option, idx)}
                  >
                    <span className="mr-2">
                      {selectedOption === option ? (
                        isCorrect ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </span>
                    <span>{option}</span>
                  </Button>
                ))}
              </div>
              
              {feedback && (
                <div className={`mt-4 p-3 rounded text-sm ${
                  isCorrect 
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                }`}>
                  <div className="flex items-center">
                    {isCorrect ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    {feedback}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-sm text-center text-slate-500">
            Question {stage + 1} of {scenarios.length}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
          <h3 className="text-xl font-bold mb-2">Simulation Complete!</h3>
          <p className="text-lg">
            Your Score: <span className={score >= 60 ? "text-green-500" : "text-amber-500"}>{score}</span>/100
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {score >= 80 
              ? "Excellent! You're well prepared to handle password security during breaches." 
              : score >= 60 
                ? "Good job! You have a solid understanding of breach security."
                : "Keep learning about password security best practices!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BreachSimulatorGame;
