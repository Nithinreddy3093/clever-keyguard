
import { useEffect, useState } from "react";
import useGameProgress from "@/hooks/useGameProgress";
import GameTabs from "@/components/game/GameTabs";
import GameDialogs from "@/components/game/GameDialogs";
import PasswordGameLayout from "@/components/game/PasswordGameLayout";
import { usePasswordAnalysis } from "@/hooks/game/usePasswordAnalysis";
import { useUsernameManagement } from "@/hooks/game/useUsernameManagement";
import { useDailyCheckin } from "@/hooks/game/useDailyCheckin";
import { useQuestCompletion } from "@/hooks/game/useQuestCompletion";
import { useProgressSaving } from "@/hooks/game/useProgressSaving";
import { useAchievementViewer } from "@/hooks/game/useAchievementViewer";
import PasswordArcadeIntro from "@/components/game/PasswordArcadeIntro";

const PasswordGame = () => {
  const [showIntro, setShowIntro] = useState(true);
  const { password, analysis, handlePasswordChange } = usePasswordAnalysis();
  const { username, handleUsernameChange } = useUsernameManagement();
  const { showDailyCheckin, setShowDailyCheckin, handleCheckIn } = useDailyCheckin();
  const { showReward, setShowReward, rewardText, handleQuestComplete } = useQuestCompletion();
  const { saveToSupabase } = useProgressSaving();
  const { selectedAchievement, setSelectedAchievement, viewAchievement } = useAchievementViewer();
  
  const gameProgress = useGameProgress();
  
  const {
    streak,
    achievements,
    questsCompleted,
    dailyChallenges,
    playerLevel,
    playerXp,
    xpToNextLevel,
    todayCompleted,
    globalRank,
    generateDailyChallenges,
  } = gameProgress;

  useEffect(() => {
    generateDailyChallenges();
  }, []);

  const handleSaveProgress = () => {
    saveToSupabase(username, password, analysis);
  };

  const handleEnterArcade = () => {
    setShowIntro(false);
  };

  // Check local storage to see if they've seen the intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('passwordArcadeIntroSeen');
    if (hasSeenIntro === 'true') {
      setShowIntro(false);
    }
  }, []);

  // Save that they've seen the intro
  useEffect(() => {
    if (!showIntro) {
      localStorage.setItem('passwordArcadeIntroSeen', 'true');
    }
  }, [showIntro]);

  if (showIntro) {
    return (
      <PasswordGameLayout>
        <PasswordArcadeIntro onEnter={handleEnterArcade} playerLevel={playerLevel} />
      </PasswordGameLayout>
    );
  }

  return (
    <PasswordGameLayout>
      <GameTabs
        username={username}
        onUsernameChange={handleUsernameChange}
        password={password}
        onPasswordChange={handlePasswordChange}
        analysis={analysis}
        streak={streak}
        onSaveProgress={handleSaveProgress}
        onChallengeComplete={gameProgress.handleDailyChallengeComplete}
        dailyChallenges={dailyChallenges}
        todayCompleted={todayCompleted}
        playerLevel={playerLevel}
        playerXp={playerXp}
        xpToNextLevel={xpToNextLevel}
        globalRank={globalRank}
        questsCompleted={questsCompleted}
        onQuestComplete={handleQuestComplete}
        achievements={achievements}
        onViewAchievement={viewAchievement}
      />
      
      <GameDialogs 
        selectedAchievement={selectedAchievement}
        setSelectedAchievement={setSelectedAchievement}
        showReward={showReward}
        setShowReward={setShowReward}
        rewardText={rewardText}
        showDailyCheckin={showDailyCheckin}
        setShowDailyCheckin={setShowDailyCheckin}
        handleCheckIn={handleCheckIn}
      />
    </PasswordGameLayout>
  );
};

export default PasswordGame;
