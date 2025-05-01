
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, ArrowLeft, Shield, RefreshCw, Lock, Sparkles, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePremiumPassword, calculatePremiumPasswordStrength } from "@/lib/premiumPasswordGenerator";
import PremiumFeatures from "@/components/password/PremiumFeatures";
import { Badge } from "@/components/ui/badge";
import useGameProgress from "@/hooks/useGameProgress";

const PremiumPasswordGenerator = () => {
  const { toast } = useToast();
  const { playerLevel, addXp } = useGameProgress();
  
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  
  const [options, setOptions] = useState({
    length: 16,
    minUppercase: 2,
    minLowercase: 2,
    minNumbers: 2,
    minSpecial: 2,
    useExtended: false,
    useUnicode: false,
    useRare: false,
    useSecurity: false,
    avoidAmbiguousChars: true,
    requirePronounceable: false,
    securityLevel: 'high' as 'standard' | 'high' | 'enterprise' | 'quantum'
  });
  
  // Check localStorage for premium status on mount
  useEffect(() => {
    const isPremiumUnlocked = localStorage.getItem('premiumPasswordFeatures') === 'true';
    setPremiumUnlocked(isPremiumUnlocked);
  }, []);
  
  const unlockPremiumFeatures = () => {
    setPremiumUnlocked(true);
    localStorage.setItem('premiumPasswordFeatures', 'true');
  };

  const handleGeneratePasswords = () => {
    if (!premiumUnlocked && (options.useExtended || options.useUnicode || options.useRare || 
                            options.useSecurity || options.securityLevel === 'enterprise' || 
                            options.securityLevel === 'quantum')) {
      toast({
        title: "Premium Feature Required",
        description: "Unlock premium features to use these advanced settings.",
        variant: "destructive",
      });
      return;
    }
    
    const newPasswords: string[] = [];
    for (let i = 0; i < 3; i++) {
      newPasswords.push(generatePremiumPassword(options));
    }
    setGeneratedPasswords(newPasswords);
    setCopied(null);
    
    // Award XP for generating passwords
    addXp(5);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    toast({
      title: "Copied to clipboard",
      description: "The password has been copied to your clipboard",
    });

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 90) return "Fortress";
    if (strength >= 80) return "Very Strong";
    if (strength >= 70) return "Strong";
    if (strength >= 50) return "Good";
    if (strength >= 30) return "Moderate";
    return "Weak";
  };
  
  const getStrengthColor = (strength: number) => {
    if (strength >= 90) return "text-purple-600";
    if (strength >= 80) return "text-green-600";
    if (strength >= 70) return "text-emerald-500";
    if (strength >= 50) return "text-blue-500";
    if (strength >= 30) return "text-amber-500";
    return "text-red-500";
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
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            Premium Password Generator
            <Crown className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Create ultra-secure passwords with enterprise-grade security
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="standard" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="standard">Standard Settings</TabsTrigger>
                <TabsTrigger value="advanced" disabled={!premiumUnlocked}>
                  <Crown className="mr-2 h-3.5 w-3.5 text-amber-500" />
                  Advanced Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard">
                <Card className="mb-6 border-none shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Customize Your Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="length">Length: {options.length}</Label>
                        </div>
                        <Slider 
                          id="length"
                          min={8} 
                          max={32} 
                          step={1} 
                          value={[options.length]} 
                          onValueChange={(value) => setOptions({...options, length: value[0]})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-uppercase">Minimum uppercase: {options.minUppercase}</Label>
                          <Slider 
                            id="min-uppercase"
                            min={0} 
                            max={5} 
                            step={1} 
                            value={[options.minUppercase]} 
                            onValueChange={(value) => setOptions({...options, minUppercase: value[0]})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="min-lowercase">Minimum lowercase: {options.minLowercase}</Label>
                          <Slider 
                            id="min-lowercase"
                            min={0} 
                            max={5} 
                            step={1} 
                            value={[options.minLowercase]} 
                            onValueChange={(value) => setOptions({...options, minLowercase: value[0]})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="min-numbers">Minimum numbers: {options.minNumbers}</Label>
                          <Slider 
                            id="min-numbers"
                            min={0} 
                            max={5} 
                            step={1} 
                            value={[options.minNumbers]} 
                            onValueChange={(value) => setOptions({...options, minNumbers: value[0]})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="min-special">Minimum special chars: {options.minSpecial}</Label>
                          <Slider 
                            id="min-special"
                            min={0} 
                            max={5} 
                            step={1} 
                            value={[options.minSpecial]} 
                            onValueChange={(value) => setOptions({...options, minSpecial: value[0]})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="avoid-ambiguous" 
                            checked={options.avoidAmbiguousChars}
                            onCheckedChange={(value) => setOptions({...options, avoidAmbiguousChars: value})}
                          />
                          <Label htmlFor="avoid-ambiguous">Avoid ambiguous characters</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="pronounceable" 
                            checked={options.requirePronounceable}
                            onCheckedChange={(value) => setOptions({...options, requirePronounceable: value})}
                          />
                          <Label htmlFor="pronounceable">Make pronounceable</Label>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full flex items-center justify-center"
                        onClick={handleGeneratePasswords}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Passwords
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced">
                <Card className="mb-6 border-none shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Advanced Settings</CardTitle>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <Crown className="mr-1 h-3.5 w-3.5" /> Premium
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="extended-chars" 
                            checked={options.useExtended}
                            onCheckedChange={(value) => setOptions({...options, useExtended: value})}
                          />
                          <Label htmlFor="extended-chars">Extended characters (£€¥¢©®™)</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="unicode" 
                            checked={options.useUnicode}
                            onCheckedChange={(value) => setOptions({...options, useUnicode: value})}
                          />
                          <Label htmlFor="unicode">Unicode symbols (★☆☀☂♠♣♥♦)</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="rare-chars" 
                            checked={options.useRare}
                            onCheckedChange={(value) => setOptions({...options, useRare: value})}
                          />
                          <Label htmlFor="rare-chars">Rare characters (ÆæÞþðÐ)</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="security-symbols" 
                            checked={options.useSecurity}
                            onCheckedChange={(value) => setOptions({...options, useSecurity: value})}
                          />
                          <Label htmlFor="security-symbols">Security symbols (⚠⚡⚓⚔⚕)</Label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="security-level">Security Level</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Button 
                            variant={options.securityLevel === 'standard' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOptions({...options, securityLevel: 'standard'})}
                            className={options.securityLevel === 'standard' ? 'border-primary' : ''}
                          >
                            Standard
                          </Button>
                          <Button 
                            variant={options.securityLevel === 'high' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOptions({...options, securityLevel: 'high'})}
                            className={options.securityLevel === 'high' ? 'border-primary' : ''}
                          >
                            High
                          </Button>
                          <Button 
                            variant={options.securityLevel === 'enterprise' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOptions({...options, securityLevel: 'enterprise'})}
                            className={options.securityLevel === 'enterprise' ? 'border-primary' : ''}
                          >
                            <Zap className="mr-1 h-3.5 w-3.5" />
                            Enterprise
                          </Button>
                          <Button 
                            variant={options.securityLevel === 'quantum' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOptions({...options, securityLevel: 'quantum'})}
                            className={options.securityLevel === 'quantum' ? 'border-primary' : ''}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            Quantum
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full flex items-center justify-center bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                        onClick={handleGeneratePasswords}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Premium Passwords
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {generatedPasswords.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Generated Passwords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedPasswords.map((generatedPassword, index) => {
                      const strength = calculatePremiumPasswordStrength(generatedPassword);
                      const strengthLabel = getStrengthLabel(strength);
                      const strengthColor = getStrengthColor(strength);
                      
                      return (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-lg font-medium break-all">{generatedPassword}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => copyToClipboard(generatedPassword, index)}
                            >
                              {copied === index ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={`font-medium ${strengthColor}`}>
                              {strength >= 90 && <Sparkles className="inline h-3.5 w-3.5 mr-1" />}
                              {strengthLabel}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {strength >= 90 ? "Enterprise Grade" : "Security Score:"} {strength}/100
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <PremiumFeatures onUnlock={unlockPremiumFeatures} isUnlocked={premiumUnlocked} />
            
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium mb-2 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                Why Premium Passwords?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Our premium password generator uses advanced algorithms to create passwords that are:
              </p>
              <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 text-primary mt-0.5" />
                  <span>Resistant to advanced cracking methods</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 text-primary mt-0.5" />
                  <span>Compliant with enterprise security policies</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 text-primary mt-0.5" />
                  <span>Designed to resist quantum computing attacks</span>
                </li>
              </ul>
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {playerLevel < 5 ? 
                  `Reach level ${playerLevel}/5 to unlock premium features or purchase a plan.` : 
                  "You're eligible to unlock premium features for free!"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPasswordGenerator;
