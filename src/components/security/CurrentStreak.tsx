
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface CurrentStreakProps {
  passwordStreak: number;
}

const CurrentStreak = ({ passwordStreak }: CurrentStreakProps) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
          <Award className="h-4 w-4 mr-2 text-amber-500" />
          Current Streak
        </h3>
        <Badge 
          variant={passwordStreak > 0 ? "default" : "outline"}
          className={passwordStreak > 0 ? "bg-amber-500" : ""}
        >
          {passwordStreak} days
        </Badge>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {passwordStreak > 0 
          ? `Keep it up! You've maintained secure passwords for ${passwordStreak} days.`
          : "Start your streak by creating a secure password today!"}
      </p>
    </div>
  );
};

export default CurrentStreak;
