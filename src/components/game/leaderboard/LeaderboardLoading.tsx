
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardLoading = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 animate-pulse">
          <div className="flex items-center gap-2 w-24">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item === 1 ? 'bg-amber-200/50 dark:bg-amber-800/30' : 'bg-slate-200/70 dark:bg-slate-700/50'}`}>
              <Skeleton className="h-5 w-3 rounded" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-32 ml-2" />
          <div className="ml-4">
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <Skeleton className="h-6 w-8 ml-auto rounded-md" />
          <div className="flex items-center ml-4">
            <Skeleton className="h-4 w-4 rounded-full mr-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardLoading;
