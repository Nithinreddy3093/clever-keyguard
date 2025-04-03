
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff, Award, Target } from "lucide-react";
import StrengthMeter from "@/components/StrengthMeter";
import { Badge } from "@/components/ui/badge";

interface PasswordTesterProps {
  username: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  analysis: any;
  streak: number;
  onSaveProgress: () => void;
}

const PasswordTester = ({
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  analysis,
  streak,
  onSaveProgress
}: PasswordTesterProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Test Your Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
              Your Username
            </label>
            <Input
              id="username"
              placeholder="Enter your display name"
              value={username}
              onChange={onUsernameChange}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
              Password to Test
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a password to test"
                value={password}
                onChange={onPasswordChange}
              />
              <button
                type="button"
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {analysis && (
            <div className="space-y-4">
              <StrengthMeter score={analysis.score} />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex flex-col h-full">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center mb-1">
                      <Target className="h-4 w-4 mr-1 text-blue-500" />
                      Crack Time
                    </h3>
                    <p className="text-lg font-semibold">
                      {analysis.hackabilityScore?.timeToHack || "-"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
                      Time to break your password
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex flex-col h-full">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center mb-1">
                      <Award className="h-4 w-4 mr-1 text-amber-500" />
                      Current Streak
                    </h3>
                    <p className="text-lg font-semibold">
                      {streak} days
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
                      Complete quests to maintain streak
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={onSaveProgress} 
                className="w-full"
              >
                Save My Progress
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordTester;
