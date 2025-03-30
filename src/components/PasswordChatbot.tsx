
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordAnalysis } from "@/types/password";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to update chatbot when a new password is analyzed
  useEffect(() => {
    if (currentAnalysis && currentAnalysis.score !== undefined) {
      // Only send an automatic message if this is a new password analysis
      // and there's only the welcome message
      if (messages.length === 1) {
        const initialAdvice: Message = {
          id: "initial-analysis",
          content: `I notice you've entered a password. Would you like me to explain its strengths and weaknesses?`,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, initialAdvice]);
      }
    }
  }, [currentAnalysis]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isBot: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
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
      
      const { data, error } = await supabase.functions.invoke('password-security-chatbot', {
        body: { 
          message: input,
          passwordStats 
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No response data received from the chatbot");
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
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again or check if the API key is properly configured.",
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

  return (
    <Card className="flex flex-col h-[600px] border-none shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          Password Security Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.isBot
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.isBot ? (
                    <Bot className="h-4 w-4 mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-xs">
                    {message.isBot ? "AI Assistant" : "You"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <div className="text-xs opacity-70 text-right mt-1">
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about password security..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChatbot;
