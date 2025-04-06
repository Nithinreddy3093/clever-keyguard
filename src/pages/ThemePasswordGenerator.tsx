
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Copy, Check, ArrowLeft, Shield, RefreshCw, Wand2, Download, Save, 
  Palette, Settings, Share2, Copy as CopyIcon, Star, X
} from "lucide-react";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  generateThemedPassword, 
  calculatePasswordStrength, 
  getStrengthInfo,
  generateCustomPassword,
  CustomPasswordOptions
} from "@/lib/themePasswordGenerator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Type for password theme options
type PasswordTheme = {
  id: string;
  name: string;
  description: string;
  example: string;
  emoji: string;
};

// Number of passwords to generate per theme
const PASSWORDS_PER_THEME = 5;

const ThemePasswordGenerator = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedTheme, setSelectedTheme] = useState<string>("reverseGibberish");
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [passwordStrengths, setPasswordStrengths] = useState<number[]>([]);
  const [currentThemeDescription, setCurrentThemeDescription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("themed");
  const [savedPasswords, setSavedPasswords] = useState<string[]>([]);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState<boolean>(false);
  const [selectedPassword, setSelectedPassword] = useState<string>("");
  const [passwordAnalysis, setPasswordAnalysis] = useState<any>(null);
  
  // Custom password generator settings
  const [customOptions, setCustomOptions] = useState<CustomPasswordOptions>({
    length: 16,
    includeUpper: true,
    includeLower: true,
    includeNumbers: true,
    includeSymbols: true,
    includeEmoji: false,
    avoidSimilar: false
  });
  const [customPasswords, setCustomPasswords] = useState<string[]>([]);
  const [customPasswordStrengths, setCustomPasswordStrengths] = useState<number[]>([]);

  // Password theme options
  const passwordThemes: PasswordTheme[] = [
    {
      id: "reverseGibberish",
      name: "Reverse Gibberish Mode",
      description: "Generates completely random but pronounceable nonsense",
      example: "ZynKlopVex!82",
      emoji: "1️⃣"
    },
    {
      id: "emojiInfusion",
      name: "Emoji Infusion",
      description: "Mixes emojis and text for stronger passwords",
      example: "L0v3🍕P@nda🐼42!",
      emoji: "2️⃣"
    },
    {
      id: "songLyricShuffle",
      name: "Song Lyric Shuffle",
      description: "Takes parts of a song lyric and scrambles them into a strong password",
      example: "H3ll0DarkN355🌙!",
      emoji: "3️⃣"
    },
    {
      id: "memePasswords",
      name: "Meme Passwords",
      description: "Uses trending meme phrases mixed with symbols",
      example: "Shrek$wamp_99🔥",
      emoji: "4️⃣"
    },
    {
      id: "insultGenerator",
      name: "Insult Generator",
      description: "Creates hilarious but strong passwords using funny insults",
      example: "DumbDonkey#47🐴",
      emoji: "5️⃣"
    },
    {
      id: "movieQuoteRemix",
      name: "Movie Quote Remix",
      description: "Generates passwords using famous quotes + numbers/symbols",
      example: "MayTh3F0rc3✨_2025",
      emoji: "6️⃣"
    },
    {
      id: "alienLanguage",
      name: "Alien Language Mode",
      description: "Translates words into fictional alien-style text",
      example: "XyloBorg77!☄️",
      emoji: "7️⃣"
    },
    {
      id: "keyboardDance",
      name: "Keyboard Dance",
      description: "Creates passwords by making unique patterns across the keyboard",
      example: "QwErTy#1@3$",
      emoji: "8️⃣"
    },
    {
      id: "autoRoastPasswords",
      name: "Auto-Roast Passwords",
      description: "Roasts the user while being secure",
      example: "UForgetUrPwD_88🤡",
      emoji: "9️⃣"
    },
    {
      id: "hackProofMode",
      name: "Hack-Proof Mode",
      description: "Combines max security randomness with a structured format",
      example: "X9v!Tq@4Lp7#Z",
      emoji: "🔟"
    },
    {
      id: "fantasyCharacter",
      name: "Fantasy Character",
      description: "Creates passwords based on fantasy RPG characters",
      example: "DragonSlayer!2023🧙‍♂️",
      emoji: "🧙"
    },
    {
      id: "techStack",
      name: "Tech Stack Generator",
      description: "Combines popular tech frameworks into secure passwords",
      example: "ReactNodeMongo!75⚛️",
      emoji: "💻"
    }
  ];

  // Load saved passwords from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedPasswords");
    if (saved) {
      try {
        setSavedPasswords(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved passwords:", e);
      }
    }
  }, []);

  // Generate passwords when theme changes or tab changes
  useEffect(() => {
    if (activeTab === "themed") {
      handleGenerateThemedPasswords();
      // Update current theme description
      const theme = passwordThemes.find(theme => theme.id === selectedTheme);
      if (theme) {
        setCurrentThemeDescription(theme.description);
      }
    } else if (activeTab === "custom") {
      handleGenerateCustomPasswords();
    }
  }, [selectedTheme, activeTab]);

  const handleGenerateThemedPasswords = () => {
    const newPasswords: string[] = [];
    const newStrengths: number[] = [];
    
    for (let i = 0; i < PASSWORDS_PER_THEME; i++) {
      const newPassword = generateThemedPassword(selectedTheme);
      newPasswords.push(newPassword);
      newStrengths.push(calculatePasswordStrength(newPassword));
    }
    
    setGeneratedPasswords(newPasswords);
    setPasswordStrengths(newStrengths);
    setCopied(null);
  };
  
  const handleGenerateCustomPasswords = () => {
    const newPasswords: string[] = [];
    const newStrengths: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const newPassword = generateCustomPassword(customOptions);
      newPasswords.push(newPassword);
      newStrengths.push(calculatePasswordStrength(newPassword));
    }
    
    setCustomPasswords(newPasswords);
    setCustomPasswordStrengths(newStrengths);
    setCopied(null);
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
  
  const savePassword = (password: string) => {
    if (savedPasswords.includes(password)) {
      toast({
        title: "Already saved",
        description: "This password is already in your saved list"
      });
      return;
    }
    
    const newSavedPasswords = [...savedPasswords, password];
    setSavedPasswords(newSavedPasswords);
    localStorage.setItem("savedPasswords", JSON.stringify(newSavedPasswords));
    
    toast({
      title: "Password saved",
      description: "The password has been added to your saved passwords"
    });
  };
  
  const removeSavedPassword = (password: string) => {
    const newSavedPasswords = savedPasswords.filter(p => p !== password);
    setSavedPasswords(newSavedPasswords);
    localStorage.setItem("savedPasswords", JSON.stringify(newSavedPasswords));
    
    toast({
      title: "Password removed",
      description: "The password has been removed from your saved passwords"
    });
  };

  const showAnalysis = (password: string) => {
    setSelectedPassword(password);
    const analysis = analyzePassword(password);
    setPasswordAnalysis(analysis);
    setShowAnalysisDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-5xl py-12 px-4 sm:px-6">
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
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password Generator
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-4">
            Create secure, memorable passwords with creative themes
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="themed">Themed</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <TabsContent value="themed" className={activeTab === "themed" ? "block" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Selection */}
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Password Themes
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto pr-2">
                <RadioGroup 
                  value={selectedTheme} 
                  onValueChange={setSelectedTheme}
                  className="space-y-3"
                >
                  {passwordThemes.map((theme) => (
                    <div key={theme.id} className="flex items-start space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <RadioGroupItem value={theme.id} id={theme.id} className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={theme.id} className="text-base font-medium flex items-center gap-2">
                          <span>{theme.emoji}</span> {theme.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {theme.description} (e.g., <span className="font-mono">{theme.example}</span>)
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGenerateThemedPasswords}
                >
                  <Wand2 className="h-4 w-4" />
                  Generate New Passwords
                </Button>
              </CardFooter>
            </Card>

            {/* Generated Passwords */}
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Generated Passwords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {currentThemeDescription}
                  </p>
                  
                  <div className="space-y-3">
                    {generatedPasswords.map((password, index) => {
                      const strength = passwordStrengths[index];
                      const strengthInfo = getStrengthInfo(strength);
                      
                      return (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-mono text-lg font-medium break-all">
                              {password}
                            </p>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => showAnalysis(password)}
                                title="Analyze Password"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => savePassword(password)}
                                title="Save Password"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => copyToClipboard(password, index)}
                                title="Copy to Clipboard"
                              >
                                {copied === index ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={`font-medium ${strengthInfo.color}`}>
                              {strengthInfo.label}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              Strength: {strength}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button 
                    className="w-full mt-4 flex items-center justify-center"
                    onClick={handleGenerateThemedPasswords}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New Passwords
                  </Button>
                </div>

                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p className="mb-2"><strong>About Themed Passwords:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>These passwords combine creativity with security</li>
                    <li>All generated passwords include numbers and special characters</li>
                    <li>Many include Unicode characters or emojis for extra security</li>
                    <li>The more varied the character types, the stronger the password</li>
                    <li>Some themes may not be appropriate for all accounts or services</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className={activeTab === "custom" ? "block" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Password Options */}
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Customize Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password-length">Password Length: {customOptions.length}</Label>
                    </div>
                    <Slider
                      id="password-length"
                      min={8}
                      max={32}
                      step={1}
                      value={[customOptions.length]}
                      onValueChange={(value) => {
                        setCustomOptions({...customOptions, length: value[0]});
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>8</span>
                      <span>20</span>
                      <span>32</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>Character Types</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Uppercase (A-Z)</span>
                      <Switch
                        checked={customOptions.includeUpper}
                        onCheckedChange={(checked) => {
                          setCustomOptions({...customOptions, includeUpper: checked});
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Lowercase (a-z)</span>
                      <Switch
                        checked={customOptions.includeLower}
                        onCheckedChange={(checked) => {
                          setCustomOptions({...customOptions, includeLower: checked});
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Numbers (0-9)</span>
                      <Switch
                        checked={customOptions.includeNumbers}
                        onCheckedChange={(checked) => {
                          setCustomOptions({...customOptions, includeNumbers: checked});
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Symbols (!@#$...)</span>
                      <Switch
                        checked={customOptions.includeSymbols}
                        onCheckedChange={(checked) => {
                          setCustomOptions({...customOptions, includeSymbols: checked});
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Emoji</span>
                      <Switch
                        checked={customOptions.includeEmoji}
                        onCheckedChange={(checked) => {
                          setCustomOptions({...customOptions, includeEmoji: checked});
                        }}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>Additional Options</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm">Avoid Ambiguous Characters</span>
                        <p className="text-xs text-muted-foreground">(1, l, I, 0, O, etc.)</p>
                      </div>
                      <Switch
                        checked={customOptions.avoidSimilar}
                        onCheckedChange={(checked) => {
                          setCustomOptions({...customOptions, avoidSimilar: checked});
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full flex items-center justify-center gap-2" 
                  onClick={handleGenerateCustomPasswords}
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Custom Passwords
                </Button>
              </CardContent>
            </Card>

            {/* Generated Custom Passwords */}
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Generated Passwords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {customPasswords.map((password, index) => {
                    const strength = customPasswordStrengths[index];
                    const strengthInfo = getStrengthInfo(strength);
                    
                    return (
                      <div key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-mono text-lg font-medium break-all">
                            {password}
                          </p>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => showAnalysis(password)}
                              title="Analyze Password"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => savePassword(password)}
                              title="Save Password"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => copyToClipboard(password, index + 100)}
                              title="Copy to Clipboard"
                            >
                              {copied === index + 100 ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`font-medium ${strengthInfo.color}`}>
                            {strengthInfo.label}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Strength: {strength}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Button 
                  className="w-full mb-6 flex items-center justify-center"
                  onClick={handleGenerateCustomPasswords}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate More Passwords
                </Button>
                
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Password Tips
                  </h3>
                  <ul className="text-sm space-y-1 list-disc pl-5 text-slate-600 dark:text-slate-300">
                    <li>Use at least 12 characters for strong security</li>
                    <li>Mix character types for the best protection</li>
                    <li>Avoid personal information and common words</li>
                    <li>Use different passwords for each website</li>
                    <li>Consider using a password manager</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className={activeTab === "saved" ? "block" : "hidden"}>
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Star className="h-5 w-5" />
                Saved Passwords
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedPasswords.length > 0 ? (
                <div className="space-y-3">
                  {savedPasswords.map((password, index) => {
                    const strength = calculatePasswordStrength(password);
                    const strengthInfo = getStrengthInfo(strength);
                    
                    return (
                      <div key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-mono text-lg font-medium break-all">
                            {password}
                          </p>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => showAnalysis(password)}
                              title="Analyze Password"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeSavedPassword(password)}
                              title="Remove Password"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => copyToClipboard(password, index + 200)}
                              title="Copy to Clipboard"
                            >
                              {copied === index + 200 ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`font-medium ${strengthInfo.color}`}>
                            {strengthInfo.label}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Strength: {strength}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Save className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No Saved Passwords</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Your saved passwords will appear here. Click the save icon on any password to add it to this list.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("themed")}
                    className="mx-auto"
                  >
                    Generate Some Passwords
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </div>
      
      {/* Password Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Password Analysis</DialogTitle>
            <DialogDescription>
              Detailed analysis of your selected password
            </DialogDescription>
          </DialogHeader>
          
          {passwordAnalysis && (
            <div className="space-y-4 py-4">
              <div className="font-mono text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {selectedPassword}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Strength Score</p>
                  <p className="text-2xl font-bold text-primary">{passwordAnalysis.score}/4</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Entropy</p>
                  <p className="text-2xl font-bold">{Math.round(passwordAnalysis.entropy)} bits</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Character Types</p>
                  <div className="flex gap-1.5 text-xs mt-2">
                    <span className={`px-2 py-1 rounded ${passwordAnalysis.hasUpper ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      A-Z
                    </span>
                    <span className={`px-2 py-1 rounded ${passwordAnalysis.hasLower ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      a-z
                    </span>
                    <span className={`px-2 py-1 rounded ${passwordAnalysis.hasDigit ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      0-9
                    </span>
                    <span className={`px-2 py-1 rounded ${passwordAnalysis.hasSpecial ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      !@#
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Time to Crack</p>
                  <p className="text-sm font-bold">{passwordAnalysis.timeToCrack?.["Brute Force (Offline)"] || "Unknown"}</p>
                </div>
              </div>
              
              {passwordAnalysis.suggestions && passwordAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {passwordAnalysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAnalysisDialog(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    copyToClipboard(selectedPassword, -1);
                    setShowAnalysisDialog(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  Copy Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemePasswordGenerator;
