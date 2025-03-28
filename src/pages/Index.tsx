
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import PasswordFeedback from "@/components/PasswordFeedback";
import SecurityTips from "@/components/SecurityTips";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import { PasswordAnalysis } from "@/types/password";

const Index = () => {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const results = analyzePassword(value);
      setAnalysis(results);
    } else {
      setAnalysis(null);
    }
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
            {analysis && <StrengthMeter score={analysis.score} />}
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
        </footer>
      </div>
    </div>
  );
};

export default Index;
