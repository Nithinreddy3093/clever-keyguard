
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Gift, Calendar } from "lucide-react";

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  secret: boolean;
  icon: string;
}

interface GameDialogsProps {
  selectedAchievement: AchievementData | null;
  setSelectedAchievement: (achievement: AchievementData | null) => void;
  showReward: boolean;
  setShowReward: (show: boolean) => void;
  rewardText: string;
  showDailyCheckin: boolean;
  setShowDailyCheckin: (show: boolean) => void;
  handleCheckIn: () => void;
}

const GameDialogs = ({
  selectedAchievement,
  setSelectedAchievement,
  showReward,
  setShowReward,
  rewardText,
  showDailyCheckin,
  setShowDailyCheckin,
  handleCheckIn
}: GameDialogsProps) => {
  return (
    <>
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedAchievement?.unlocked ? (
                <Award className="h-5 w-5 mr-2 text-amber-500" />
              ) : (
                <Lock className="h-5 w-5 mr-2 text-slate-400" />
              )}
              {selectedAchievement?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAchievement?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex justify-between items-center">
              <Badge 
                variant="outline" 
                className={
                  selectedAchievement?.rarity === "common" ? "text-slate-500" :
                  selectedAchievement?.rarity === "uncommon" ? "text-green-500" :
                  selectedAchievement?.rarity === "rare" ? "text-blue-500" :
                  "text-purple-500"
                }
              >
                {selectedAchievement?.rarity.charAt(0).toUpperCase() + (selectedAchievement?.rarity.slice(1) || "")}
              </Badge>
              
              <Badge variant={selectedAchievement?.unlocked ? "default" : "outline"} className={selectedAchievement?.unlocked ? "bg-emerald-500" : ""}>
                {selectedAchievement?.unlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            
            {selectedAchievement?.unlocked && selectedAchievement.unlockedAt && (
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Unlocked on: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Quest Completed!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {rewardText}
            </p>
            <Button onClick={() => setShowReward(false)} className="w-full">
              Claim Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDailyCheckin} onOpenChange={setShowDailyCheckin}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Daily Check-In</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Welcome back! Check in to continue your streak and get a bonus!
            </p>
            <Button onClick={handleCheckIn} className="w-full">
              Check In (+25 XP)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameDialogs;
