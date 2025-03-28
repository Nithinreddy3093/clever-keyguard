
import { PasswordAnalysis } from "@/types/password";
import { Check, X, Clock, AlertTriangle, Zap, Brain, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PasswordFeedbackProps {
  analysis: PasswordAnalysis;
}

const PasswordFeedback = ({ analysis }: PasswordFeedbackProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAiEnhanced, setShowAiEnhanced] = useState(false);

  useEffect(() => {
    // Show suggestions after a short delay for better UX
    const timer = setTimeout(() => {
      setShowSuggestions(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* Criteria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeedbackItem 
          title="Length" 
          value={analysis.length} 
          status={analysis.length >= 12} 
          message={analysis.length < 12 ? "Too short (aim for 12+ characters)" : "Good length"}
        />
        <FeedbackItem 
          title="Uppercase Letters" 
          value={analysis.hasUpper ? "Yes" : "No"} 
          status={analysis.hasUpper} 
          message={!analysis.hasUpper ? "Add uppercase letters (A-Z)" : "Contains uppercase"}
        />
        <FeedbackItem 
          title="Lowercase Letters" 
          value={analysis.hasLower ? "Yes" : "No"} 
          status={analysis.hasLower} 
          message={!analysis.hasLower ? "Add lowercase letters (a-z)" : "Contains lowercase"}
        />
        <FeedbackItem 
          title="Numbers" 
          value={analysis.hasDigit ? "Yes" : "No"} 
          status={analysis.hasDigit} 
          message={!analysis.hasDigit ? "Add numbers (0-9)" : "Contains numbers"}
        />
        <FeedbackItem 
          title="Special Characters" 
          value={analysis.hasSpecial ? "Yes" : "No"} 
          status={analysis.hasSpecial} 
          message={!analysis.hasSpecial ? "Add special characters (!@#$%...)" : "Contains special chars"}
        />
        <FeedbackItem 
          title="Common Password" 
          value={analysis.isCommon ? "Yes" : "No"} 
          status={!analysis.isCommon} 
          message={analysis.isCommon ? "This is a commonly used password" : "Not a common password"}
        />
      </div>

      {/* ML-Based Pattern Detection */}
      {analysis.mlPatterns.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-md mb-3 flex items-center">
            <Brain className="mr-2 h-4 w-4 text-purple-500" />
            ML-Detected Patterns
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {analysis.mlPatterns
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 3)
              .map((pattern, index) => (
                <div key={index} className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-md">
                  <div className="flex items-start">
                    <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 mr-2">
                      {Math.round(pattern.confidence * 100)}%
                    </Badge>
                    <div>
                      <h4 className="font-medium text-sm text-purple-800 dark:text-purple-300">{pattern.description}</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        This pattern makes your password easier to crack
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Common Pattern Warning */}
      {analysis.hasCommonPattern && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-amber-800 dark:text-amber-300">Common Pattern Detected</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Your password contains {analysis.commonPatterns.length > 1 ? "these patterns" : "this pattern"}:
                {" "}
                <span className="font-medium">{analysis.commonPatterns.join(", ")}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI-Enhanced Password Suggestion */}
      {analysis.score < 4 && analysis.aiEnhanced.originalPassword !== analysis.aiEnhanced.enhancedPassword && (
        <div className="mt-6">
          <h3 className="font-medium text-md mb-3 flex items-center">
            <Zap className="mr-2 h-4 w-4 text-yellow-500" />
            AI-Enhanced Password Suggestion
          </h3>
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex justify-between items-center">
                <span className="text-yellow-800 dark:text-yellow-300">Suggested Password</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8 bg-yellow-100 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:border-yellow-800"
                  onClick={() => setShowAiEnhanced(!showAiEnhanced)}
                >
                  {showAiEnhanced ? "Hide Details" : "Show Details"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono bg-white dark:bg-yellow-900 p-2 rounded border border-yellow-200 dark:border-yellow-800 text-sm">
                {analysis.aiEnhanced.enhancedPassword}
              </div>
              
              {showAiEnhanced && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Improvements Made:</h4>
                  <ul className="text-xs space-y-1 text-yellow-700 dark:text-yellow-400">
                    {analysis.aiEnhanced.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-3 w-3 mr-1 mt-0.5 text-yellow-600 dark:text-yellow-500" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-400">
                    Estimated strength increase: +{Math.round(analysis.aiEnhanced.strengthIncrease)} bits of entropy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Crack Time Simulation */}
      <div className="mt-6">
        <h3 className="font-medium text-md mb-3 flex items-center">
          <Clock className="mr-2 h-4 w-4 text-slate-500" />
          Password Crack Time Simulation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(analysis.crackTimeEstimates)
            .sort((a, b) => a[1].timeInSeconds - b[1].timeInSeconds)
            .map(([attack, estimate]) => (
              <Card key={attack} className="overflow-hidden border-slate-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">{attack}</h4>
                  <p 
                    className={cn(
                      "text-lg font-bold",
                      estimate.timeInSeconds < 3600 
                        ? "text-red-500" 
                        : estimate.timeInSeconds < 86400 
                          ? "text-amber-500" 
                          : "text-green-500"
                    )}
                  >
                    {estimate.timeToBreak}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Intl.NumberFormat().format(estimate.hashesPerSecond)} hashes/second
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Based on {Math.round(analysis.entropy)} bits of entropy and modern hardware benchmarks
        </p>
      </div>

      {/* Suggested Improvements */}
      {showSuggestions && (
        <div className="mt-6">
          <h3 className="font-medium text-md mb-3 flex items-center">
            <Shield className="mr-2 h-4 w-4 text-blue-500" />
            Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md flex items-start">
                <Badge variant="outline" className="mt-0.5 mr-2">{index + 1}</Badge>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface FeedbackItemProps {
  title: string;
  value: string | number | boolean;
  status: boolean;
  message: string;
}

const FeedbackItem = ({ title, value, status, message }: FeedbackItemProps) => (
  <div className="flex items-start p-3 rounded-md bg-slate-50 dark:bg-slate-800">
    <div className={cn("shrink-0 h-6 w-6 rounded-full flex items-center justify-center", 
      status ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
    )}>
      {status ? (
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
      )}
    </div>
    <div className="ml-3">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <h4 className="font-medium text-sm mr-1">{title}:</h4>
        <span className="text-sm text-slate-500 dark:text-slate-400">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
      </div>
      <p className={cn("text-xs mt-0.5", status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
        {message}
      </p>
    </div>
  </div>
);

export default PasswordFeedback;
