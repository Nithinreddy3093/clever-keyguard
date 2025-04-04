
import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardHeaderProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onRefresh?: () => void;
}

const LeaderboardHeader = ({ searchQuery, setSearchQuery, onRefresh }: LeaderboardHeaderProps) => {
  return (
    <CardHeader className="border-b pb-3">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-xl font-semibold">Shadow Realm Rankings</h3>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>
        
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-8 bg-slate-50 dark:bg-slate-800/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </CardHeader>
  );
};

export default LeaderboardHeader;
