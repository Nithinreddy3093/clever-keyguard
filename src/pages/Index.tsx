
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import PasswordFeedback from "@/components/PasswordFeedback";
import SecurityTips from "@/components/SecurityTips";
import { 
  Shield, Lock, AlertTriangle, Save, Zap, KeyRound, Bot, 
  Moon, Sun, Sparkles, Trophy, RadioTower, Sidebar, Gamepad2, Skull
} from "lucide-react";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import { PasswordAnalysis } from "@/types/password";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import crypto from "crypto-js";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Check for saved preference or use system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Apply theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

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
      
      const passwordHash = crypto.SHA256(password).toString();
      
      // Ensure score is within 0-100 range
      const clampedScore = Math.min(Math.max(Math.round(analysis.score * 25), 0), 100);
      
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: clampedScore, // Use clamped score instead of raw score
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <div className="flex justify-between mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Sidebar className="h-4 w-4" />
                <span className="hidden sm:inline">Features</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Password Security Features</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/passphrase" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <KeyRound className="mr-2 h-5 w-5 text-primary" />
                      Secure Passphrase Generator
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Generate easy-to-remember yet secure passphrases
                    </span>
                  </Link>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/theme-passwords" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-primary" />
                      Themed Password Generator
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Create fun, unique passwords with various themes
                    </span>
                  </Link>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/rankings" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-primary" />
                      Shadow Tier Rankings
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Compete with others for the highest password security rank
                    </span>
                  </Link>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/password-game" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <Gamepad2 className="mr-2 h-5 w-5 text-primary" />
                      Password Security Game
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Complete quests, earn achievements and improve your security
                    </span>
                  </Link>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/password-arcade" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <Skull className="mr-2 h-5 w-5 text-red-500" />
                      Password Arcade
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Unlock generators, play mini-games, compete on leaderboards
                    </span>
                  </Link>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/service-passwords" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <RadioTower className="mr-2 h-5 w-5 text-primary" />
                      Service-Specific Passwords
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Generate customized passwords for popular online services
                    </span>
                  </Link>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <Link to="/chat" className="flex flex-col">
                    <span className="text-lg font-medium flex items-center">
                      <Bot className="mr-2 h-5 w-5 text-primary" />
                      AI Security Assistant
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Chat with our AI to get personalized security advice
                    </span>
                  </Link>
                </div>
                
                {user ? (
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <Link to="/history" className="flex flex-col">
                      <span className="text-lg font-medium flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-primary" />
                        Password History
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        View your password analysis history
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <Link to="/auth" className="flex flex-col">
                      <span className="text-lg font-medium flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-primary" />
                        Sign In / Register
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Create an account to save your password analyses
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="flex items-center gap-1"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="hidden sm:inline">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </Button>
        </div>
        
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            AI Password Strength Analyzer
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Advanced analysis with AI-powered security features
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" className="mx-2">
              <Link to="/passphrase" className="flex items-center">
                <KeyRound className="mr-2 h-4 w-4" />
                Generate Secure Passphrase
              </Link>
            </Button>
            <Button asChild variant="outline" className="mx-2">
              <Link to="/theme-passwords" className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Themed Password Generator
              </Link>
            </Button>
            <Button asChild variant="outline" className="mx-2">
              <Link to="/rankings" className="flex items-center">
                <Trophy className="mr-2 h-4 w-4" />
                Shadow Tier Rankings
              </Link>
            </Button>
            <Button asChild variant="outline" className="mx-2">
              <Link to="/password-game" className="flex items-center">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Password Game
              </Link>
            </Button>
            <Button asChild variant="outline" className="mx-2">
              <Link to="/password-arcade" className="flex items-center">
                <Skull className="mr-2 h-4 w-4" />
                Password Arcade
              </Link>
            </Button>
            <Button asChild variant="outline" className="mx-2">
              <Link to="/service-passwords" className="flex items-center">
                <RadioTower className="mr-2 h-4 w-4" />
                Service Passwords
              </Link>
            </Button>
          </div>
        </header>

        <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800 transition-colors duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Check Your Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordInput password={password} onChange={handlePasswordChange} />
            {analysis && (
              <div className="mt-4">
                <StrengthMeter score={analysis.score} />
                
                <div className="mt-4">
                  {analysis.hackabilityScore && (
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="mr-2 h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium mr-2 text-slate-700 dark:text-slate-300">Hackability Risk:</span>
                        <span className={`text-sm font-semibold ${
                          analysis.hackabilityScore.riskLevel === 'critical' ? 'text-red-500' :
                          analysis.hackabilityScore.riskLevel === 'high' ? 'text-orange-500' :
                          analysis.hackabilityScore.riskLevel === 'medium' ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {analysis.hackabilityScore.riskLevel.charAt(0).toUpperCase() + analysis.hackabilityScore.riskLevel.slice(1)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {analysis.hackabilityScore.timeToHack} to crack
                      </span>
                    </div>
                  )}
                </div>
                
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
            <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800 transition-colors duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
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
        
        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
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
