
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const LeaderboardLoading = () => {
  // Create shimmer animation style for each row
  const shimmerEffect = {
    background: `linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.15) 50%, 
      transparent 100%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 2s infinite"
  };

  return (
    <div className="space-y-2">
      <style>
        {`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        `}
      </style>

      {[1, 2, 3, 4, 5].map((item) => (
        <motion.div 
          key={item} 
          className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
          style={{ 
            opacity: 1 - (item * 0.15), // Top items more visible
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1 - (item * 0.11),
            y: 0,
          }}
          transition={{ 
            duration: 0.4,
            delay: item * 0.08,
          }}
        >
          <div className="flex items-center gap-2 w-24">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border relative overflow-hidden ${
              item === 1 
                ? 'bg-amber-200/50 dark:bg-amber-800/30 border-amber-300/30' 
                : item === 2 
                  ? 'bg-slate-300/70 dark:bg-slate-600/50 border-slate-400/30'
                  : item === 3
                    ? 'bg-amber-100/70 dark:bg-amber-900/30 border-amber-200/30'
                    : 'bg-slate-200/70 dark:bg-slate-700/50 border-slate-300/30'
            }`}>
              <div className="absolute inset-0" style={shimmerEffect}></div>
              <Skeleton className="h-5 w-3 rounded" />
            </div>
            <Skeleton className="h-4 w-4 relative overflow-hidden">
              <div className="absolute inset-0" style={shimmerEffect}></div>
            </Skeleton>
          </div>
          <Skeleton className="h-4 w-32 ml-2 relative overflow-hidden">
            <div className="absolute inset-0" style={shimmerEffect}></div>
          </Skeleton>
          <div className="ml-4">
            <Skeleton className="h-6 w-8 rounded-full relative overflow-hidden">
              <div className="absolute inset-0" style={shimmerEffect}></div>
            </Skeleton>
          </div>
          <Skeleton className="h-6 w-8 ml-auto rounded-md relative overflow-hidden">
            <div className="absolute inset-0" style={shimmerEffect}></div>
          </Skeleton>
          <div className="flex items-center ml-4">
            <Skeleton className="h-4 w-4 rounded-full mr-1 relative overflow-hidden">
              <div className="absolute inset-0" style={shimmerEffect}></div>
            </Skeleton>
            <Skeleton className="h-4 w-12 relative overflow-hidden">
              <div className="absolute inset-0" style={shimmerEffect}></div>
            </Skeleton>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LeaderboardLoading;
