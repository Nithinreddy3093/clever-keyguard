
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface StrengthMeterProps {
  score: number;
}

const StrengthMeter = ({ score }: StrengthMeterProps) => {
  const [progress, setProgress] = useState(0);
  
  // Labels for the strength levels
  const strengthLabels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  
  // Colors for the strength levels
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return "bg-strength-weak";
      case 1:
        return "bg-strength-weak";
      case 2:
        return "bg-strength-medium";
      case 3:
        return "bg-strength-strong";
      case 4:
        return "bg-strength-verystrong";
      default:
        return "bg-slate-200";
    }
  };

  // For animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((score / 4) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Strength:</span>
        <span 
          className={cn("text-sm font-semibold", {
            "text-strength-weak": score <= 1,
            "text-strength-medium": score === 2,
            "text-strength-strong": score === 3,
            "text-strength-verystrong": score === 4,
          })}
        >
          {strengthLabels[score]}
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2" 
        indicatorClassName={getStrengthColor(score)}
      />
    </div>
  );
};

export default StrengthMeter;
