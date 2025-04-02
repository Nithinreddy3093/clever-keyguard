
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, AlertTriangle, Check, Info, ChevronUp, ChevronDown, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityDashboardProps {
  passwordScore: number;
  passwordEntropy: number;
  hasCommonPattern: boolean;
  isCommon: boolean;
  hackabilityScore?: {
    score: number;
    riskLevel: string;
    timeToHack: string;
  };
  passwordStreak?: number;
  questsCompleted?: number;
  totalQuests?: number;
}

const SecurityDashboard = ({
  passwordScore,
  passwordEntropy,
  hasCommonPattern,
  isCommon,
  hackabilityScore,
  passwordStreak = 0,
  questsCompleted = 0,
  totalQuests = 4
}: SecurityDashboardProps) => {
  const [securityScore, setSecurityScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    passwordStrength: 0,
    questProgress: 0,
    streakBonus: 0
  });
  
  // Calculate overall security score
  useEffect(() => {
    // Password strength makes up 50% of security score
    const strengthScore = (passwordScore / 4) * 50;
    
    // Quest completion makes up 30% of security score
    const questScore = (questsCompleted / totalQuests) * 30;
    
    // Streak bonus makes up 20% of security score (max 7 days)
    const streakScore = Math.min(passwordStreak, 7) / 7 * 20;
    
    // Deduct for common passwords or patterns
    const patternPenalty = hasCommonPattern ? 10 : 0;
    const commonPenalty = isCommon ? 30 : 0;
    
    // Combine scores with penalties
    const totalScore = Math.max(0, Math.min(100, 
      strengthScore + questScore + streakScore - patternPenalty - commonPenalty
    ));
    
    setScoreBreakdown({
      passwordStrength: strengthScore,
      questProgress: questScore,
      streakBonus: streakScore
    });
    
    // Animate score change
    const startScore = securityScore;
    const endScore = Math.round(totalScore);
    const duration = 1000;
    const startTime = performance.now();
    
    const animateScore = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentScore = Math.round(startScore + (endScore - startScore) * progress);
      
      setSecurityScore(currentScore);
      
      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };
    
    requestAnimationFrame(animateScore);
  }, [passwordScore, questsCompleted, totalQuests, passwordStreak, hasCommonPattern, isCommon]);
  
  // Get security level based on security score
  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: "Fortress", color: "text-emerald-500" };
    if (score >= 75) return { level: "Secured", color: "text-green-500" };
    if (score >= 60) return { level: "Protected", color: "text-blue-500" };
    if (score >= 40) return { level: "Moderate", color: "text-amber-500" };
    if (score >= 20) return { level: "Vulnerable", color: "text-orange-500" };
    return { level: "Critical", color: "text-red-500" };
  };
  
  const securityLevel = getSecurityLevel(securityScore);
  
  // Get color for security score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };
  
  // Get color for progress bar
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Security Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-2">
            <div className="relative">
              <svg className="w-24 h-24">
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="8"
                  className="dark:stroke-slate-600"
                />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  fill="none" 
                  stroke={getProgressColor(securityScore).replace('bg-', 'text-')} 
                  strokeWidth="8"
                  strokeDasharray={`${securityScore * 2.51} 251`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
                  {securityScore}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Security Score
                </span>
              </div>
            </div>
          </div>
          <h3 className={`text-xl font-bold ${securityLevel.color}`}>
            {securityLevel.level}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your security level based on password habits
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Score Breakdown */}
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
          
          {/* Current Streak */}
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
          
          {/* Quest Progress */}
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
          
          {/* Improvement Tips */}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;
