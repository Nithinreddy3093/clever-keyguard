
import React from "react";
import { User } from "@supabase/supabase-js";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, Crown, Award } from "lucide-react";

interface LeaderboardRowProps {
  ranking: {
    userId: string;
    displayName: string;
    score: number;
    tier: string;
    rank: number;
    change: "up" | "down" | "same";
    streak?: number;
  };
  currentUser: User | null;
  getTierColor: (tier: string) => string;
  getTierName: (tier: string) => string;
}

const LeaderboardRow = ({ ranking, currentUser, getTierColor, getTierName }: LeaderboardRowProps) => {
  return (
    <TableRow 
      key={ranking.userId}
      className={ranking.userId === currentUser?.id ? "bg-primary/10" : ""}
    >
      <TableCell className="font-medium">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold mr-2">
            {ranking.rank}
          </div>
          {ranking.change === "up" && <ArrowUp className="h-4 w-4 text-green-500" />}
          {ranking.change === "down" && <ArrowDown className="h-4 w-4 text-red-500" />}
          {ranking.change === "same" && <Minus className="h-4 w-4 text-slate-400" />}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          {ranking.rank === 1 && <Crown className="h-4 w-4 mr-1 text-amber-500" />}
          {ranking.userId === currentUser?.id ? (
            <span className="text-primary font-medium">You</span>
          ) : (
            <span>{ranking.displayName}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          className={`${getTierColor(ranking.tier)} text-white`}
          title={getTierName(ranking.tier)}
        >
          {ranking.tier}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-semibold">
        {ranking.score}
      </TableCell>
      <TableCell className="text-right">
        {ranking.streak ? (
          <div className="flex items-center justify-end">
            <Award className="h-4 w-4 text-amber-500 mr-1" />
            <span>{ranking.streak} days</span>
          </div>
        ) : (
          <span>0 days</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default LeaderboardRow;
