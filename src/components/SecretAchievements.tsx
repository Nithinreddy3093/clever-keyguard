
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Gift, Star, Lock, Trophy, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  secret: boolean;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

interface SecretAchievementsProps {
  achievements: Achievement[];
  onViewAchievement?: (achievement: Achievement) => void;
}

const SecretAchievements = ({
  achievements,
  onViewAchievement
}: SecretAchievementsProps) => {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unlocked" | "locked">("all");
  
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "unlocked") return achievement.unlocked;
    if (selectedFilter === "locked") return !achievement.unlocked;
    return true;
  });
  
  // Calculate progress
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;
  
  // Get rarity color
  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-slate-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-500";
      case "legendary":
        return "bg-purple-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Secret Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Achievements Unlocked
            </h3>
            <span className="text-sm font-medium text-primary">
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Badge 
            variant={selectedFilter === "all" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              selectedFilter === "all" ? "bg-primary hover:bg-primary/80" : "hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Badge>
          <Badge 
            variant={selectedFilter === "unlocked" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              selectedFilter === "unlocked" ? "bg-emerald-500 hover:bg-emerald-600" : "hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
            onClick={() => setSelectedFilter("unlocked")}
          >
            <Star className="h-3 w-3 mr-1" />
            Unlocked
          </Badge>
          <Badge 
            variant={selectedFilter === "locked" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              selectedFilter === "locked" ? "bg-slate-500 hover:bg-slate-600" : "hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
            onClick={() => setSelectedFilter("locked")}
          >
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAchievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={cn(
                "p-4 rounded-lg cursor-pointer transform transition-all hover:scale-[1.02] relative overflow-hidden",
                achievement.unlocked 
                  ? "bg-slate-50 dark:bg-slate-700" 
                  : "bg-slate-100 dark:bg-slate-800"
              )}
              onClick={() => onViewAchievement?.(achievement)}
            >
              {/* Rarity indicator */}
              <div className={cn(
                "absolute top-0 right-0 w-8 h-8 transform translate-x-4 -translate-y-4 rotate-45",
                getRarityColor(achievement.rarity)
              )}></div>
              
              <div className="flex items-start">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  achievement.unlocked
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "bg-slate-200 dark:bg-slate-600"
                )}>
                  {achievement.unlocked ? (
                    achievement.icon || <Award className={`h-5 w-5 text-amber-500`} />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {achievement.unlocked || !achievement.secret 
                      ? achievement.title 
                      : "Secret Achievement"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {achievement.unlocked || !achievement.secret
                      ? achievement.description
                      : "Complete specific actions to unlock this secret achievement"}
                  </p>
                  
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        achievement.unlocked 
                          ? "border-emerald-500 text-emerald-500" 
                          : "border-slate-400 text-slate-400"
                      )}
                    >
                      {achievement.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "ml-2 text-xs border-none",
                        getRarityColor(achievement.rarity),
                        "bg-opacity-20 dark:bg-opacity-20",
                        achievement.rarity === "common" ? "text-slate-500" :
                        achievement.rarity === "uncommon" ? "text-green-500" :
                        achievement.rarity === "rare" ? "text-blue-500" :
                        "text-purple-500"
                      )}
                    >
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecretAchievements;
