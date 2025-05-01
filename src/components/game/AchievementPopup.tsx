
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/components/SecretAchievements";
import { Shield, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementPopup = ({ achievement, onClose }: AchievementPopupProps) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (achievement) {
      setVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Call onClose after exit animation completes
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  // Get rarity color
  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return "bg-slate-500";
      case "uncommon": return "bg-green-500";
      case "rare": return "bg-blue-500";
      case "legendary": return "bg-purple-500";
      default: return "bg-slate-500";
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 right-10 z-50"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-amber-500 p-4 w-80">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                "bg-amber-100 dark:bg-amber-900/30"
              )}>
                {achievement.icon || <Trophy className="h-6 w-6 text-amber-500" />}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Achievement Unlocked!
                </h3>
                
                <div className="flex items-center mt-1 mb-2">
                  <Star className="h-4 w-4 text-amber-500 mr-1" />
                  <h4 className="font-medium text-slate-900 dark:text-white">{achievement.title}</h4>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  {achievement.description}
                </p>
                
                <div className="flex items-center">
                  <span className={cn(
                    "inline-block w-2 h-2 rounded-full mr-1",
                    getRarityColor(achievement.rarity)
                  )}></span>
                  <span className="text-xs font-medium capitalize text-slate-500 dark:text-slate-400">
                    {achievement.rarity} Achievement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;
