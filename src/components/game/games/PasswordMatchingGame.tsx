
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, CheckCircle2, Shield, Zap, Brain, ArrowRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transformPassword } from "@/lib/password/encoder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface PasswordMatchingGameProps {
  onComplete: (score: number) => void;
}

interface PasswordCard {
  id: number;
  displayContent: string;  // What's shown on the card
  originalContent: string; // The actual password before transformation
  encodingType: string;    // How was this password encoded
  matched: boolean;
  flipped: boolean;
  pairId: number;         // To track which cards are pairs
}

const PasswordMatchingGame = ({ onComplete }: PasswordMatchingGameProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<PasswordCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLimit, setTimeLimit] = useState<number>(120); // 2 minutes for level 1
  const [perfectMatches, setPerfectMatches] = useState<number>(0);
  
  const totalLevels = 3;
  const pairsPerLevel = [6, 6, 6]; // Number of pairs for each level
  
  // Password pairs by difficulty
  const passwordPairs = useMemo(() => [
    // Level 1 pairs - basic passwords
    [
      { weak: 'password123', strong: 'P@$$w0rd!123' },
      { weak: 'qwerty', strong: 'Qw3rty!$' },
      { weak: 'admin', strong: '@dm1n!$tr@t0r' },
      { weak: '123456', strong: 'One2Three4!Five6' },
      { weak: 'welcome', strong: 'W3lc0me!2023' },
      { weak: 'letmein', strong: 'L3t_M3_1n!N0w' }
    ],
    // Level 2 pairs - medium complexity
    [
      { weak: 'monkey', strong: 'M0nk3y!Jungl3' },
      { weak: 'football', strong: 'F00tb@ll!Ch@mp' },
      { weak: 'abc123', strong: '@bc!123_XyZ' },
      { weak: 'dragon', strong: 'Dr@g0n!F1r3!2023' },
      { weak: 'shadow', strong: 'Sh@d0w!N1nj@!22' },
      { weak: 'master', strong: 'M@$t3r!M1nd!2023' }
    ],
    // Level 3 pairs - complex pairs
    [
      { weak: 'superman', strong: 'Sup3rm@n!Kr7pt0n!' },
      { weak: 'baseball', strong: 'B@$3b@ll!Pl@y3r!23' },
      { weak: 'trustno1', strong: 'Tru$t_N0!0n3!2023!' },
      { weak: 'princess', strong: 'Pr1nc3$$!C@$tl3!23!' },
      { weak: 'sunshine', strong: '$un$h1n3!D@y!2023!' },
      { weak: 'whatever', strong: 'Wh@t3v3r!1$!F1n3!' }
    ]
  ], []);

  // Set timer and time limits
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const interval = setInterval(() => {
        setTimer(prev => {
          // Check if time limit reached
          if (prev + 1 >= timeLimit) {
            clearInterval(interval);
            
            // If time is up and we haven't completed the level
            if (matchedPairs < pairsPerLevel[level - 1]) {
              toast({
                title: "Time's up!",
                description: "You ran out of time. Try again!",
                variant: "destructive",
              });
              
              // End the game
              setGameCompleted(true);
              calculateFinalScore();
              return timeLimit;
            }
            
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameCompleted, matchedPairs, level, timeLimit]);

  // Monitor matched pairs to check for level completion
  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === pairsPerLevel[level - 1] && !gameCompleted) {
      // Level complete!
      const levelBonus = Math.max(0, 100 - timer);
      const levelScore = calculateLevelScore() + levelBonus;
      
      setScore(prevScore => prevScore + levelScore);
      
      toast({
        title: `Level ${level} Complete!`,
        description: `You've earned ${levelScore} points! Time bonus: ${levelBonus}`,
      });
      
      // Check if we've completed all levels
      if (level < totalLevels) {
        setTimeout(() => {
          startNextLevel();
        }, 2000);
      } else {
        // Game complete!
        setTimeout(() => {
          setGameCompleted(true);
          // Final score calculation happens in the effect watching gameCompleted
        }, 2000);
      }
    }
  }, [matchedPairs, level, gameCompleted]);
  
  // Calculate final score when game completes
  useEffect(() => {
    if (gameCompleted) {
      calculateFinalScore();
    }
  }, [gameCompleted]);
  
  const calculateFinalScore = () => {
    // Base score has been accumulated through levels
    let finalScore = score;
    
    // Perfect match bonus
    if (perfectMatches > 0) {
      const perfectBonus = perfectMatches * 15;
      finalScore += perfectBonus;
      
      toast({
        title: "Decoder Bonus!",
        description: `+${perfectBonus} points for ${perfectMatches} perfect encrypted matches!`,
      });
    }
    
    // Cap at 100
    finalScore = Math.min(100, finalScore);
    setScore(finalScore);
    
    // Complete the game
    onComplete(finalScore);
  };
  
  // Start next level
  const startNextLevel = () => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setMatchedPairs(0);
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    
    // Increase difficulty - less time for higher levels
    setTimeLimit(Math.max(60, 120 - ((nextLevel - 1) * 20)));
    
    // Initialize new cards
    initializeCards(nextLevel);
  };
  
  // Calculate score for current level
  const calculateLevelScore = () => {
    // Base points for completing the level
    const basePoints = level * 10;
    
    // Efficiency bonus (fewer moves = more points)
    const perfectMoves = pairsPerLevel[level - 1] * 2; // Minimum moves needed
    const movesBonus = Math.max(0, 20 - Math.max(0, moves - perfectMoves) * 2);
    
    return basePoints + movesBonus;
  };
  
  // Initialize game
  const initializeGame = (selectedLevel = 1) => {
    setLevel(selectedLevel);
    setMatchedPairs(0);
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setScore(0);
    setPerfectMatches(0);
    setGameCompleted(false);
    
    // Set time limit based on level
    setTimeLimit(Math.max(60, 120 - ((selectedLevel - 1) * 20)));
    
    // Initialize cards for the selected level
    initializeCards(selectedLevel);
    
    setGameStarted(true);
  };
  
  // Initialize cards for a specific level
  const initializeCards = (gameLevel: number) => {
    // Get pairs for this level
    const pairs = passwordPairs[gameLevel - 1];
    const gamePairs = pairs.slice(0, pairsPerLevel[gameLevel - 1]);
    
    // Create card pairs
    const gameCards: PasswordCard[] = [];
    
    // Add cards
    gamePairs.forEach((pair, pairIndex) => {
      // Transform passwords based on level
      const weakTransform = transformPassword(pair.weak, gameLevel);
      const strongTransform = transformPassword(pair.strong, gameLevel);
      
      // Add weak password card
      gameCards.push({
        id: pairIndex * 2,
        displayContent: weakTransform.displayed,
        originalContent: weakTransform.original,
        encodingType: weakTransform.encodingType,
        matched: false,
        flipped: false,
        pairId: pairIndex
      });
      
      // Add strong password card
      gameCards.push({
        id: pairIndex * 2 + 1,
        displayContent: strongTransform.displayed,
        originalContent: strongTransform.original,
        encodingType: strongTransform.encodingType,
        matched: false,
        flipped: false,
        pairId: pairIndex
      });
    });
    
    // Shuffle cards
    const shuffledCards = [...gameCards].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore if already flipped or matched
    if (flippedCards.length >= 2 || 
        cards.find(card => card.id === id)?.matched || 
        flippedCards.includes(id)) {
      return;
    }
    
    // Flip the card
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    setCards(cards.map(card => 
      card.id === id ? { ...card, flipped: true } : card
    ));
    
    // Check for match if we have 2 cards flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const firstCard = cards.find(card => card.id === newFlippedCards[0]);
      const secondCard = cards.find(card => card.id === newFlippedCards[1]);
      
      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Cards match! 
        setTimeout(() => {
          setCards(cards.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, matched: true } 
              : card
          ));
          setFlippedCards([]);
          setMatchedPairs(prev => prev + 1);
          
          // Perfect match bonus (both cards were encoded)
          if (firstCard.encodingType !== "plaintext" && secondCard.encodingType !== "plaintext" && 
              firstCard.encodingType !== "obfuscated" && secondCard.encodingType !== "obfuscated") {
            setPerfectMatches(prev => prev + 1);
            toast({
              title: "Decoder Achievement!",
              description: "Perfect encrypted match! Bonus points awarded!",
              duration: 2000,
            });
          } else {
            // Regular match toast
            toast({
              title: "Match found!",
              description: "You've paired a weak password with its stronger alternative!",
              duration: 2000,
            });
          }
        }, 1000);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards(cards.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, flipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get level description
  const getLevelDescription = () => {
    switch(level) {
      case 1:
        return "Match weak passwords with their stronger alternatives. Some passwords may be partially hidden.";
      case 2:
        return "Passwords may be encoded with Base64, ROT13, or Leet speak. Match pairs carefully!";
      case 3:
        return "Advanced challenge! Some passwords are heavily obfuscated or even hashed. Use pattern recognition!";
      default:
        return "";
    }
  };
  
  // Get encoding type description
  const getEncodingDescription = (type: string) => {
    switch(type) {
      case "plaintext":
        return "Plain Text";
      case "obfuscated":
        return "Partially Hidden";
      case "base64":
        return "Base64 Encoded";
      case "rot13":
        return "ROT13 Cipher";
      case "leetspeak":
        return "Leet Speak";
      case "hashed":
        return "SHA-256 Hash (Preview)";
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cipher Sync</h3>
        {gameStarted && !gameCompleted && (
          <div className="flex items-center gap-3">
            <Badge variant={timer > timeLimit * 0.8 ? "destructive" : "outline"} className={timer > timeLimit * 0.8 ? "" : "bg-primary/10"}>
              <Clock className="h-3.5 w-3.5 mr-1" /> {formatTime(timer)}/{formatTime(timeLimit)}
            </Badge>
            <Badge variant="outline" className="bg-primary/10">Moves: {moves}</Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {matchedPairs}/{pairsPerLevel[level-1]}
            </Badge>
          </div>
        )}
      </div>
      
      {gameStarted && !gameCompleted && (
        <div className="mb-4 mt-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Level {level}/{totalLevels}</span>
            <span className="text-xs text-muted-foreground">Score: {score}</span>
          </div>
          <Progress value={(level/totalLevels) * 100} className="h-1" />
        </div>
      )}
      
      {!gameStarted ? (
        <div className="text-center py-10">
          <Shield className="h-16 w-16 mx-auto text-primary mb-6" />
          <h4 className="text-xl font-bold mb-3">Cipher Sync Challenge</h4>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
            Match weak passwords with their stronger alternatives through multiple levels of increasing difficulty.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Button onClick={() => initializeGame(1)} className="flex items-center gap-2">
              <Brain className="h-4 w-4" /> Start Level 1
            </Button>
            <Button onClick={() => initializeGame(2)} variant="outline" className="flex items-center gap-2">
              <Brain className="h-4 w-4" /> Start Level 2
            </Button>
            <Button onClick={() => initializeGame(3)} variant="outline" className="flex items-center gap-2">
              <Brain className="h-4 w-4" /> Start Level 3
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            <p>Level 1: Basic matching</p>
            <p>Level 2: Encoded passwords</p>
            <p>Level 3: Advanced security challenge</p>
          </div>
        </div>
      ) : gameCompleted ? (
        <div className="text-center py-10">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h4 className="text-xl font-bold mb-2">Game Complete!</h4>
          <p className="text-lg mb-1">
            Score: <span className="text-primary font-bold">{score}</span>/100
          </p>
          <p className="text-sm text-slate-500 mb-2">
            Completed {level}/{totalLevels} levels with {perfectMatches} perfect encrypted matches
          </p>
          {perfectMatches >= 3 && (
            <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
              <p className="font-medium text-amber-800 dark:text-amber-300">Achievement Unlocked!</p>
              <p className="text-sm">Decoder Chip: Master of encrypted password matching</p>
            </div>
          )}
          <Button onClick={() => initializeGame(1)} className="flex items-center mr-2">
            <RefreshCw className="h-4 w-4 mr-2" /> Play Again
          </Button>
          <Button onClick={() => onComplete(score)} className="mt-3">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div>
          <div className="bg-muted/50 px-3 py-2 rounded-lg text-sm mb-4">
            <p>{getLevelDescription()}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card) => (
              <Card 
                key={card.id}
                className={`h-28 flex flex-col items-center justify-center cursor-pointer transition-all p-2 ${
                  card.flipped 
                    ? card.matched
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                } ${card.matched ? "opacity-50" : "opacity-100"}`}
                onClick={() => !card.matched && !card.flipped && handleCardClick(card.id)}
              >
                {card.flipped || card.matched ? (
                  <div className="text-center h-full flex flex-col justify-between py-1">
                    <div className="flex items-center justify-center gap-1">
                      <div className={`text-xs px-1.5 py-0.5 rounded ${
                        card.id % 2 === 0 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" 
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      }`}>
                        {card.id % 2 === 0 ? "Weak" : "Strong"}
                      </div>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{getEncodingDescription(card.encodingType)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="font-mono text-xs break-all overflow-hidden max-h-12">
                      {card.displayContent}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded">
                    <span className="text-2xl text-primary/30">?</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {gameStarted && !gameCompleted && (
        <div className="text-center text-xs text-muted-foreground mt-4">
          Match weak passwords with their stronger alternatives to progress
        </div>
      )}
    </div>
  );
};

export default PasswordMatchingGame;
