
import { ChevronUp, ChevronDown } from "lucide-react";
import { ScoreBreakdown } from "@/lib/securityScoreCalculator";

interface ImprovementTipsProps {
  passwordScore: number;
  questsCompleted: number;
  totalQuests: number;
  passwordStreak: number;
  hasCommonPattern: boolean;
  isCommon: boolean;
  scoreBreakdown: ScoreBreakdown;
}

const ImprovementTips = ({
  passwordScore,
  questsCompleted,
  totalQuests,
  passwordStreak,
  hasCommonPattern,
  isCommon,
  scoreBreakdown
}: ImprovementTipsProps) => {
  return (
    <div className="mt-4">
      <h3 className="font-medium text-slate-900 dark:text-white mb-2">
        Quick Tips to Improve Your Score
      </h3>
      <ul className="space-y-2">
        {passwordScore < 4 && (
          <li className="flex items-start">
            <ChevronUp className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Improve your password strength (+{20 - Math.round(scoreBreakdown.passwordStrength / 50 * 20)} pts)
            </span>
          </li>
        )}
        
        {questsCompleted < totalQuests && (
          <li className="flex items-start">
            <ChevronUp className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Complete more password quests (+{Math.round(30 / totalQuests)} pts per quest)
            </span>
          </li>
        )}
        
        {passwordStreak < 7 && (
          <li className="flex items-start">
            <ChevronUp className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Maintain your password streak (+{Math.round(20 / 7)} pts per day)
            </span>
          </li>
        )}
        
        {hasCommonPattern && (
          <li className="flex items-start">
            <ChevronDown className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Avoid common patterns in your password (-10 pts)
            </span>
          </li>
        )}
        
        {isCommon && (
          <li className="flex items-start">
            <ChevronDown className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Don't use known common passwords (-30 pts)
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ImprovementTips;
