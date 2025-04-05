
import { Progress } from "@/components/ui/progress";
import { Lock, Star, Award } from "lucide-react";
import { ScoreBreakdown as ScoreBreakdownType } from "@/lib/securityScoreCalculator";

interface ScoreBreakdownProps {
  scoreBreakdown: ScoreBreakdownType;
}

const ScoreBreakdown = ({ scoreBreakdown }: ScoreBreakdownProps) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <h3 className="font-medium text-slate-900 dark:text-white mb-3">
        Score Breakdown
      </h3>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Password Strength
            </span>
            <span className="text-sm font-medium">
              {Math.round(scoreBreakdown.passwordStrength)}/50
            </span>
          </div>
          <Progress 
            value={(scoreBreakdown.passwordStrength / 50) * 100} 
            className="h-1.5"
            indicatorClassName="bg-blue-500"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Quest Progress
            </span>
            <span className="text-sm font-medium">
              {Math.round(scoreBreakdown.questProgress)}/30
            </span>
          </div>
          <Progress 
            value={(scoreBreakdown.questProgress / 30) * 100} 
            className="h-1.5"
            indicatorClassName="bg-amber-500"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Streak Bonus
            </span>
            <span className="text-sm font-medium">
              {Math.round(scoreBreakdown.streakBonus)}/20
            </span>
          </div>
          <Progress 
            value={(scoreBreakdown.streakBonus / 20) * 100} 
            className="h-1.5"
            indicatorClassName="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
