
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import PasswordFeedback from "@/components/PasswordFeedback";
import SecurityTips from "@/components/SecurityTips";
import { Shield, Lock, AlertTriangle, Save } from "lucide-react";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import { PasswordAnalysis } from "@/types/password";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import crypto from "crypto-js";

const Index = () => {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const results = analyzePassword(value);
      setAnalysis(results);
    } else {
      setAnalysis(null);
    }
  };

  const savePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!analysis || !user) return;
      
      // Hash the password before saving (never store actual passwords)
      const passwordHash = crypto.SHA256(password).toString();
      
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: analysis.score,
        length: analysis.length,
        has_upper: analysis.hasUpper,
        has_lower: analysis.hasLower,
        has_digit: analysis.hasDigit,
        has_special: analysis.hasSpecial,
        is_common: analysis.isCommon,
        has_common_pattern: analysis.hasCommonPattern,
        entropy: analysis.entropy
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Analysis saved",
        description: "Your password analysis has been saved to your history",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSaveAnalysis = () => {
    savePasswordMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password Strength Analyzer
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            AI-powered analysis to help you create stronger, safer passwords
          </p>
        </header>

        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Check Your Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordInput password={password} onChange={handlePasswordChange} />
            {analysis && (
              <div className="mt-4">
                <StrengthMeter score={analysis.score} />
                
                {user && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={handleSaveAnalysis}
                      disabled={savePasswordMutation.isPending}
                      className="flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {savePasswordMutation.isPending ? "Saving..." : "Save Analysis"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <>
            <Card className="mb-8 border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Password Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordFeedback analysis={analysis} />
              </CardContent>
            </Card>

            <SecurityTips />
          </>
        )}
        
        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>All analysis is performed locally. Your passwords are never sent to any server.</p>
          {user ? (
            <p className="mt-1">Saved analyses only store password characteristics, never the actual password.</p>
          ) : (
            <p className="mt-1">
              <Button asChild variant="link" className="p-0 h-auto text-sm text-slate-500 dark:text-slate-400">
                <Link to="/auth">Sign in</Link>
              </Button> to save your password analyses and view history.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
