
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Copy, Check, ArrowLeft, Shield, RefreshCw, Wand2 } from "lucide-react";
import { generateThemedPassword, calculatePasswordStrength, getStrengthInfo } from "@/lib/themePasswordGenerator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
    }
  ];

  // Generate passwords when theme changes
  useEffect(() => {
    handleGeneratePasswords();
    // Update current theme description
    const theme = passwordThemes.find(theme => theme.id === selectedTheme);
    if (theme) {
      setCurrentThemeDescription(theme.description);
    }
  }, [selectedTheme]);

  const handleGeneratePasswords = () => {
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
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Themed Password Generator
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Create secure, memorable passwords with creative themes
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Selection */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Password Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => copyToClipboard(password, index)}
                          >
                            {copied === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
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
                  onClick={handleGeneratePasswords}
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
      </div>
    </div>
  );
};

export default ThemePasswordGenerator;
