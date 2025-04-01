
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Save, RefreshCw, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzePassword } from "@/lib/passwordAnalyzer";
import StrengthMeter from "@/components/StrengthMeter";
import crypto from "crypto-js";

type Service = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const services: Service[] = [
  { id: "facebook", name: "Facebook", icon: <span className="text-blue-600">f</span> },
  { id: "twitter", name: "Twitter", icon: <span className="text-blue-400">t</span> },
  { id: "whatsapp", name: "WhatsApp", icon: <span className="text-green-500">w</span> },
  { id: "youtube", name: "YouTube", icon: <span className="text-red-500">y</span> },
  { id: "tiktok", name: "TikTok", icon: <span className="text-pink-500">tt</span> },
  { id: "spotify", name: "Spotify", icon: <span className="text-green-600">s</span> },
  { id: "snapchat", name: "Snapchat", icon: <span className="text-yellow-400">sc</span> },
  { id: "linkedin", name: "LinkedIn", icon: <span className="text-blue-700">li</span> },
  { id: "pinterest", name: "Pinterest", icon: <span className="text-red-600">p</span> },
  { id: "reddit", name: "Reddit", icon: <span className="text-orange-600">r</span> },
  { id: "other", name: "Other", icon: <span>🔒</span> },
];

const ServicePasswords = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [savedPasswords, setSavedPasswords] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  const generateServicePassword = (service: Service) => {
    setSelectedService(service);
    const passwords = [];
    
    // Generate 5 passwords for the selected service
    for (let i = 0; i < 5; i++) {
      passwords.push(generatePasswordForService(service.id));
    }
    
    setGeneratedPasswords(passwords);
  };
  
  const generatePasswordForService = (serviceId: string): string => {
    // Different password generation strategies based on service
    const length = Math.floor(Math.random() * 6) + 12; // 12-18 characters
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_-+=<>?";
    
    let chars = lowercase + uppercase + numbers;
    
    // Add service-specific elements
    switch (serviceId) {
      case "facebook":
        chars += "fb" + "social" + symbols;
        break;
      case "twitter":
        chars += "tweet" + "bird" + symbols;
        break;
      case "whatsapp":
        chars += "chat" + "message" + symbols;
        break;
      case "youtube":
        chars += "video" + "tube" + symbols;
        break;
      case "tiktok":
        chars += "tik" + "tok" + symbols;
        break;
      case "spotify":
        chars += "music" + "playlist" + symbols;
        break;
      case "snapchat":
        chars += "snap" + "photo" + symbols;
        break;
      case "linkedin":
        chars += "job" + "work" + symbols;
        break;
      case "pinterest":
        chars += "pin" + "craft" + symbols;
        break;
      case "reddit":
        chars += "upvote" + "karma" + symbols;
        break;
      default:
        chars += symbols;
    }
    
    let password = "";
    // Ensure at least one uppercase, one number, and one symbol
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill the rest randomly
    for (let i = 3; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };
  
  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Password copied",
      description: "The password has been copied to your clipboard",
    });
  };
  
  const savePassword = async (password: string, serviceId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save passwords",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const analysis = analyzePassword(password);
      const passwordHash = crypto.SHA256(password).toString();
      
      // Save to Supabase
      const { error } = await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: passwordHash,
        score: analysis.score,
        length: analysis.length,
        has_upper: analysis.hasUpper,
        has_lower: analysis.hasLower,
        has_digit: analysis.hasDigit,
        has_special: analysis.hasSpecial,
        is_common: analysis.isCommon,
        has_common_pattern: analysis.hasCommonPattern,
        entropy: analysis.entropy
      });
      
      if (error) throw error;
      
      // Update local saved passwords
      setSavedPasswords(prev => ({
        ...prev,
        [serviceId]: password
      }));
      
      toast({
        title: "Password saved",
        description: "Your password has been saved to your account",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const regeneratePasswords = () => {
    if (selectedService) {
      generateServicePassword(selectedService);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4">
        <div className="mb-8 flex items-center justify-between">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-center flex-grow">
            Service-Specific Passwords
          </h1>
          <div className="w-[100px]"></div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className={`cursor-pointer transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                selectedService?.id === service.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => generateServicePassword(service)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="text-2xl mb-2 font-bold">{service.icon}</div>
                <h3 className="font-medium text-slate-900 dark:text-white">{service.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedService && (
          <Card className="mb-8 border-none shadow-lg bg-white dark:bg-slate-800 transition-colors duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center justify-between text-slate-900 dark:text-white">
                <span>Passwords for {selectedService.name}</span>
                <Button variant="outline" size="sm" onClick={regeneratePasswords}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {generatedPasswords.map((password, index) => {
                  const analysis = analyzePassword(password);
                  
                  return (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-base sm:text-lg break-all">{password}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => copyPassword(password)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => savePassword(password, selectedService.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <StrengthMeter score={analysis.score} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800 transition-colors duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center text-slate-900 dark:text-white">
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Your Saved Passwords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(savedPasswords).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(savedPasswords).map(([serviceId, password]) => {
                  const service = services.find(s => s.id === serviceId);
                  const analysis = analyzePassword(password);
                  
                  return (
                    <div key={serviceId} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <span className="mr-2">{service?.icon}</span>
                          <span className="font-medium">{service?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyPassword(password)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="font-mono text-sm break-all mb-2">{password}</div>
                      <StrengthMeter score={analysis.score} />
                    </div>
                  );
                })}
              </div>
            ) : user ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No passwords saved yet. Generate and save passwords for your services!
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p className="mb-3">Sign in to save and view your passwords.</p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicePasswords;
