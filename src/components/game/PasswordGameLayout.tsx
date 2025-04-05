
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { ReactNode } from "react";

interface PasswordGameLayoutProps {
  children: ReactNode;
}

const PasswordGameLayout = ({ children }: PasswordGameLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        <Button asChild variant="outline" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Password Security Game
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Complete quests, earn achievements and improve your security!
          </p>
        </header>
        
        {children}
      </div>
    </div>
  );
};

export default PasswordGameLayout;
