
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh?: () => void;
}

const LeaderboardHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  onRefresh 
}: LeaderboardHeaderProps) => {
  return (
    <CardHeader className="pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
            <Trophy className="mr-2 h-5 w-5 text-amber-500" />
            Shadow Realm Leaderboard
          </CardTitle>
          <CardDescription>
            Players ranked by security mastery and knowledge
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search players..."
            className="w-full sm:w-[180px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {onRefresh && (
            <Button 
              size="icon" 
              variant="outline"
              onClick={onRefresh}
              className="flex-shrink-0"
              title="Refresh leaderboard"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};

export default LeaderboardHeader;
