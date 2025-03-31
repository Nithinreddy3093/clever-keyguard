
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, ArrowDown, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordAnalysis } from "@/types/password";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface PasswordChatbotProps {
  currentAnalysis?: PasswordAnalysis | null;
}

const PasswordChatbot = ({ currentAnalysis }: PasswordChatbotProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI password security assistant. I can help you understand best practices for creating secure passwords and answer any questions about password security. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastAnalyzedPassword, setLastAnalyzedPassword] = useState<PasswordAnalysis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input field on mobile
  useEffect(() => {
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  // Effect to update chatbot when a new password is analyzed
  useEffect(() => {
    if (currentAnalysis && currentAnalysis.score !== undefined) {
      // Only add a message if this is a new or different password analysis
      const isNewAnalysis = !lastAnalyzedPassword || 
        JSON.stringify(lastAnalyzedPassword) !== JSON.stringify(currentAnalysis);
      
      if (isNewAnalysis) {
        setLastAnalyzedPassword(currentAnalysis);
        
        // Determine the strength description based on score
        let strengthDesc = "";
        switch(currentAnalysis.score) {
          case 0: strengthDesc = "very weak"; break;
          case 1: strengthDesc = "weak"; break;
          case 2: strengthDesc = "medium"; break;
          case 3: strengthDesc = "strong"; break;
          case 4: strengthDesc = "very strong"; break;
        }
        
        // Add a message about the new password
        const analysisMessage: Message = {
          id: "password-analysis-" + Date.now(),
          content: `I notice you've entered a new password that is ${strengthDesc}. Would you like me to analyze it and suggest improvements?`,
          isBot: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, analysisMessage]);
      }
    }
  }, [currentAnalysis]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Validate input to prevent sending large chunks of text or formatted content
    const cleanInput = input.trim();
    if (cleanInput.length > 500) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 500 characters.",
        variant: "destructive",
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: cleanInput,
      isBot: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // Prepare comprehensive password stats for better context if available
      const passwordStats = currentAnalysis ? {
        score: currentAnalysis.score,
        length: currentAnalysis.length,
        hasUpper: currentAnalysis.hasUpper,
        hasLower: currentAnalysis.hasLower,
        hasDigit: currentAnalysis.hasDigit,
        hasSpecial: currentAnalysis.hasSpecial,
        commonPatterns: currentAnalysis.commonPatterns,
        entropy: Math.round(currentAnalysis.entropy),
        timeToCrack: currentAnalysis.timeToCrack["Brute Force (Offline)"],
        attackResistance: currentAnalysis.attackResistance,
        hackabilityScore: currentAnalysis.hackabilityScore,
        isCommon: currentAnalysis.isCommon,
        hasCommonPattern: currentAnalysis.hasCommonPattern,
        mlPatterns: currentAnalysis.mlPatterns.map(pattern => ({
          type: pattern.type,
          confidence: pattern.confidence,
          description: pattern.description
        }))
      } : null;
      
      console.log("Sending password stats:", passwordStats);
      
      // Show typing indicator animation
      const typingId = "typing-" + Date.now();
      setMessages(prev => [...prev, {
        id: typingId,
        content: "Thinking...",
        isBot: true,
        timestamp: new Date(),
      }]);
      
      const { data, error } = await supabase.functions.invoke('password-security-chatbot', {
        body: { 
          message: cleanInput,
          passwordStats 
        },
      });

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== typingId));
      setIsTyping(false);

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No response data received from the chatbot");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      // Remove typing indicator if it exists
      setMessages(prev => prev.filter(msg => !msg.id.startsWith("typing-")));
      setIsTyping(false);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGeneratePassword = () => {
    setInput("Generate a secure random password for me");
    setTimeout(sendMessage, 100);
  };

  return (
    <Card className="flex flex-col h-[500px] sm:h-[600px] border-none shadow-lg transition-colors duration-300 bg-white dark:bg-slate-800">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-primary" />
            Password Security Assistant
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={handleGeneratePassword}
          >
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">Generate Password</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4">
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 sm:mb-4 flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%] ${
                  message.isBot
                    ? "bg-secondary text-secondary-foreground dark:bg-slate-700"
                    : "bg-primary text-primary-foreground"
                } ${message.id.startsWith("typing-") ? "animate-pulse" : ""}`}
              >
                <div className="flex items-center mb-1">
                  {message.isBot ? (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  ) : (
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="text-xs">
                    {message.isBot ? "AI Assistant" : "You"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</p>
                <div className="text-[10px] sm:text-xs opacity-70 text-right mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {messages.length > 2 && (
            <div className="flex justify-center my-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center gap-1"
                onClick={scrollToBottom}
              >
                <ArrowDown className="h-3 w-3" />
                Scroll to bottom
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about password security..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChatbot;
