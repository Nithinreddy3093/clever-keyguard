
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, RefreshCw, Copy, Check, ArrowLeft } from "lucide-react";
import { generatePassphrase, PassphraseOptions, calculatePassphraseStrength } from "@/lib/passphraseGenerator";
import { useToast } from "@/hooks/use-toast";

const PassphraseGenerator = () => {
  const { toast } = useToast();
  const [passphrases, setPassphrases] = useState<string[]>([]);
  const [options, setOptions] = useState<PassphraseOptions>({
    wordCount: 4,
    addNumber: true,
    addSpecial: true,
    capitalizeWords: true
  });
  const [copied, setCopied] = useState<number | null>(null);

  const handleGeneratePassphrases = () => {
    const newPassphrases: string[] = [];
    for (let i = 0; i < 3; i++) {
      newPassphrases.push(generatePassphrase(options));
    }
    setPassphrases(newPassphrases);
    setCopied(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    toast({
      title: "Copied to clipboard",
      description: "The passphrase has been copied to your clipboard",
    });

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const getStrengthLabel = (entropy: number) => {
    if (entropy >= 90) return "Very Strong";
    if (entropy >= 70) return "Strong";
    if (entropy >= 50) return "Good";
    if (entropy >= 30) return "Moderate";
    return "Weak";
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

        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Passphrase Generator
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Create strong, memorable passphrases that are easy to remember but hard to crack
          </p>
        </header>

        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Customize Your Passphrase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="word-count">Number of Words: {options.wordCount}</Label>
                </div>
                <Slider 
                  id="word-count"
                  min={2} 
                  max={8} 
                  step={1} 
                  value={[options.wordCount]} 
                  onValueChange={(value) => setOptions({...options, wordCount: value[0]})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="add-number" 
                    checked={options.addNumber}
                    onCheckedChange={(value) => setOptions({...options, addNumber: value})}
                  />
                  <Label htmlFor="add-number">Add Number</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="add-special" 
                    checked={options.addSpecial}
                    onCheckedChange={(value) => setOptions({...options, addSpecial: value})}
                  />
                  <Label htmlFor="add-special">Add Special Character</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="capitalize" 
                    checked={options.capitalizeWords}
                    onCheckedChange={(value) => setOptions({...options, capitalizeWords: value})}
                  />
                  <Label htmlFor="capitalize">Capitalize Words</Label>
                </div>
              </div>
              
              <Button 
                className="w-full flex items-center justify-center"
                onClick={handleGeneratePassphrases}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Passphrases
              </Button>
            </div>
          </CardContent>
        </Card>

        {passphrases.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Generated Passphrases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {passphrases.map((passphrase, index) => {
                  const strength = calculatePassphraseStrength(passphrase);
                  const strengthLabel = getStrengthLabel(strength);
                  const strengthColor = 
                    strength >= 90 ? "text-green-600" : 
                    strength >= 70 ? "text-emerald-500" : 
                    strength >= 50 ? "text-blue-500" : 
                    strength >= 30 ? "text-amber-500" : 
                    "text-red-500";
                  
                  return (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-lg font-medium break-all">{passphrase}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => copyToClipboard(passphrase, index)}
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
                          {strengthLabel}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Entropy: ~{Math.round(strength)} bits
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                <p className="mb-2"><strong>Tips for using passphrases:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Passphrases are generally easier to remember than random passwords</li>
                  <li>The more words you include, the stronger your passphrase becomes</li>
                  <li>Adding numbers and special characters significantly increases strength</li>
                  <li>Avoid using famous quotes or song lyrics as they can be guessed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PassphraseGenerator;
