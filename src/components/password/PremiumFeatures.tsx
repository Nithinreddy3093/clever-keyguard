
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Star, Zap, Shield, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useGameProgress from "@/hooks/useGameProgress";

interface PremiumFeaturesProps {
  onUnlock: () => void;
  isUnlocked: boolean;
}

const PremiumFeatures = ({ onUnlock, isUnlocked }: PremiumFeaturesProps) => {
  const { toast } = useToast();
  const { playerLevel, addXp } = useGameProgress();
  
  const handleUnlock = () => {
    if (playerLevel >= 5) {
      onUnlock();
      addXp(100);
      toast({
        title: "Premium Features Unlocked!",
        description: "You now have access to advanced password generation features.",
      });
    } else {
      toast({
        title: "Level 5 Required",
        description: "Reach level 5 to unlock premium features or purchase a premium plan.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-2 border-amber-500/30 dark:border-amber-700/40 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 m-2">
          <Crown className="w-3 h-3 mr-1" /> Premium
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Premium Password Features
        </CardTitle>
        <CardDescription>
          Unlock advanced security features for your passwords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            <Star className="h-4 w-4 text-amber-500 mr-2" />
            <span>Enterprise-grade encryption patterns</span>
          </li>
          <li className="flex items-center">
            <Zap className="h-4 w-4 text-amber-500 mr-2" />
            <span>Quantum-resistant algorithms</span>
          </li>
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-amber-500 mr-2" />
            <span>Exclusive dictionary word combinations</span>
          </li>
          <li className="flex items-center">
            <Lock className="h-4 w-4 text-amber-500 mr-2" />
            <span>Military-grade security templates</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        {isUnlocked ? (
          <Button variant="outline" className="w-full" disabled>
            <Star className="mr-2 h-4 w-4 text-amber-500" />
            Features Unlocked
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            onClick={handleUnlock}
          >
            <Lock className="mr-2 h-4 w-4" />
            {playerLevel >= 5 ? "Unlock Features (Level 5)" : "Requires Level 5 or Purchase"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PremiumFeatures;
