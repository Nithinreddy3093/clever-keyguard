
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

interface LeaderboardEmptyStateProps {
  searchQuery: string;
}

const LeaderboardEmptyState = ({ searchQuery }: LeaderboardEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
        {searchQuery ? "No players found with that name." : "No rankings yet. Be the first to submit your score!"}
      </TableCell>
    </TableRow>
  );
};

export default LeaderboardEmptyState;
