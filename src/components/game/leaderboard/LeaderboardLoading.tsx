
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardLoading = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 animate-pulse">
          <div className="flex items-center gap-2 w-24">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-32 ml-2" />
          <Skeleton className="h-6 w-8 ml-auto rounded-md" />
          <Skeleton className="h-4 w-16 ml-4" />
        </div>
      ))}
    </div>
  );
};

export default LeaderboardLoading;
