
import { PasswordAnalysis } from "@/types/password";
import { Check, X, Clock, AlertTriangle, Zap, Brain, Shield, Lock, Target, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PasswordFeedbackProps {
  analysis: PasswordAnalysis;
}

const PasswordFeedback = ({ analysis }: PasswordFeedbackProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAiEnhanced, setShowAiEnhanced] = useState(false);
  const [showPatternDetails, setShowPatternDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  useEffect(() => {
    // Show suggestions after a short delay for better UX
    const timer = setTimeout(() => {
      setShowSuggestions(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [analysis]);

  // Calculate risk score based on ML patterns
  const calculateRiskScore = (): number => {
    if (analysis.mlPatterns.length === 0) return 0;
    
    // Average the confidence scores of the top 3 patterns
    const topPatterns = [...analysis.mlPatterns]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
      
    const avgConfidence = topPatterns.reduce((sum, p) => sum + p.confidence, 0) / topPatterns.length;
    return Math.round(avgConfidence * 100);
  };

  const riskScore = calculateRiskScore();

  // Function to toggle pattern details visibility
  const togglePatternDetails = () => {
    setShowPatternDetails(!showPatternDetails);
    console.log("Pattern details toggled:", !showPatternDetails);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn("grid mb-4", isMobile ? "grid-cols-1 gap-2" : "grid-cols-3")}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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

          {/* Attack Resistance Visualization */}
          <div className="mt-6">
            <h3 className="font-medium text-md mb-3 flex items-center">
              <Shield className="mr-2 h-4 w-4 text-blue-500" />
              Attack Resistance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AttackResistanceItem 
                title="Brute Force" 
                score={analysis.attackResistance.bruteForce} 
                icon={<Lock className="h-4 w-4" />}
                description="Resistance against automated password guessing"
              />
              <AttackResistanceItem 
                title="Dictionary" 
                score={analysis.attackResistance.dictionary} 
                icon={<Book className="h-4 w-4" />}
                description="Resistance against common word listings"
              />
              <AttackResistanceItem 
                title="Pattern-Based" 
                score={analysis.attackResistance.patternBased} 
                icon={<Target className="h-4 w-4" />}
                description="Resistance against pattern recognition attacks"
              />
              <AttackResistanceItem 
                title="AI Attacks" 
                score={analysis.attackResistance.aiAttack} 
                icon={<Brain className="h-4 w-4" />}
                description="Resistance against machine learning attacks"
              />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Overall Attack Resistance:</h4>
              <div className="flex items-center">
                <Progress 
                  value={analysis.attackResistance.overall} 
                  className="h-3 flex-1 mr-2"
                  indicatorClassName={cn(
                    analysis.attackResistance.overall < 30 ? "bg-red-500" : 
                    analysis.attackResistance.overall < 70 ? "bg-amber-500" : "bg-green-500"
                  )}
                />
                <span className="text-sm font-bold">
                  {analysis.attackResistance.overall}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Based on entropy, pattern analysis, and modern attack techniques
              </p>
            </div>
          </div>

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
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="space-y-4">
          {/* ML-Based Pattern Detection (enhanced) */}
          {analysis.mlPatterns.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-md flex items-center">
                  <Brain className="mr-2 h-4 w-4 text-purple-500" />
                  RockYou Dataset Pattern Analysis
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={togglePatternDetails}
                  className="text-xs"
                  type="button"
                >
                  {showPatternDetails ? "Hide Details" : "Show Details"}
                </Button>
              </div>
              
              {/* Risk score visualization */}
              <Card className="mb-4 border-purple-100 dark:border-purple-900">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pattern-based vulnerability:</span>
                    <span className="text-sm font-semibold">
                      {riskScore < 30 ? 'Low' : riskScore < 70 ? 'Medium' : 'High'} Risk
                    </span>
                  </div>
                  <Progress 
                    value={riskScore} 
                    className="h-2"
                    indicatorClassName={cn(
                      riskScore < 30 ? "bg-green-500" : 
                      riskScore < 70 ? "bg-amber-500" : "bg-red-500"
                    )}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Based on {analysis.mlPatterns.length} detected pattern{analysis.mlPatterns.length !== 1 ? 's' : ''} from RockYou leak analysis
                  </p>
                </CardContent>
              </Card>
              
              {/* Use Collapsible for the pattern details */}
              <Collapsible open={showPatternDetails} onOpenChange={setShowPatternDetails} className="w-full">
                <CollapsibleContent className="mt-3">
                  <div className="grid grid-cols-1 gap-3">
                    {analysis.mlPatterns
                      .sort((a, b) => b.confidence - a.confidence)
                      .map((pattern, index) => (
                        <div key={index} className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-md">
                          <div className="flex items-start">
                            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 mr-2">
                              {Math.round(pattern.confidence * 100)}%
                            </Badge>
                            <div>
                              <h4 className="font-medium text-sm text-purple-800 dark:text-purple-300">{pattern.description}</h4>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                This pattern was found in many compromised passwords
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Hackability Score */}
          <div className="mt-6">
            <h3 className="font-medium text-md mb-3 flex items-center">
              <Target className="mr-2 h-4 w-4 text-red-500" />
              AI-Driven Hackability Score
            </h3>
            <Card className={cn(
              "border",
              analysis.hackabilityScore.riskLevel === 'critical' ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950" : 
              analysis.hackabilityScore.riskLevel === 'high' ? "border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950" :
              analysis.hackabilityScore.riskLevel === 'medium' ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950" :
              "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Badge className={cn(
                      "mr-2",
                      analysis.hackabilityScore.riskLevel === 'critical' ? "bg-red-500" : 
                      analysis.hackabilityScore.riskLevel === 'high' ? "bg-orange-500" :
                      analysis.hackabilityScore.riskLevel === 'medium' ? "bg-amber-500" :
                      "bg-green-500"
                    )}>
                      {analysis.hackabilityScore.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="font-medium">
                      Estimated time to crack: {analysis.hackabilityScore.timeToHack}
                    </span>
                  </div>
                  <span className="text-lg font-bold">
                    {analysis.hackabilityScore.score}/100
                  </span>
                </div>
                
                <Progress 
                  value={analysis.hackabilityScore.score} 
                  className="h-2 mb-4"
                  indicatorClassName={cn(
                    analysis.hackabilityScore.score < 30 ? "bg-green-500" : 
                    analysis.hackabilityScore.score < 60 ? "bg-amber-500" : 
                    analysis.hackabilityScore.score < 80 ? "bg-orange-500" : "bg-red-500"
                  )}
                />
                
                {analysis.hackabilityScore.reasoning.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium mb-2">Why this password is vulnerable:</h4>
                    <ul className="space-y-1">
                      {analysis.hackabilityScore.reasoning.map((reason, idx) => (
                        <li key={idx} className="text-sm flex items-start">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI-Enhanced Password Suggestion */}
          {analysis.score < 4 && analysis.aiEnhanced && (
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
        </TabsContent>
        
        <TabsContent value="suggestions" className="space-y-4">
          {/* Generated Passphrases */}
          <div className="mt-2">
            <h3 className="font-medium text-md mb-3 flex items-center">
              <RefreshCcw className="mr-2 h-4 w-4 text-green-500" />
              AI-Generated Secure Passphrases
            </h3>
            <Card className="border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-md text-green-800 dark:text-green-300">Strong Yet Memorable Alternatives</CardTitle>
                <CardDescription className="text-green-700 dark:text-green-400">
                  Passphrases are easier to remember and harder to crack
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.passphraseSuggestions.map((phrase, idx) => (
                  <div key={idx} className="font-mono bg-white dark:bg-green-900 p-2 rounded border border-green-200 dark:border-green-800 text-sm flex justify-between items-center">
                    <span>{phrase}</span>
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                      Very Strong
                    </Badge>
                  </div>
                ))}
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  These passphrases combine words, numbers, and special characters for maximum security while remaining memorable
                </p>
              </CardContent>
            </Card>
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
        </TabsContent>
      </Tabs>
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

interface AttackResistanceItemProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

const AttackResistanceItem = ({ title, score, icon, description }: AttackResistanceItemProps) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center mr-2",
            score < 30 ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : 
            score < 70 ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400" : 
            "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
          )}>
            {icon}
          </div>
          <h4 className="text-sm font-medium">{title}</h4>
        </div>
        <span 
          className={cn(
            "text-sm font-bold",
            score < 30 ? "text-red-600 dark:text-red-400" : 
            score < 70 ? "text-amber-600 dark:text-amber-400" : 
            "text-green-600 dark:text-green-400"
          )}
        >
          {score}%
        </span>
      </div>
      <Progress 
        value={score} 
        className="h-2 mb-1"
        indicatorClassName={cn(
          score < 30 ? "bg-red-500" : 
          score < 70 ? "bg-amber-500" : 
          "bg-green-500"
        )}
      />
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </CardContent>
  </Card>
);

const Book = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

export default PasswordFeedback;
