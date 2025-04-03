
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Globe, Timer, ThumbsUp, Target } from "lucide-react";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
  expiresAt: string;
}

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  onChallengeComplete: (challenge: DailyChallenge) => void;
  todayCompleted: boolean;
}

const DailyChallenges = ({ challenges, onChallengeComplete, todayCompleted }: DailyChallengesProps) => {
  return (
    <Card className="mb-6 border-none shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600">
        <CardTitle className="text-xl flex items-center text-white">
          <Calendar className="mr-2 h-5 w-5 text-white" />
          Daily Challenges
          {todayCompleted && (
            <Badge className="ml-2 bg-green-500">Completed</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id}
              className={`p-4 rounded-lg border ${
                challenge.completed 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                  : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                    {challenge.title}
                    {challenge.completed && (
                      <ThumbsUp className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {challenge.description}
                  </p>
                  <div className="mt-2 flex items-center">
                    <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                      +{challenge.xp} XP
                    </Badge>
                    <div className="ml-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Timer className="h-3.5 w-3.5 mr-1" />
                      Expires at midnight
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`p-2 rounded-full ${
                    challenge.completed 
                      ? "bg-green-100 dark:bg-green-900/30" 
                      : "bg-amber-100 dark:bg-amber-900/30"
                  }`}>
                    {challenge.completed 
                      ? <ThumbsUp className="h-6 w-6 text-green-500" />
                      : <Target className="h-6 w-6 text-amber-500" />
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full" 
            asChild
          >
            <Link to="/rankings">
              <Globe className="mr-2 h-4 w-4" />
              View Global Rankings
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChallenges;
