
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Trophy } from "lucide-react";

interface LeaderboardEmptyStateProps {
  searchQuery: string;
}

const LeaderboardEmptyState = ({ searchQuery }: LeaderboardEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 p-6 animate-fade-in">
          <Trophy className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery ? "No players found with that name." : "No rankings yet. Be the first to submit your score!"}
          </p>
          {!searchQuery && (
            <p className="text-sm text-muted-foreground max-w-md">
              Test your password strength and join the Shadow Realm rankings to see how you compare against other players.
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LeaderboardEmptyState;
