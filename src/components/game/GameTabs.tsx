
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Trophy, Target, Award } from "lucide-react";
import PlayerProfile from "./PlayerProfile";
import DailyChallenges from "./DailyChallenges";
import PasswordTester from "./PasswordTester";
import Challenges from "./Challenges";
import LeaderboardTab from "./LeaderboardTab";
import { DailyChallenge } from "./DailyChallenges";
import SecurityDashboard from "@/components/SecurityDashboard";
import PasswordQuests from "@/components/PasswordQuests";
import SecretAchievements from "@/components/SecretAchievements";
import { AchievementData } from "@/hooks/useGameProgress";

interface GameTabsProps {
  username: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  analysis: any | null;
  streak: number;
  onSaveProgress: () => void;
  onChallengeComplete: (challenge: DailyChallenge) => void;
  dailyChallenges: DailyChallenge[];
  todayCompleted: boolean;
  playerLevel: number;
  playerXp: number;
  xpToNextLevel: number;
  globalRank: number | null;
  questsCompleted: any[];
  onQuestComplete: (quest: any) => void;
  achievements: AchievementData[];
  onViewAchievement: (achievement: any) => void;
}

const GameTabs = ({
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  analysis,
  streak,
  onSaveProgress,
  onChallengeComplete,
  dailyChallenges,
  todayCompleted,
  playerLevel,
  playerXp,
  xpToNextLevel,
  globalRank,
  questsCompleted,
  onQuestComplete,
  achievements,
  onViewAchievement
}: GameTabsProps) => {
  const [activeTab, setActiveTab] = useState("game");
  
  return (
    <Tabs defaultValue="game" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="game" className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Password Game
        </TabsTrigger>
        <TabsTrigger value="challenges" className="flex items-center">
          <Target className="mr-2 h-4 w-4" />
          Challenges
        </TabsTrigger>
        <TabsTrigger value="leaderboard" className="flex items-center">
          <Trophy className="mr-2 h-4 w-4" />
          Leaderboard
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="game" className="mt-0 space-y-6">
        <PlayerProfile 
          playerLevel={playerLevel}
          playerXp={playerXp}
          xpToNextLevel={xpToNextLevel}
          streak={streak}
          globalRank={globalRank}
          questsCompleted={questsCompleted.length}
        />
        
        <DailyChallenges
          challenges={dailyChallenges}
          onChallengeComplete={onChallengeComplete}
          todayCompleted={todayCompleted}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PasswordTester 
            username={username}
            onUsernameChange={onUsernameChange}
            password={password}
            onPasswordChange={onPasswordChange}
            analysis={analysis}
            streak={streak}
            onSaveProgress={onSaveProgress}
          />
          
          {analysis && (
            <SecurityDashboard
              passwordScore={analysis.score}
              passwordEntropy={analysis.entropy}
              hasCommonPattern={analysis.hasCommonPattern}
              isCommon={analysis.isCommon}
              hackabilityScore={analysis.hackabilityScore}
              passwordStreak={streak}
              questsCompleted={questsCompleted.length}
              totalQuests={4}
            />
          )}
        </div>
        
        {analysis && (
          <PasswordQuests
            passwordLength={analysis.length}
            hasUpper={analysis.hasUpper}
            hasLower={analysis.hasLower}
            hasDigit={analysis.hasDigit}
            hasSpecial={analysis.hasSpecial}
            entropy={analysis.entropy}
            score={analysis.score}
            onQuestComplete={onQuestComplete}
          />
        )}
      </TabsContent>
      
      <TabsContent value="challenges" className="mt-0 space-y-6">
        {analysis && (
          <>
            <Challenges 
              analysis={analysis}
              streak={streak}
            />
            
            <SecretAchievements
              achievements={achievements.map(achievement => ({
                ...achievement,
                icon: (() => {
                  switch (achievement.icon) {
                    case "🔐": return <Award className="h-5 w-5 text-indigo-500" />;
                    case "🛡️": return <Shield className="h-5 w-5 text-blue-500" />;
                    default: return <Award className="h-5 w-5 text-primary" />;
                  }
                })()
              }))}
              onViewAchievement={onViewAchievement}
            />
          </>
        )}
        
        {!analysis && (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Award className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium mb-2">No Password Analysis</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Enter a password in the Password Game tab to unlock challenges and achievements.
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="leaderboard" className="mt-0">
        <LeaderboardTab />
      </TabsContent>
    </Tabs>
  );
};

export default GameTabs;
