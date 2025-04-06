import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, CheckCircle, Clock, Mail, RefreshCw, X,
  ArrowRight, MessageSquare, ShieldCheck, BadgeInfo, ShieldAlert, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface PhishingGameProps {
  onComplete: (score: number) => void;
}

interface PhishingAttempt {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isPhishing: boolean;
  timeReceived: string;
  redFlags: RedFlag[];
  type: 'email' | 'sms' | 'social';
}

interface RedFlag {
  id: string;
  description: string;
  isCorrect: boolean;
}

const PhishingGame = ({ onComplete }: PhishingGameProps) => {
  const { toast } = useToast();
  const [currentMessage, setCurrentMessage] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [messageSubmitted, setMessageSubmitted] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<'phishing' | 'legitimate' | null>(null);
  const [correctStreak, setCorrectStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [hintAvailable, setHintAvailable] = useState<boolean>(true);
  const [perfectScore, setPerfectScore] = useState<boolean>(true);
  
  const phishingAttempts: PhishingAttempt[] = [
    {
      id: "email-1",
      sender: "security@amaz0n-support.com",
      subject: "URGENT: Your Amazon Account Has Been Compromised",
      content: `Dear Valued Customer,

We detected unusual activity on your Amazon account. Your account has been temporarily limited.

Click the link below to verify your information:
https://amazon-security-verify.com/login

This is urgent! If you don't verify within 24 hours, your account will be permanently closed.

Amazon Security Team`,
      isPhishing: true,
      timeReceived: "10:23 AM",
      redFlags: [
        { id: "e1-f1", description: "Sender email domain (amaz0n-support.com) doesn't match official Amazon domain", isCorrect: true },
        { id: "e1-f2", description: "Urgency language to pressure quick action", isCorrect: true },
        { id: "e1-f3", description: "Suspicious URL (amazon-security-verify.com)", isCorrect: true },
        { id: "e1-f4", description: "Threatening consequences if no action taken", isCorrect: true },
        { id: "e1-f5", description: "The email mentions account security", isCorrect: false },
        { id: "e1-f6", description: "The email has a generic greeting ('Dear Valued Customer')", isCorrect: true }
      ],
      type: 'email'
    },
    {
      id: "sms-1",
      sender: "FEDEX",
      subject: "SMS Message",
      content: `FEDEX: Your package is on hold due to missing delivery information. Update your delivery preferences here: http://fdx-delivery.info/update`,
      isPhishing: true,
      timeReceived: "2:15 PM",
      redFlags: [
        { id: "s1-f1", description: "Suspicious shortened or misleading URL", isCorrect: true },
        { id: "s1-f2", description: "Lack of personalization or tracking number", isCorrect: true },
        { id: "s1-f3", description: "FedEx typically doesn't send SMS about 'missing delivery information'", isCorrect: true },
        { id: "s1-f4", description: "The message is from FedEx", isCorrect: false },
        { id: "s1-f5", description: "The message mentions a package", isCorrect: false }
      ],
      type: 'sms'
    },
    {
      id: "email-2",
      sender: "newsletter@spotify.com",
      subject: "Your Weekly Music Recommendations",
      content: `Hey there,

Check out new releases we think you'll love based on your recent listening:

• New album from Taylor Swift
• Podcasts about technology
• Throwback playlist from the 90s

Open Spotify to listen now.

Manage subscription preferences in your account settings.

- The Spotify Team`,
      isPhishing: false,
      timeReceived: "9:05 AM",
      redFlags: [
        { id: "e2-f1", description: "Generic greeting without name", isCorrect: false },
        { id: "e2-f2", description: "The sender email is from an official domain (spotify.com)", isCorrect: false },
        { id: "e2-f3", description: "Contains suspicious links", isCorrect: false },
        { id: "e2-f4", description: "Asks for personal information", isCorrect: false },
        { id: "e2-f5", description: "No urgency or threatening language", isCorrect: false }
      ],
      type: 'email'
    },
    {
      id: "social-1",
      sender: "Microsoft Support",
      subject: "Direct Message",
      content: `ATTENTION MICROSOFT USER: We've detected a virus on your computer. Message us now to get free virus removal tool or risk data loss within 24 hours. Click: https://bit.ly/ms-virus-removal`,
      isPhishing: true,
      timeReceived: "11:37 AM",
      redFlags: [
        { id: "so1-f1", description: "Unsolicited tech support message", isCorrect: true },
        { id: "so1-f2", description: "Creates urgency and fear", isCorrect: true },
        { id: "so1-f3", description: "Contains suspicious shortened link", isCorrect: true },
        { id: "so1-f4", description: "Legitimate tech companies don't scan for viruses on your device remotely", isCorrect: true },
        { id: "so1-f5", description: "The message mentions Microsoft", isCorrect: false },
        { id: "so1-f6", description: "ALL CAPS used for emphasis", isCorrect: true }
      ],
      type: 'social'
    },
    {
      id: "email-3",
      sender: "no-reply@netflix.com",
      subject: "Your Netflix Invoice",
      content: `Hello,

Your Netflix subscription was renewed. This month's charge: $14.99

Subscription Plan: Standard HD
Next billing date: November 16, 2024

If you have questions about your billing, please visit netflix.com/account

Thank you for being a valued Netflix member!

Netflix Team`,
      isPhishing: false,
      timeReceived: "8:22 AM",
      redFlags: [
        { id: "e3-f1", description: "Contains suspicious links", isCorrect: false },
        { id: "e3-f2", description: "The Netflix domain is incorrect", isCorrect: false },
        { id: "e3-f3", description: "Asks for immediate action", isCorrect: false },
        { id: "e3-f4", description: "Provides specific account details", isCorrect: false },
        { id: "e3-f5", description: "Contains urgent language", isCorrect: false }
      ],
      type: 'email'
    },
    {
      id: "sms-2",
      sender: "+14325551234",
      subject: "SMS Message",
      content: `Hi this is your bank. Your card has been locked due to suspicious activity. To unlock: creditunion-verify.com/unlock?id=1293`,
      isPhishing: true,
      timeReceived: "3:45 PM",
      redFlags: [
        { id: "s2-f1", description: "No specific bank name mentioned", isCorrect: true },
        { id: "s2-f2", description: "Suspicious or unrelated domain name", isCorrect: true },
        { id: "s2-f3", description: "Sender uses generic phone number, not short code", isCorrect: true },
        { id: "s2-f4", description: "Creates urgency with 'locked' language", isCorrect: true },
        { id: "s2-f5", description: "Banks typically don't send SMS for card locks without identifying themselves properly", isCorrect: true },
        { id: "s2-f6", description: "The message mentions banking", isCorrect: false }
      ],
      type: 'sms'
    },
    {
      id: "email-4",
      sender: "payments-update@paypal.com",
      subject: "ACTION REQUIRED: Update Your PayPal Information",
      content: `Dear Customer,

We've noticed a problem with your PayPal account information. If it's not updated within 48 hours, your account access will be restricted.

Click here: https://paypal-accountupdate.com

Thank you for your cooperation.

The PayPal Team`,
      isPhishing: true,
      timeReceived: "2:30 PM",
      redFlags: [
        { id: "e4-f1", description: "The URL isn't a legitimate PayPal domain", isCorrect: true },
        { id: "e4-f2", description: "Generic greeting ('Dear Customer')", isCorrect: true },
        { id: "e4-f3", description: "Creates false urgency", isCorrect: true },
        { id: "e4-f4", description: "Threatening consequences", isCorrect: true },
        { id: "e4-f5", description: "The message has 'ACTION REQUIRED' in the subject", isCorrect: false }
      ],
      type: 'email'
    },
    {
      id: "social-2",
      sender: "LinkedIn Connection",
      subject: "Direct Message",
      content: `Hi there! I noticed we're in the same industry. I've written a whitepaper on industry trends that might interest you. You can download it here: https://www.linkedin.com/pulse/technology-trends-2024-sarah-johnson/`,
      isPhishing: false,
      timeReceived: "10:12 AM",
      redFlags: [
        { id: "so2-f1", description: "Contains industry-specific content", isCorrect: false },
        { id: "so2-f2", description: "The link is to a legitimate LinkedIn article", isCorrect: false },
        { id: "so2-f3", description: "Requests sensitive information", isCorrect: false },
        { id: "so2-f4", description: "Creates a sense of urgency", isCorrect: false },
        { id: "so2-f5", description: "Offers business-relevant content", isCorrect: false }
      ],
      type: 'social'
    },
    {
      id: "email-5",
      sender: "support@apple.com",
      subject: "Receipt for your recent Apple purchase",
      content: `Dear Customer,

Thank you for your recent purchase from the Apple Store.

Order #APPL284691
iPhone 13 Pro - $999.00
AppleCare+ - $199.00
Total: $1,198.00

If you did not make this purchase, please call Apple Support at 1-800-MY-APPLE.

Regards,
Apple Customer Support`,
      isPhishing: false,
      timeReceived: "4:50 PM",
      redFlags: [
        { id: "e5-f1", description: "The email has an official Apple domain", isCorrect: false },
        { id: "e5-f2", description: "Provides a legitimate Apple support phone number", isCorrect: false },
        { id: "e5-f3", description: "Contains suspicious attachments", isCorrect: false },
        { id: "e5-f4", description: "Uses threatening language", isCorrect: false },
        { id: "e5-f5", description: "Offers a way to dispute unrecognized charges", isCorrect: false }
      ],
      type: 'email'
    },
    {
      id: "sms-3",
      sender: "ALERT",
      subject: "SMS Message",
      content: `ALERT: Unusual sign-in attempt detected on your Google account from Moscow, Russia. If not you, reset password here: security-google.co/reset`,
      isPhishing: true,
      timeReceived: "12:10 AM",
      redFlags: [
        { id: "s3-f1", description: "Sender is generic ('ALERT')", isCorrect: true },
        { id: "s3-f2", description: "Suspicious domain (security-google.co not google.com)", isCorrect: true },
        { id: "s3-f3", description: "Creates fear with 'unusual sign-in'", isCorrect: true },
        { id: "s3-f4", description: "Mentions a specific location to seem legitimate", isCorrect: true },
        { id: "s3-f5", description: "Google typically directs users to accounts.google.com, not third-party domains", isCorrect: true },
        { id: "s3-f6", description: "The message mentions Google", isCorrect: false }
      ],
      type: 'sms'
    }
  ];

  useEffect(() => {
    if (!gameComplete && !messageSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimeOut();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameComplete, messageSubmitted]);

  const handleTimeOut = () => {
    if (!messageSubmitted) {
      toast({
        title: "Time's up!",
        description: "You didn't make a decision in time.",
        variant: "destructive"
      });
      
      setMessageSubmitted(true);
      setVerdict(null);
      
      setCorrectStreak(0);
      setMultiplier(1);
      
      setPerfectScore(false);
      
      setTimeout(() => {
        handleNextMessage();
      }, 3000);
    }
  };

  const handleFlagToggle = (flagId: string) => {
    if (messageSubmitted) return;
    
    setSelectedFlags(prev => {
      if (prev.includes(flagId)) {
        return prev.filter(id => id !== flagId);
      } else {
        return [...prev, flagId];
      }
    });
  };

  const handleSubmitVerdict = (isPhishing: boolean) => {
    if (messageSubmitted) return;
    
    const currentAttempt = phishingAttempts[currentMessage];
    const isCorrect = currentAttempt.isPhishing === isPhishing;
    
    setVerdict(isPhishing ? 'phishing' : 'legitimate');
    setMessageSubmitted(true);
    
    const basePts = 10;
    let flagBonus = 0;
    let timeBonus = 0;
    
    if (isCorrect) {
      const correctFlags = currentAttempt.redFlags.filter(flag => flag.isCorrect);
      const incorrectFlags = currentAttempt.redFlags.filter(flag => !flag.isCorrect);
      
      const correctFlagsSelected = selectedFlags.filter(flagId => 
        correctFlags.some(flag => flag.id === flagId)
      ).length;
      
      const incorrectFlagsSelected = selectedFlags.filter(flagId => 
        incorrectFlags.some(flag => flag.id === flagId)
      ).length;
      
      flagBonus = Math.min(5, correctFlagsSelected - incorrectFlagsSelected);
      
      timeBonus = Math.min(5, Math.ceil(timeLeft / 10));
      
      setCorrectStreak(prev => prev + 1);
      if (correctStreak >= 2) {
        setMultiplier(prev => Math.min(3, prev + 0.5));
      }
      
      if (correctFlagsSelected !== correctFlags.length || incorrectFlagsSelected > 0) {
        setPerfectScore(false);
      }
    } else {
      setCorrectStreak(0);
      setMultiplier(1);
      setPerfectScore(false);
    }
    
    const totalPoints = Math.round((isCorrect ? basePts + flagBonus + timeBonus : 0) * multiplier);
    
    setScore(prevScore => prevScore + totalPoints);
    
    if (isCorrect) {
      toast({
        title: "Great job!",
        description: `Correct identification! +${totalPoints} points (×${multiplier} multiplier)`,
      });
    } else {
      toast({
        title: "Oops!",
        description: `That was ${currentAttempt.isPhishing ? 'a phishing attempt' : 'a legitimate message'}.`,
        variant: "destructive"
      });
    }
    
    setTimeout(() => {
      handleNextMessage();
    }, 4000);
  };

  const handleGetHint = () => {
    if (!hintAvailable || messageSubmitted) return;
    
    const currentAttempt = phishingAttempts[currentMessage];
    const correctFlags = currentAttempt.redFlags.filter(flag => flag.isCorrect);
    
    if (correctFlags.length > 0) {
      const unselectedCorrectFlags = correctFlags.filter(
        flag => !selectedFlags.includes(flag.id)
      );
      
      if (unselectedCorrectFlags.length > 0) {
        const hintFlag = unselectedCorrectFlags[0];
        setSelectedFlags(prev => [...prev, hintFlag.id]);
        
        toast({
          title: "Hint Used",
          description: `Look for: ${hintFlag.description}`,
        });
        
        setHintAvailable(false);
        setPerfectScore(false);
      } else {
        toast({
          title: "Hint Unavailable",
          description: "You've already found all the important red flags!",
        });
      }
    } else {
      toast({
        title: "Hint Used",
        description: "This message appears to be normal with no obvious red flags.",
      });
      
      setHintAvailable(false);
    }
  };

  const handleNextMessage = () => {
    const nextMessageIndex = currentMessage + 1;
    
    if (nextMessageIndex < phishingAttempts.length) {
      setCurrentMessage(nextMessageIndex);
      setSelectedFlags([]);
      setMessageSubmitted(false);
      setVerdict(null);
      setTimeLeft(45);
      
      if (nextMessageIndex % 3 === 0) {
        setHintAvailable(true);
      }
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameComplete(true);
    
    let finalScore = score;
    
    if (perfectScore) {
      const perfectBonus = 20;
      finalScore += perfectBonus;
      
      toast({
        title: "Perfect Score Bonus!",
        description: `+${perfectBonus} points for perfect phishing detection!`,
      });
    }
    
    finalScore = Math.min(100, finalScore);
    
    setTimeout(() => {
      onComplete(finalScore);
    }, 2000);
  };

  const getMessageTypeIcon = (type: 'email' | 'sms' | 'social') => {
    switch(type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'social':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {!gameComplete ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Hook or Hoax?</h3>
              <p className="text-sm text-slate-500">Identify phishing attempts</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                Score: {score}
              </Badge>
              <Badge variant={timeLeft < 15 ? "destructive" : "outline"} className={timeLeft < 15 ? "" : "bg-primary/10"}>
                <Clock className="h-3.5 w-3.5 mr-1" /> {timeLeft}s
              </Badge>
              {multiplier > 1 && (
                <Badge variant="secondary">
                  {multiplier}x Multiplier
                </Badge>
              )}
            </div>
          </div>
          
          <Progress 
            value={(currentMessage / phishingAttempts.length) * 100} 
            className="h-1.5" 
          />
          
          {currentMessage < phishingAttempts.length && (
            <Card className={`border ${
              messageSubmitted && verdict === 'phishing' ? 'border-red-500' : 
              messageSubmitted && verdict === 'legitimate' ? 'border-green-500' :
              'border-slate-200 dark:border-slate-800'
            }`}>
              <CardHeader className="pb-2 pt-4 px-4 flex-row justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                    {getMessageTypeIcon(phishingAttempts[currentMessage].type)}
                    <span className="ml-1 capitalize">{phishingAttempts[currentMessage].type}</span>
                  </Badge>
                  <div className="text-sm font-medium truncate">
                    {phishingAttempts[currentMessage].sender}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {phishingAttempts[currentMessage].timeReceived}
                </div>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <div className="font-medium text-sm mb-2">
                  {phishingAttempts[currentMessage].subject}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {phishingAttempts[currentMessage].content}
                </div>
                
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-sm">Possible Red Flags:</h4>
                    {hintAvailable && !messageSubmitted && (
                      <Button variant="ghost" size="sm" onClick={handleGetHint} className="h-7 text-xs">
                        <BadgeInfo className="h-3.5 w-3.5 mr-1.5" /> Get Hint
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {phishingAttempts[currentMessage].redFlags.map(flag => (
                      <div key={flag.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={flag.id}
                          checked={selectedFlags.includes(flag.id)}
                          onCheckedChange={() => handleFlagToggle(flag.id)}
                          disabled={messageSubmitted}
                          className={
                            messageSubmitted && flag.isCorrect ? "border-green-500 bg-green-500" :
                            messageSubmitted && selectedFlags.includes(flag.id) && !flag.isCorrect ? "border-red-500" :
                            ""
                          }
                        />
                        <label 
                          htmlFor={flag.id}
                          className={`text-sm leading-relaxed cursor-pointer ${
                            messageSubmitted && flag.isCorrect ? "text-green-600 dark:text-green-400 font-medium" :
                            messageSubmitted && selectedFlags.includes(flag.id) && !flag.isCorrect ? "text-red-600 dark:text-red-400" :
                            ""
                          }`}
                        >
                          {flag.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {messageSubmitted && (
                  <div className={`mt-4 p-3 rounded-md ${
                    phishingAttempts[currentMessage].isPhishing ? 
                      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" :
                      "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  }`}>
                    <div className="flex items-center gap-2">
                      {phishingAttempts[currentMessage].isPhishing ? 
                        <AlertTriangle className="h-5 w-5 text-red-500" /> :
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      }
                      <div className="font-medium">
                        This is {phishingAttempts[currentMessage].isPhishing ? "a phishing attempt!" : "a legitimate message."}
                      </div>
                    </div>
                    <p className="text-sm mt-1">
                      {phishingAttempts[currentMessage].isPhishing ? 
                        "Be careful with messages that create urgency or ask for your information." :
                        "This message shows the expected patterns of a legitimate communication."
                      }
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 pb-3 px-4 justify-between">
                <div className="text-sm">
                  Message {currentMessage + 1} of {phishingAttempts.length}
                </div>
                {!messageSubmitted ? (
                  <div className="flex gap-3">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleSubmitVerdict(true)}
                      className="flex items-center"
                    >
                      <ShieldAlert className="h-4 w-4 mr-1.5" /> Mark as Phishing
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={() => handleSubmitVerdict(false)}
                      className="flex items-center"
                    >
                      <ShieldCheck className="h-4 w-4 mr-1.5" /> Mark as Legitimate
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleNextMessage}>
                    {currentMessage < phishingAttempts.length - 1 ? "Next Message" : "Complete Challenge"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-2xl font-bold mb-2">Challenge Complete!</h3>
          <p className="text-lg mb-6">
            Final Score: <span className="text-primary font-bold">{score}</span>/100
          </p>
          
          {perfectScore && (
            <div className="mb-6 max-w-md mx-auto p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
              <p className="font-medium text-amber-800 dark:text-amber-300">Achievement Unlocked!</p>
              <p className="text-sm">PhishShield 3000: Perfect detection of all phishing attempts!</p>
            </div>
          )}
          
          <div className="max-w-md mx-auto text-left p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-6">
            <h4 className="font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              Security Assessment
            </h4>
            
            {score >= 80 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Outstanding job! You have excellent phishing detection skills and a keen eye for security red flags.
              </p>
            ) : score >= 60 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Good work! You identified most phishing attempts, but there's still room to sharpen your detection skills.
              </p>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You've learned the basics of phishing detection. With more practice, you'll be able to spot sophisticated attacks.
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button onClick={() => onComplete(score)}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingGame;
