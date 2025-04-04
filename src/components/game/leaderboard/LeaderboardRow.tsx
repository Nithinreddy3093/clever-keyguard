
import React from "react";
import { User } from "@supabase/supabase-js";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, Crown, Award, TrendingUp, TrendingDown } from "lucide-react";
import { getScoreChangeClass, getRankAnimation } from "./utils";

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
      className={`${ranking.userId === currentUser?.id ? "bg-primary/10" : ""} ${getRankAnimation(ranking.change)}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full ${ranking.rank <= 3 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-200 dark:bg-slate-700'} flex items-center justify-center font-bold mr-2 transition-all duration-300`}>
            {ranking.rank}
          </div>
          {ranking.change === "up" && <TrendingUp className="h-4 w-4 text-green-500 animate-fade-in" />}
          {ranking.change === "down" && <TrendingDown className="h-4 w-4 text-red-500 animate-fade-in" />}
          {ranking.change === "same" && <Minus className="h-4 w-4 text-slate-400" />}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          {ranking.rank === 1 && (
            <Crown className="h-4 w-4 mr-1 text-amber-500" />
          )}
          {ranking.userId === currentUser?.id ? (
            <span className="text-primary font-medium">You</span>
          ) : (
            <span className={getScoreChangeClass(ranking.change)}>{ranking.displayName}</span>
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
        <span className={getScoreChangeClass(ranking.change)}>
          {ranking.score}
        </span>
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
