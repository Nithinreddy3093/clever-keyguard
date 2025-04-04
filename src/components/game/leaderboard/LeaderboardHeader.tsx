
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LeaderboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LeaderboardHeader = ({ searchQuery, setSearchQuery }: LeaderboardHeaderProps) => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
        <Trophy className="mr-2 h-5 w-5 text-amber-500" />
        Password Security Leaderboard
      </CardTitle>
      <div className="relative mt-2">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </CardHeader>
  );
};

export default LeaderboardHeader;
