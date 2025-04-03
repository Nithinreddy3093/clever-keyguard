
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Target, Crown } from "lucide-react";

interface PlayerProfileProps {
  playerLevel: number;
  playerXp: number;
  xpToNextLevel: number;
  streak: number;
  globalRank: number | null;
  questsCompleted: number;
}

const PlayerProfile = ({
  playerLevel,
  playerXp,
  xpToNextLevel,
  streak,
  globalRank,
  questsCompleted
}: PlayerProfileProps) => {
  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="flex items-center justify-center mb-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <div className="ml-4 text-left">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">Level {playerLevel}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Shadow Protector
          </div>
        </div>
      </div>
      <div className="w-full max-w-xs">
        <div className="mb-1 flex justify-between text-xs">
          <span>{playerXp} XP</span>
          <span>{xpToNextLevel} XP</span>
        </div>
        <Progress value={(playerXp / xpToNextLevel) * 100} />
        <div className="mt-1 text-xs text-center text-slate-500 dark:text-slate-400">
          {xpToNextLevel - playerXp} XP until level {playerLevel + 1}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Badge variant="outline" className="flex items-center bg-slate-100 dark:bg-slate-700">
          <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
          <span>{streak} day streak</span>
        </Badge>
        {globalRank && (
          <Badge variant="outline" className="flex items-center bg-slate-100 dark:bg-slate-700">
            <Trophy className="h-3.5 w-3.5 mr-1 text-indigo-500" />
            <span>Rank #{globalRank}</span>
          </Badge>
        )}
        <Badge variant="outline" className="flex items-center bg-slate-100 dark:bg-slate-700">
          <Target className="h-3.5 w-3.5 mr-1 text-emerald-500" />
          <span>{questsCompleted} quests completed</span>
        </Badge>
      </div>
    </div>
  );
};

export default PlayerProfile;
