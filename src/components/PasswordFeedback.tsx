
import { PasswordAnalysis } from "@/types/password";
import { Check, X, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PasswordFeedbackProps {
  analysis: PasswordAnalysis;
}

const PasswordFeedback = ({ analysis }: PasswordFeedbackProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

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

      {/* Entropy and Time to Crack */}
      <div className="mt-8">
        <h3 className="font-medium text-md mb-3 flex items-center">
          <Clock className="mr-2 h-4 w-4 text-slate-500" />
          Estimated Time to Crack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(analysis.timeToCrack).map(([attack, time]) => (
            <Card key={attack} className="overflow-hidden border-slate-200">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">{attack}</h4>
                <p 
                  className={cn(
                    "text-lg font-bold",
                    time.includes("second") || time.includes("minute") || time.includes("hour") 
                      ? "text-red-500" 
                      : time.includes("day") || time.includes("month") 
                        ? "text-amber-500" 
                        : "text-green-500"
                  )}
                >
                  {time}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Suggested Improvements */}
      {showSuggestions && (
        <div className="mt-6">
          <h3 className="font-medium text-md mb-3">Improvements</h3>
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
