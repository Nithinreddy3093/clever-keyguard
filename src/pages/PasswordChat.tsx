
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Bot, Info } from "lucide-react";
import PasswordChatbot from "@/components/PasswordChatbot";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import { PasswordAnalysis } from "@/types/password";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PasswordChat = () => {
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
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Password Analyzer
            </Link>
          </Button>
        </div>

        <header className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bot className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password Security Assistant
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Get personalized advice from our AI assistant
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                Check a Password
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Enter a password to analyze it and get personalized security advice from our AI assistant.
              </p>
              
              <div className="mb-4">
                <PasswordInput password={password} onChange={handlePasswordChange} />
              </div>
              
              {analysis && (
                <div className="mt-2">
                  <StrengthMeter score={analysis.score} />
                </div>
              )}
              
              <Alert className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-xs text-blue-700 dark:text-blue-400">
                  Try asking questions like:
                  <ul className="list-disc ml-5 mt-1">
                    <li>"What's wrong with this password?"</li>
                    <li>"How can I make my password stronger?"</li>
                    <li>"Why is my password weak?"</li>
                    <li>"Generate a secure password for me"</li>
                    <li>"What patterns should I avoid in passwords?"</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <PasswordChatbot currentAnalysis={analysis} />
          </div>
        </div>
        
        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>All analysis is performed locally. Your passwords are never sent to any server.</p>
          <p className="mt-1">The AI assistant uses the context from the RockYou dataset leak (14.3M passwords) to provide relevant advice.</p>
        </footer>
      </div>
    </div>
  );
};

export default PasswordChat;
