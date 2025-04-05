
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { 
  calculateSecurityScore, 
  getSecurityLevel
} from "@/lib/securityScoreCalculator";
import SecurityScoreDisplay from "./security/SecurityScoreDisplay";
import ScoreBreakdown from "./security/ScoreBreakdown";
import CurrentStreak from "./security/CurrentStreak";
import QuestProgress from "./security/QuestProgress";
import ImprovementTips from "./security/ImprovementTips";

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
    // Calculate score using our utility function
    const { securityScore: newScore, scoreBreakdown: newBreakdown } = calculateSecurityScore(
      passwordScore,
      questsCompleted,
      totalQuests,
      passwordStreak,
      hasCommonPattern,
      isCommon
    );
    
    // Animate score change
    const startScore = securityScore;
    const endScore = newScore;
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
    setScoreBreakdown(newBreakdown);
  }, [passwordScore, questsCompleted, totalQuests, passwordStreak, hasCommonPattern, isCommon]);
  
  // Get security level based on security score
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Security Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SecurityScoreDisplay 
          securityScore={securityScore}
          securityLevel={securityLevel}
        />
        
        <div className="space-y-4">
          {/* Score Breakdown */}
          <ScoreBreakdown scoreBreakdown={scoreBreakdown} />
          
          {/* Current Streak */}
          <CurrentStreak passwordStreak={passwordStreak} />
          
          {/* Quest Progress */}
          <QuestProgress 
            questsCompleted={questsCompleted}
            totalQuests={totalQuests}
          />
          
          {/* Improvement Tips */}
          <ImprovementTips
            passwordScore={passwordScore}
            questsCompleted={questsCompleted}
            totalQuests={totalQuests}
            passwordStreak={passwordStreak}
            hasCommonPattern={hasCommonPattern}
            isCommon={isCommon}
            scoreBreakdown={scoreBreakdown}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;
