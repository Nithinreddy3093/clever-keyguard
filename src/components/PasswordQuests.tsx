
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Star, Trophy, Zap, Award, Lock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordQuest {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  completed: boolean;
  progress?: number;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
}

interface PasswordQuestsProps {
  passwordLength: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  entropy: number;
  score: number;
  onQuestComplete?: (quest: PasswordQuest) => void;
}

const PasswordQuests = ({
  passwordLength,
  hasUpper,
  hasLower,
  hasDigit,
  hasSpecial,
  entropy,
  score,
  onQuestComplete
}: PasswordQuestsProps) => {
  // Initialize quests with their completion status based on password properties
  const [quests, setQuests] = useState<PasswordQuest[]>([
    {
      id: "length15",
      title: "Size Matters",
      description: "Create a password with 15+ characters",
      icon: <Flag className="h-5 w-5 text-emerald-500" />,
      completed: false,
      progress: 0,
      reward: "Length Master Badge",
      difficulty: "easy",
      xp: 10
    },
    {
      id: "allChars",
      title: "Character Collector",
      description: "Use uppercase, lowercase, numbers and special characters",
      icon: <Star className="h-5 w-5 text-amber-500" />,
      completed: false,
      progress: 0,
      reward: "Diversity Badge",
      difficulty: "medium",
      xp: 15
    },
    {
      id: "entropy",
      title: "Entropy Guardian",
      description: "Create a password with 60+ bits of entropy",
      icon: <Zap className="h-5 w-5 text-indigo-500" />,
      completed: false,
      progress: 0,
      reward: "Entropy Master Badge",
      difficulty: "hard",
      xp: 20
    },
    {
      id: "perfectScore",
      title: "Perfect Security",
      description: "Achieve a perfect password score",
      icon: <Trophy className="h-5 w-5 text-purple-500" />,
      completed: false,
      progress: 0,
      reward: "Security Champion Badge",
      difficulty: "hard",
      xp: 25
    }
  ]);

  // Update quest progress when password properties change
  useEffect(() => {
    const updatedQuests = [...quests];
    
    // Update "Size Matters" quest
    const lengthQuest = updatedQuests.find(q => q.id === "length15");
    if (lengthQuest) {
      const progress = Math.min(100, (passwordLength / 15) * 100);
      const completed = passwordLength >= 15;
      
      lengthQuest.progress = progress;
      
      if (completed && !lengthQuest.completed) {
        lengthQuest.completed = true;
        onQuestComplete?.(lengthQuest);
      }
    }
    
    // Update "Character Collector" quest
    const charsQuest = updatedQuests.find(q => q.id === "allChars");
    if (charsQuest) {
      let charsCount = 0;
      if (hasUpper) charsCount++;
      if (hasLower) charsCount++;
      if (hasDigit) charsCount++;
      if (hasSpecial) charsCount++;
      
      const progress = (charsCount / 4) * 100;
      const completed = charsCount === 4;
      
      charsQuest.progress = progress;
      
      if (completed && !charsQuest.completed) {
        charsQuest.completed = true;
        onQuestComplete?.(charsQuest);
      }
    }
    
    // Update "Entropy Guardian" quest
    const entropyQuest = updatedQuests.find(q => q.id === "entropy");
    if (entropyQuest) {
      const progress = Math.min(100, (entropy / 60) * 100);
      const completed = entropy >= 60;
      
      entropyQuest.progress = progress;
      
      if (completed && !entropyQuest.completed) {
        entropyQuest.completed = true;
        onQuestComplete?.(entropyQuest);
      }
    }
    
    // Update "Perfect Security" quest
    const scoreQuest = updatedQuests.find(q => q.id === "perfectScore");
    if (scoreQuest) {
      const progress = (score / 4) * 100;
      const completed = score === 4;
      
      scoreQuest.progress = progress;
      
      if (completed && !scoreQuest.completed) {
        scoreQuest.completed = true;
        onQuestComplete?.(scoreQuest);
      }
    }
    
    setQuests(updatedQuests);
  }, [passwordLength, hasUpper, hasLower, hasDigit, hasSpecial, entropy, score, onQuestComplete]);

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Flag className="mr-2 h-5 w-5 text-primary" />
          Password Quests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quests.map((quest) => (
            <div 
              key={quest.id}
              className={cn(
                "p-4 rounded-lg transition-all duration-300",
                quest.completed 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-50 dark:bg-slate-700"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {quest.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      quest.icon
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                      {quest.title}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "ml-2 text-xs",
                          quest.difficulty === "easy" ? "text-emerald-500" :
                          quest.difficulty === "medium" ? "text-amber-500" :
                          "text-red-500"
                        )}
                      >
                        {quest.difficulty}
                      </Badge>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {quest.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    {quest.xp} XP
                  </span>
                  {quest.completed ? (
                    <Badge variant="outline" className="mt-1 text-emerald-500 border-emerald-500">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1 text-amber-500 border-amber-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
              {typeof quest.progress === 'number' && (
                <div className="mt-3">
                  <Progress 
                    value={quest.progress} 
                    className="h-2"
                    indicatorClassName={
                      quest.completed 
                        ? "bg-emerald-500" 
                        : quest.progress > 50 
                          ? "bg-amber-500" 
                          : "bg-slate-400"
                    }
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Progress: {Math.round(quest.progress)}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      Reward: {quest.reward}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordQuests;
