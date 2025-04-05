
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface QuestProgressProps {
  questsCompleted: number;
  totalQuests: number;
}

const QuestProgress = ({ questsCompleted, totalQuests }: QuestProgressProps) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
          <Star className="h-4 w-4 mr-2 text-indigo-500" />
          Quest Progress
        </h3>
        <span className="text-sm font-medium">
          {questsCompleted}/{totalQuests}
        </span>
      </div>
      <Progress 
        value={(questsCompleted / totalQuests) * 100} 
        className="h-2 mt-2"
        indicatorClassName="bg-indigo-500"
      />
    </div>
  );
};

export default QuestProgress;
