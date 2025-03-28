
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, History, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold">Password Analyzer</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/history" className="flex items-center space-x-1">
                  <History className="h-4 w-4 mr-1" />
                  <span>History</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="flex items-center">
                <LogOut className="h-4 w-4 mr-1" />
                <span>Sign out</span>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
