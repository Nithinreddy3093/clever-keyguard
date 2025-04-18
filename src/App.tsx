
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import IntroAnimation from "@/components/IntroAnimation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import History from "./pages/History";
import PassphraseGenerator from "./pages/PassphraseGenerator";
import PasswordChat from "./pages/PasswordChat";
import ThemePasswordGenerator from "./pages/ThemePasswordGenerator";
import PasswordRankings from "./pages/PasswordRankings";
import PasswordGame from "./pages/PasswordGame";
import PasswordArcade from "./pages/PasswordArcade";
import ServicePasswords from "./pages/ServicePasswords";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <IntroAnimation />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/history" element={<History />} />
                <Route path="/passphrase" element={<PassphraseGenerator />} />
                <Route path="/chat" element={<PasswordChat />} />
                <Route path="/theme-passwords" element={<ThemePasswordGenerator />} />
                <Route path="/rankings" element={<PasswordRankings />} />
                <Route path="/password-game" element={<PasswordGame />} />
                <Route path="/password-arcade" element={<PasswordArcade />} />
                <Route path="/service-passwords" element={<ServicePasswords />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
