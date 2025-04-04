
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@supabase/supabase-js";
import LeaderboardEmptyState from "./LeaderboardEmptyState";
import LeaderboardRow from "./LeaderboardRow";
import { motion } from "framer-motion";

interface LeaderboardTableProps {
  filteredRankings: Array<{
    userId: string;
    displayName: string;
    score: number;
    tier: string;
    rank: number;
    change: "up" | "down" | "same";
    streak?: number;
  }>;
  currentUser: User | null;
  searchQuery: string;
  getTierColor: (tier: string) => string;
  getTierName: (tier: string) => string;
}

const LeaderboardTable = ({ 
  filteredRankings, 
  currentUser, 
  searchQuery,
  getTierColor,
  getTierName
}: LeaderboardTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-800/70">
            <TableHead className="w-16 font-semibold">Rank</TableHead>
            <TableHead className="font-semibold">Player</TableHead>
            <TableHead className="font-semibold">Tier</TableHead>
            <TableHead className="text-right font-semibold">Score</TableHead>
            <TableHead className="text-right font-semibold">Streak</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRankings.length === 0 ? (
            <LeaderboardEmptyState searchQuery={searchQuery} />
          ) : (
            filteredRankings.map((ranking, index) => (
              <LeaderboardRow 
                key={ranking.userId}
                ranking={ranking}
                currentUser={currentUser}
                getTierColor={getTierColor}
                getTierName={getTierName}
                animationDelay={index}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
