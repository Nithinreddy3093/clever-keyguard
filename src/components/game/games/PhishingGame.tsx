
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TimerIcon, Check, X, AlertTriangle, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Phishing content samples
const phishingContent = [
  {
    type: "email",
    content: {
      sender: "security@gooogle-secure.com",
      subject: "Urgent: Your Google Account Has Been Compromised",
      body: "Dear User, We have detected suspicious activity on your Google account. Click here to verify your identity within 24 hours or your account will be permanently deleted.",
      url: "https://secure-google-verification.com/verify"
    },
    isPhishing: true,
    explanation: "This is a phishing attempt. Notice the misspelled sender domain 'gooogle-secure.com' and suspicious URL that doesn't match official Google domains."
  },
  {
    type: "email",
    content: {
      sender: "no-reply@amazon.com",
      subject: "Your Amazon Order #A38972",
      body: "Thank you for your recent Amazon order. Your package has shipped and will arrive on Thursday. Track your shipment with the link below.",
      url: "https://amazon.com/orders/tracking"
    },
    isPhishing: false,
    explanation: "This is a legitimate email. The sender domain matches the official Amazon domain, and the URL points to amazon.com without suspicious subdomains."
  },
  {
    type: "website",
    content: {
      url: "https://paypa1.com/account/login",
      title: "PayPal: Login to Your Account",
      description: "Enter your email and password to access your PayPal account"
    },
    isPhishing: true,
    explanation: "This is a phishing site. Notice the URL uses the number '1' instead of the letter 'l' in 'paypa1.com' to mimic the legitimate 'paypal.com'."
  },
  {
    type: "website",
    content: {
      url: "https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook",
      title: "Microsoft Outlook | Email and Calendar",
      description: "Outlook helps you manage your email, calendar, tasks, and contacts together in one place."
    },
    isPhishing: false,
    explanation: "This is a legitimate Microsoft website with the official domain, proper HTTPS, and content consistent with Microsoft's branding."
  },
  {
    type: "email",
    content: {
      sender: "accounts@netflix.support",
      subject: "Netflix Payment Declined - Update Your Payment Method",
      body: "Dear Customer, Your payment method has been declined. Please update your payment information within 24 hours to avoid service interruption. Click the link to update now.",
      url: "https://netflix-billing-update.com/account"
    },
    isPhishing: true,
    explanation: "This is a phishing attempt. Netflix uses 'netflix.com' for emails, not 'netflix.support'. The URL is also suspicious and not an official Netflix domain."
  },
  {
    type: "website",
    content: {
      url: "https://www.bankofamerica.com/online-banking/sign-in/",
      title: "Bank of America | Online Banking | Sign In",
      description: "Sign in to your Online Banking account"
    },
    isPhishing: false,
    explanation: "This is a legitimate Bank of America website with the correct domain and secure HTTPS connection."
  },
  {
    type: "email",
    content: {
      sender: "support@appleid.apple.com",
      subject: "Your Apple ID was used to sign in to iCloud",
      body: "Dear Customer, Your Apple ID was used to sign in to iCloud on a new iPhone. If this was you, you can ignore this message. If you don't recognize this activity, visit appleid.apple.com to secure your account.",
      url: "https://appleid.apple.com"
    },
    isPhishing: false,
    explanation: "This is a legitimate security alert from Apple using their official domain and referring users to the correct Apple website."
  },
  {
    type: "website",
    content: {
      url: "https://faceb00k.com/login/",
      title: "Facebook - Log In or Sign Up",
      description: "Create an account or log into Facebook. Connect with friends, family and other people you know."
    },
    isPhishing: true,
    explanation: "This is a phishing site. Notice the URL uses zeros instead of 'o's in 'faceb00k.com' to mimic the legitimate 'facebook.com'."
  },
  {
    type: "email",
    content: {
      sender: "noreply@dropbox.com",
      subject: "Someone has shared a file with you",
      body: "John Smith has shared a document with you. Click here to view the document.",
      url: "https://www.dropbox.com/s/document"
    },
    isPhishing: false,
    explanation: "This is a legitimate Dropbox email using their official domain and URL."
  },
  {
    type: "website",
    content: {
      url: "https://accounts-google.com/signin",
      title: "Sign in - Google Accounts",
      description: "Use your Google Account to sign in to all Google services"
    },
    isPhishing: true,
    explanation: "This is a phishing site. The legitimate Google sign-in URL is 'accounts.google.com' without a hyphen."
  }
];

interface PhishingGameProps {
  onComplete: (score: number) => void;
}

const PhishingGame = ({ onComplete }: PhishingGameProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(7);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedContentIndices, setUsedContentIndices] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const { toast } = useToast();

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCurrentRound(1);
    setScore(0);
    setStreakCount(0);
    setUsedContentIndices([]);
    setTimeLeft(20);
    setShowExplanation(false);
    selectNewContent();
  };

  // Select new content for the round
  const selectNewContent = () => {
    // Find an unused piece of content
    let availableIndices = Array.from(
      { length: phishingContent.length },
      (_, i) => i
    ).filter(i => !usedContentIndices.includes(i));
    
    // If we've used all content, reset
    if (availableIndices.length === 0) {
      setUsedContentIndices([]);
      availableIndices = Array.from(
        { length: phishingContent.length },
        (_, i) => i
      );
    }
    
    // Select random content
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setCurrentContent(phishingContent[randomIndex]);
    setUsedContentIndices([...usedContentIndices, randomIndex]);
    
    // Reset state for new round
    setTimeLeft(20);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  // Handle user judgment
  const judgeContent = (userAnswer: boolean) => {
    const isUserCorrect = userAnswer === currentContent.isPhishing;
    setIsCorrect(isUserCorrect);
    
    if (isUserCorrect) {
      // Calculate points based on time left and streak
      const newStreakCount = streakCount + 1;
      setStreakCount(newStreakCount);
      
      const streakBonus = Math.floor(newStreakCount / 3) * 5;
      const timeBonus = Math.floor(timeLeft * 2);
      const roundScore = 10 + timeBonus + streakBonus;
      
      setScore(prev => prev + roundScore);
      
      toast({
        title: "Correct!",
        description: `+${roundScore} points${streakBonus > 0 ? ` (includes +${streakBonus} streak bonus)` : ""}`,
      });
    } else {
      setStreakCount(0);
      toast({
        title: "Incorrect",
        description: "Study the explanation carefully to learn the signs.",
        variant: "destructive",
      });
    }
    
    setShowExplanation(true);
    setExplanationText(currentContent.explanation);
    
    // After delay, move to next round or end game
    setTimeout(() => {
      if (currentRound >= totalRounds) {
        endGame();
      } else {
        setCurrentRound(prev => prev + 1);
        selectNewContent();
      }
    }, 3000);
  };

  // End the game
  const endGame = () => {
    setGameStarted(false);
    setGameComplete(true);
    
    toast({
      title: "Game Complete!",
      description: `You've completed the Phishing Mastermind game with ${score} points!`,
    });
    
    onComplete(score);
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && timeLeft > 0 && !showExplanation) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameStarted && timeLeft === 0 && !showExplanation) {
      // Time's up
      setIsCorrect(false);
      setShowExplanation(true);
      setExplanationText(currentContent.explanation);
      setStreakCount(0);
      
      toast({
        title: "Time's Up!",
        description: "You need to be faster to spot phishing attempts.",
        variant: "destructive",
      });
      
      // After delay, move to next round or end game
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          endGame();
        } else {
          setCurrentRound(prev => prev + 1);
          selectNewContent();
        }
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameStarted, timeLeft, showExplanation]);

  const renderContent = () => {
    if (!currentContent) return null;

    if (currentContent.type === "email") {
      return (
        <Card className="border shadow mb-4">
          <CardContent className="p-4">
            <div className="border-b pb-2 mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">From: {currentContent.content.sender}</div>
                  <div className="font-semibold">Subject: {currentContent.content.subject}</div>
                </div>
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div className="py-2">
              <p className="mb-3">{currentContent.content.body}</p>
              <div className="py-2 px-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-sm">
                {currentContent.content.url}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (currentContent.type === "website") {
      return (
        <Card className="border shadow mb-4">
          <CardContent className="p-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-t-lg flex items-center">
              <div className="bg-slate-200 dark:bg-slate-700 rounded px-2 py-1 text-sm flex-grow font-mono">
                {currentContent.content.url}
              </div>
            </div>
            <div className="p-4 border border-t-0 rounded-b-lg">
              <h3 className="text-xl font-semibold mb-2">{currentContent.content.title}</h3>
              <p>{currentContent.content.description}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col space-y-6">
      {!gameStarted && !gameComplete ? (
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold">Phishing Mastermind</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Test your ability to identify phishing attempts in emails and websites.
            Quick decision-making is key to cybersecurity!
          </p>
          
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Game Rules:</h4>
            <ul className="list-disc list-inside text-left text-sm space-y-1">
              <li>You'll be shown emails and websites</li>
              <li>Decide if they are legitimate or phishing attempts</li>
              <li>You have 20 seconds to make each decision</li>
              <li>Earn points for correct answers, with bonuses for speed</li>
              <li>Build a streak of correct answers for bonus points</li>
              <li>Learn from explanations after each round</li>
            </ul>
          </div>
          
          <Button 
            onClick={startGame}
            size="lg" 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Start Game
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
          
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <h4 className="font-semibold mb-2">Security Tips:</h4>
            <ul className="list-disc list-inside text-left text-sm space-y-1">
              <li>Always check the sender's email domain carefully</li>
              <li>Hover over links before clicking to see the actual URL</li>
              <li>Be suspicious of urgent requests or threats</li>
              <li>Look for spelling and grammar errors</li>
              <li>When in doubt, contact the company directly through their official website</li>
            </ul>
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
              {streakCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  {streakCount} streak
                </Badge>
              )}
            </div>
            <div className="flex items-center">
              <TimerIcon className="h-4 w-4 mr-1 text-amber-500" />
              <span className={`font-mono ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          <div>
            <Progress 
              value={(timeLeft / 20) * 100} 
              className="h-2"
              indicatorClassName={timeLeft <= 5 ? "bg-red-500" : ""}
            />
          </div>
          
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-medium flex items-center mb-2">
                {currentContent?.type === "email" ? (
                  <Mail className="h-4 w-4 mr-1 text-blue-500" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />
                )}
                {currentContent?.type === "email" ? "Email Message" : "Website"}
              </h4>
            </div>
            
            {renderContent()}
            
            <AnimatePresence mode="wait">
              {showExplanation ? (
                <motion.div
                  key="explanation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                  }`}
                >
                  <div className="flex items-start">
                    {isCorrect ? (
                      <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 mr-2 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium mb-1">
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-sm">{explanationText}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="judgment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center gap-4 mt-4"
                >
                  <Button
                    onClick={() => judgeContent(false)}
                    variant="outline"
                    className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Legitimate
                  </Button>
                  <Button
                    onClick={() => judgeContent(true)}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Phishing
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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

export default PhishingGame;
