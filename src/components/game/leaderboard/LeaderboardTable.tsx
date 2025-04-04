
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@supabase/supabase-js";
import LeaderboardEmptyState from "./LeaderboardEmptyState";
import LeaderboardRow from "./LeaderboardRow";

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
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Streak</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRankings.length === 0 ? (
            <LeaderboardEmptyState searchQuery={searchQuery} />
          ) : (
            filteredRankings.map((ranking) => (
              <LeaderboardRow 
                key={ranking.userId}
                ranking={ranking}
                currentUser={currentUser}
                getTierColor={getTierColor}
                getTierName={getTierName}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
