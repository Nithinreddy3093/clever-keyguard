
import { useState } from "react";

export const useAchievementViewer = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const viewAchievement = (achievement: any) => {
    setSelectedAchievement(achievement);
  };

  return {
    selectedAchievement,
    setSelectedAchievement,
    viewAchievement
  };
};
