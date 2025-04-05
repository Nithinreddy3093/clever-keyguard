
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LeaderboardHeader from "./leaderboard/LeaderboardHeader";
import LeaderboardTable from "./leaderboard/LeaderboardTable";
import LeaderboardLoading from "./leaderboard/LeaderboardLoading";
import { useLeaderboardData } from "./leaderboard/useLeaderboardData";
import { getTierColor, getTierName, getGlowColor } from "./leaderboard/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

const LeaderboardTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRankings, setFilteredRankings] = useState<any[]>([]);
  const { rankings, loading, error, fetchLeaderboardData } = useLeaderboardData();
  const { user } = useAuth();
  const { toast } = useToast();
  const isInitialLoad = useRef(true);
  const previousRankingsCount = useRef(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Real-time update notification with debounce
  useEffect(() => {
    if (!loading && rankings.length > 0 && !isInitialLoad.current) {
      // Clear existing timeout if there is one
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Set a timeout to debounce multiple rapid updates
      updateTimeoutRef.current = setTimeout(() => {
        if (rankings.length > previousRankingsCount.current) {
          const newPlayers = rankings.length - previousRankingsCount.current;
          
          toast({
            title: `${newPlayers} new challenger${newPlayers > 1 ? 's' : ''} appeared!`,
            description: "The Shadow Realm rankings have been updated with new players.",
            duration: 3000,
          });
        } else if (rankings.length === previousRankingsCount.current) {
          // Same number of players but rankings may have changed
          const changedRankings = rankings.filter(r => r.change !== "same");
          if (changedRankings.length > 0) {
            toast({
              title: "Rankings shifted",
              description: `${changedRankings.length} player${changedRankings.length > 1 ? 's' : ''} changed position in the Shadow Realm.`,
              duration: 2500,
            });
          }
        }
        
        updateTimeoutRef.current = null;
      }, 500); // 500ms debounce time
    }
    
    if (!loading) {
      isInitialLoad.current = false;
      previousRankingsCount.current = rankings.length;
    }
    
    // Cleanup
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [rankings, loading, toast]);

  // Filter rankings when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRankings(rankings);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = rankings.filter(entry => 
      entry.displayName.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredRankings(filtered);
  }, [searchQuery, rankings]);

  // Manual refresh function with visual feedback
  const handleRefresh = () => {
    fetchLeaderboardData();
    toast({
      title: "Refreshing rankings",
      description: "Getting the latest shadow realm data...",
      duration: 2000,
    });
  };

  // Find user's current rank
  const userRanking = user ? rankings.find(r => r.userId === user.id) : null;

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      
      {userRanking && (
        <motion.div 
          className="absolute top-0 right-0 m-4 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className={`
            px-3 py-1.5 rounded-full text-sm font-medium
            bg-gradient-to-r from-slate-100 to-slate-200
            dark:from-slate-700 dark:to-slate-800
            border border-slate-200 dark:border-slate-600
            shadow-sm
          `}>
            Your Rank: <span className="font-bold text-primary">{userRanking.rank}</span>
          </div>
        </motion.div>
      )}
      
      <LeaderboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={handleRefresh}
      />
      
      <CardContent className="p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LeaderboardLoading />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Failed to load rankings</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {error.message || "An error occurred while loading the leaderboard."}
              </p>
              <button
                onClick={() => fetchLeaderboardData()}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LeaderboardTable 
                filteredRankings={filteredRankings}
                currentUser={user}
                searchQuery={searchQuery}
                getTierColor={getTierColor}
                getTierName={getTierName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTab;
