
import { getProgressColor, getScoreColor, SecurityLevel } from "@/lib/securityScoreCalculator";

interface SecurityScoreDisplayProps {
  securityScore: number;
  securityLevel: SecurityLevel;
}

const SecurityScoreDisplay = ({ securityScore, securityLevel }: SecurityScoreDisplayProps) => {
  return (
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
  );
};

export default SecurityScoreDisplay;
