
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, History, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-5 w-5 text-primary" />
          <span>Password Strength Analyzer</span>
        </Link>
        <nav className="ml-auto flex gap-2 items-center">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/history" className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
