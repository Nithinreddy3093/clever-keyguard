
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShieldCheck } from "lucide-react";

const SecurityTips = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-lg border-none">
      <div className="flex flex-row items-center justify-between px-6 py-4 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
          Password Security Tips
        </h3>
      </div>
      <div className="p-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Use a password manager</AccordionTrigger>
            <AccordionContent>
              Password managers generate, store, and autofill strong unique passwords for all your accounts. 
              Popular options include 1Password, LastPass, Bitwarden, and KeePass.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Create a password phrase</AccordionTrigger>
            <AccordionContent>
              Instead of a single word, use a phrase with special characters and numbers.
              For example, "MangoTree42!InMyYard" is much stronger than "password123".
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>Use unique passwords for each account</AccordionTrigger>
            <AccordionContent>
              Reusing passwords is dangerous. If one account is compromised, attackers will try your 
              password on your other accounts. Use a different password for each site or service.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>Enable two-factor authentication (2FA)</AccordionTrigger>
            <AccordionContent>
              Even with a strong password, adding a second factor like an authenticator app or 
              security key significantly enhances your security.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>Check for data breaches</AccordionTrigger>
            <AccordionContent>
              Services like Have I Been Pwned can alert you if your email or passwords appear in known data breaches.
              Change compromised passwords immediately.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SecurityTips;
