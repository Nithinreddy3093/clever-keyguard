
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, ArrowLeft } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import StrengthMeter from "@/components/StrengthMeter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PasswordHistoryItem {
  id: string;
  created_at: string;
  score: number;
  length: number;
  has_upper: boolean;
  has_lower: boolean;
  has_digit: boolean;
  has_special: boolean;
  is_common: boolean;
  has_common_pattern: boolean;
  entropy: number;
}

const History = () => {
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchPasswordHistory = async () => {
    const { data, error } = await supabase
      .from("password_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as PasswordHistoryItem[];
  };

  const { data: passwordHistory, isLoading, error } = useQuery({
    queryKey: ["passwordHistory"],
    queryFn: fetchPasswordHistory,
    enabled: !!session,
  });

  const deletePasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("password_history")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwordHistory"] });
      toast({
        title: "Password deleted",
        description: "The password has been removed from your history",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this password analysis?")) {
      deletePasswordMutation.mutate(id);
    }
  };

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password History
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            View and manage your previously analyzed passwords
          </p>
          <Button asChild>
            <Link to="/" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analyzer
            </Link>
          </Button>
        </header>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-300">Loading your password history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading your password history</p>
          </div>
        ) : passwordHistory && passwordHistory.length > 0 ? (
          <div className="grid gap-6">
            {passwordHistory.map((item) => (
              <Card key={item.id} className="border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">
                    Password Analysis
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <StrengthMeter score={item.score} />
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Characteristics</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>Length: {item.length} characters</li>
                        <li>Has uppercase: {item.has_upper ? "Yes" : "No"}</li>
                        <li>Has lowercase: {item.has_lower ? "Yes" : "No"}</li>
                        <li>Has digits: {item.has_digit ? "Yes" : "No"}</li>
                        <li>Has special characters: {item.has_special ? "Yes" : "No"}</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Analysis</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>Entropy: {Math.round(item.entropy)} bits</li>
                        <li>Common password: {item.is_common ? "Yes" : "No"}</li>
                        <li>Contains patterns: {item.has_common_pattern ? "Yes" : "No"}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You haven't saved any password analyses yet.
            </p>
            <Button asChild>
              <Link to="/">Analyze a Password</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
