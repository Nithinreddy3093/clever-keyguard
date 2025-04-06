
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, AlertTriangle, X, Check, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface HackingDefenseGameProps {
  onComplete: (score: number) => void;
}

interface AttackType {
  name: string;
  description: string;
  icon: JSX.Element;
  defenseOptions: DefenseOption[];
}

interface DefenseOption {
  id: string;
  name: string;
  correct: boolean;
  explanation: string;
}

const HackingDefenseGame = ({ onComplete }: HackingDefenseGameProps) => {
  const { toast } = useToast();
  const [currentAttack, setCurrentAttack] = useState<number>(0);
  const [selectedDefense, setSelectedDefense] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  const attackTypes: AttackType[] = [
    {
      name: "Brute Force Attack",
      description: "The attacker is attempting to guess your password by trying many combinations.",
      icon: <Terminal className="h-6 w-6 text-red-500" />,
      defenseOptions: [
        {
          id: "bf1",
          name: "Use a simple password that's easy to remember",
          correct: false,
          explanation: "Simple passwords are the first to fall to brute force attacks."
        },
        {
          id: "bf2",
          name: "Enable multi-factor authentication",
          correct: true,
          explanation: "MFA adds an extra verification step even if the password is guessed."
        },
        {
          id: "bf3",
          name: "Set the exact same password for all accounts",
          correct: false,
          explanation: "Using the same password everywhere increases your risk exposure."
        }
      ]
    },
    {
      name: "Dictionary Attack",
      description: "The attacker is using a list of common words and phrases to crack your password.",
      icon: <Terminal className="h-6 w-6 text-red-500" />,
      defenseOptions: [
        {
          id: "da1",
          name: "Use a passphrase with random words and special characters",
          correct: true,
          explanation: "Random word combinations with special characters are resistant to dictionary attacks."
        },
        {
          id: "da2",
          name: "Use your favorite book title as your password",
          correct: false,
          explanation: "Common phrases and book titles are included in dictionary attack lists."
        },
        {
          id: "da3",
          name: "Use 'password123!' which has a special character",
          correct: false,
          explanation: "Adding simple numbers/characters to common words doesn't protect against modern dictionary attacks."
        }
      ]
    },
    {
      name: "Credential Stuffing",
      description: "The attacker is using previously leaked username/password combinations on your accounts.",
      icon: <Terminal className="h-6 w-6 text-red-500" />,
      defenseOptions: [
        {
          id: "cs1",
          name: "Only change passwords for accounts you know were breached",
          correct: false,
          explanation: "You should change all passwords that match a breached password."
        },
        {
          id: "cs2",
          name: "Use the same password but add '!' at the end",
          correct: false,
          explanation: "Simple modifications to breached passwords are not secure."
        },
        {
          id: "cs3",
          name: "Use unique passwords for each site and monitor breach notifications",
          correct: true,
          explanation: "Unique passwords prevent attackers from accessing multiple accounts after a single breach."
        }
      ]
    },
    {
      name: "Social Engineering Attack",
      description: "The attacker calls pretending to be IT support and asks for your password.",
      icon: <Terminal className="h-6 w-6 text-red-500" />,
      defenseOptions: [
        {
          id: "se1",
          name: "Give the password since IT needs it for system upgrades",
          correct: false,
          explanation: "Legitimate IT will never ask for your full password."
        },
        {
          id: "se2",
          name: "Ask for verification and report the request to actual IT security",
          correct: true,
          explanation: "Always verify unexpected requests for sensitive information through official channels."
        },
        {
          id: "se3",
          name: "Give a slightly wrong password to see if they notice",
          correct: false,
          explanation: "Any password information helps attackers, even if slightly wrong."
        }
      ]
    },
    {
      name: "Rainbow Table Attack",
      description: "The attacker is using pre-computed hash values to crack password hashes.",
      icon: <Terminal className="h-6 w-6 text-red-500" />,
      defenseOptions: [
        {
          id: "rt1",
          name: "Use very long passwords with over 16 characters",
          correct: true,
          explanation: "Long passwords create hashes that are unlikely to be in rainbow tables."
        },
        {
          id: "rt2",
          name: "Just capitalize the first letter of your password",
          correct: false,
          explanation: "This common pattern is accounted for in rainbow tables."
        },
        {
          id: "rt3",
          name: "Use a password with exactly 8 characters",
          correct: false,
          explanation: "Short passwords of common lengths are prime targets for rainbow table attacks."
        }
      ]
    }
  ];

  // Initialize timer
  useEffect(() => {
    if (!gameComplete && currentAttack < attackTypes.length) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentAttack, gameComplete]);

  // Handle what happens when time runs out
  const handleTimeout = () => {
    if (selectedDefense === null) {
      toast({
        title: "Time's up!",
        description: "You didn't choose a defense in time.",
        variant: "destructive"
      });
      
      // Move to next attack after showing correct option
      setShowExplanation(true);
      
      setTimeout(() => {
        moveToNextAttack();
      }, 3000);
    }
  };

  // Handle defense selection
  const handleSelectDefense = (defenseId: string) => {
    if (selectedDefense !== null) return; // Prevent multiple selections
    
    setSelectedDefense(defenseId);
    const currentOptions = attackTypes[currentAttack].defenseOptions;
    const selected = currentOptions.find(opt => opt.id === defenseId);
    
    if (selected?.correct) {
      setScore(prev => prev + 20);
      toast({
        title: "Correct defense!",
        description: "You've successfully blocked the attack.",
      });
    } else {
      toast({
        title: "Wrong defense!",
        description: "That won't stop the attack.",
        variant: "destructive"
      });
    }
    
    setShowExplanation(true);
    
    setTimeout(() => {
      moveToNextAttack();
    }, 3000);
  };

  // Move to next attack or end game
  const moveToNextAttack = () => {
    const nextAttack = currentAttack + 1;
    
    if (nextAttack < attackTypes.length) {
      setCurrentAttack(nextAttack);
      setSelectedDefense(null);
      setShowExplanation(false);
      setTimeLeft(20);
      setGameProgress((nextAttack / attackTypes.length) * 100);
    } else {
      setGameComplete(true);
      onComplete(score);
    }
  };

  return (
    <div className="space-y-4">
      {!gameComplete ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Password Defense Simulator</h3>
              <p className="text-sm text-slate-500">Choose the right defense against password attacks</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                Score: {score}/100
              </Badge>
              <Badge variant={timeLeft < 5 ? "destructive" : "outline"} className={timeLeft < 5 ? "" : "bg-primary/10"}>
                {timeLeft}s
              </Badge>
            </div>
          </div>
          
          <Progress value={gameProgress} className="h-1.5 mb-4" />
          
          <Card className="border border-red-200 dark:border-red-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                {attackTypes[currentAttack].icon}
                <div>
                  <h4 className="font-medium">{attackTypes[currentAttack].name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {attackTypes[currentAttack].description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <h5 className="font-medium text-sm">Select your defense strategy:</h5>
                {attackTypes[currentAttack].defenseOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedDefense === null ? "outline" : 
                      selectedDefense === option.id ? 
                        option.correct ? "default" : "destructive" : 
                        option.correct && showExplanation ? "default" : "outline"
                    }
                    className={`w-full justify-start h-auto py-3 text-left ${
                      selectedDefense !== null && option.correct && "border-green-500"
                    }`}
                    onClick={() => handleSelectDefense(option.id)}
                    disabled={selectedDefense !== null}
                  >
                    <span className="mr-2">
                      {selectedDefense !== null && (
                        option.correct ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          selectedDefense === option.id ? 
                            <X className="h-4 w-4" /> :
                            <></>
                      )}
                    </span>
                    {option.name}
                  </Button>
                ))}
              </div>
              
              {showExplanation && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm">
                  <h5 className="font-medium mb-1">Explanation:</h5>
                  <p>
                    {attackTypes[currentAttack].defenseOptions.find(o => o.correct)?.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-sm text-center text-slate-500">
            Attack {currentAttack + 1} of {attackTypes.length}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Defense Complete!</h3>
          <p className="text-lg mb-6">
            Final Score: <span className={score >= 60 ? "text-green-500" : "text-amber-500"}>{score}</span>/100
          </p>
          
          <div className="max-w-md mx-auto text-left p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2 text-primary" />
              Security Assessment
            </h4>
            
            {score >= 80 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Outstanding job! You've mastered advanced password defense strategies and would likely prevent most real-world attacks.
              </p>
            ) : score >= 60 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Good work! You have a solid grasp of password security principles, though there's still room for improvement.
              </p>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You've learned the basics, but need more practice with password security concepts. Review the types of attacks and try again!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HackingDefenseGame;
