
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Trophy, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChallengesProps {
  analysis: any;
  streak: number;
}

const Challenges = ({ analysis, streak }: ChallengesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
            <Zap className="mr-2 h-5 w-5 text-amber-500" />
            Time-to-Crack Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Beat Your Best Time
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Create a password that takes longer to crack than your previous best!
                </p>
                {analysis && (
                  <div className="mt-3">
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-600">
                      Current: {analysis.hackabilityScore?.timeToHack || "N/A"}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Target className="h-8 w-8 text-amber-500" />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Badge className="bg-indigo-500">Challenge</Badge>
              <p className="text-sm font-medium mt-2 text-slate-800 dark:text-slate-200">
                Can you create a password that would take 1,000+ years to crack?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
            <Trophy className="mr-2 h-5 w-5 text-amber-500" />
            Security Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Daily Security Habit
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Complete at least one quest every day to maintain your streak
                </p>
                <div className="mt-3">
                  <Badge className={streak > 0 ? "bg-green-500" : "bg-slate-400"}>
                    {streak} day{streak !== 1 ? 's' : ''} streak
                  </Badge>
                </div>
              </div>
              <div className="ml-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Award className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  Maintain a 7-day streak to unlock the "Streak Master" badge!
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Challenges;
