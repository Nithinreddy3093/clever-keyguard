
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordMatchingGameProps {
  onComplete: (score: number) => void;
}

interface PasswordCard {
  id: number;
  content: string;
  type: 'weak' | 'strong';
  matched: boolean;
  flipped: boolean;
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
  
  const totalPairs = 6;
  const weakPasswords = ['password123', 'qwerty', 'letmein', '123456', 'admin', 'welcome'];
  const strongPasswords = ['P@ssw0rd!2023', 'Tr0ub4dor&3', 'C0rr3ct-H0rs3-B4tt3ry', 'D#6bKl$9pZ', 'N3v3rGu3ss!', 'S3cur3P@$$w0rd!'];
  
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameCompleted]);
  
  // Calculate score when game completes
  useEffect(() => {
    if (gameCompleted) {
      // Time bonus (faster = more points)
      const timeBonus = Math.max(0, 100 - timer);
      
      // Move efficiency bonus (fewer moves = more points)
      const moveEfficiency = Math.max(0, 100 - (moves - totalPairs * 2) * 5);
      
      // Calculate final score (max 100)
      const calculatedScore = Math.min(100, Math.round((timeBonus * 0.5) + (moveEfficiency * 0.5)));
      
      setScore(calculatedScore);
      onComplete(calculatedScore);
    }
  }, [gameCompleted]);
  
  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards (weak password -> strong alternative)
    const gameCards: PasswordCard[] = [];
    
    // Add weak passwords
    weakPasswords.slice(0, totalPairs).forEach((pwd, index) => {
      gameCards.push({
        id: index * 2,
        content: pwd,
        type: 'weak',
        matched: false,
        flipped: false
      });
    });
    
    // Add strong passwords
    strongPasswords.slice(0, totalPairs).forEach((pwd, index) => {
      gameCards.push({
        id: index * 2 + 1,
        content: pwd,
        type: 'strong',
        matched: false,
        flipped: false
      });
    });
    
    // Shuffle cards
    const shuffledCards = [...gameCards].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameCompleted(false);
    setGameStarted(true);
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
      
      // Match if one is weak and one is strong (create pairs)
      if (firstCard && secondCard && 
          firstCard.type !== secondCard.type) {
        // Cards match! (different types)
        setTimeout(() => {
          setCards(cards.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, matched: true } 
              : card
          ));
          setFlippedCards([]);
          setMatchedPairs(prev => {
            const newMatched = prev + 1;
            if (newMatched === totalPairs) {
              setGameCompleted(true);
            }
            return newMatched;
          });
          
          // Show toast on match
          toast({
            title: "Great match!",
            description: "You've paired a weak password with its stronger alternative!",
            duration: 2000,
          });
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Password Matching Game</h3>
        {gameStarted && !gameCompleted && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center bg-primary/10">
              <Clock className="h-3.5 w-3.5 mr-1" /> {formatTime(timer)}
            </Badge>
            <Badge variant="outline" className="bg-primary/10">Moves: {moves}</Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {matchedPairs}/{totalPairs}
            </Badge>
          </div>
        )}
      </div>
      
      {!gameStarted ? (
        <div className="text-center py-10">
          <h4 className="text-xl font-bold mb-3">Match Weak Passwords with Strong Alternatives</h4>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Flip cards to find and pair weak passwords with their stronger counterparts.
          </p>
          <Button onClick={initializeGame}>Start Game</Button>
        </div>
      ) : gameCompleted ? (
        <div className="text-center py-10">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h4 className="text-xl font-bold mb-2">Game Complete!</h4>
          <p className="text-lg mb-1">
            Score: <span className="text-primary font-bold">{score}</span>/100
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Completed in {formatTime(timer)} with {moves} moves
          </p>
          <Button onClick={initializeGame} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" /> Play Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <Card 
              key={card.id}
              className={`h-24 flex items-center justify-center cursor-pointer transition-all p-2 ${
                card.flipped 
                  ? card.type === 'weak' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200' 
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${card.matched ? 'opacity-50' : 'opacity-100'}`}
              onClick={() => !card.matched && handleCardClick(card.id)}
            >
              {card.flipped || card.matched ? (
                <div className="text-center">
                  <div className={`text-xs mb-1 ${
                    card.type === 'weak' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {card.type === 'weak' ? 'Weak Password' : 'Strong Alternative'}
                  </div>
                  <div className="font-mono text-sm break-all overflow-hidden">
                    {card.content}
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
      )}
    </div>
  );
};

export default PasswordMatchingGame;
