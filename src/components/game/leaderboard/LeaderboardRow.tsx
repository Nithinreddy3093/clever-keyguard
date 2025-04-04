
import React from "react";
import { User } from "@supabase/supabase-js";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Crown, Award, User as UserIcon } from "lucide-react";
import { getScoreChangeClass, getRankAnimation, getGlowColor } from "./utils";
import { motion } from "framer-motion";

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
  animationDelay?: number;
}

const LeaderboardRow = ({ 
  ranking, 
  currentUser, 
  getTierColor, 
  getTierName,
  animationDelay = 0
}: LeaderboardRowProps) => {
  const isCurrentUser = ranking.userId === currentUser?.id;
  const isTopThree = ranking.rank <= 3;
  const rankBgClass = isTopThree 
    ? ranking.rank === 1 
      ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50' 
      : ranking.rank === 2 
        ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600/50' 
        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50';

  return (
    <TableRow 
      className={`
        ${isCurrentUser ? "bg-primary/5 dark:bg-primary/10" : ""} 
        ${getRankAnimation(ranking.change)}
        transition-all duration-500 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-800/60
      `}
      style={{ 
        animationDelay: `${animationDelay * 100}ms`,
      }}
    >
      <TableCell className="font-medium">
        <div className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full 
            ${rankBgClass}
            flex items-center justify-center font-bold mr-2 
            border transition-all duration-300
            ${isTopThree ? 'shadow-sm' : ''}
            ${ranking.rank === 1 ? `${getGlowColor(ranking.tier)} animate-pulse` : ''}
          `}>
            {ranking.rank}
          </div>
          {ranking.change === "up" && <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />}
          {ranking.change === "down" && <TrendingDown className="h-4 w-4 text-red-500 animate-pulse" />}
          {ranking.change === "same" && <Minus className="h-4 w-4 text-slate-400" />}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          {ranking.rank === 1 && (
            <Crown className="h-4 w-4 mr-1 text-amber-500" />
          )}
          {isCurrentUser ? (
            <span className="text-primary font-medium">You</span>
          ) : (
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1 text-slate-400" />
              <span className={getScoreChangeClass(ranking.change)}>{ranking.displayName}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          className={`${getTierColor(ranking.tier)} text-white transition-colors duration-300`}
          title={getTierName(ranking.tier)}
        >
          {ranking.tier}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-semibold">
        <span className={`${getScoreChangeClass(ranking.change)} transition-all duration-300`}>
          {ranking.score}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {ranking.streak ? (
          <div className="flex items-center justify-end">
            <Award className={`h-4 w-4 mr-1 ${ranking.streak >= 7 ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className={ranking.streak >= 7 ? 'font-medium' : ''}>
              {ranking.streak} day{ranking.streak !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <span className="text-slate-400">0 days</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default LeaderboardRow;
