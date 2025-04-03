
import { useState, useEffect } from "react";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const IntroAnimation = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  // Check if intro was already shown in this session
  useEffect(() => {
    const introShown = sessionStorage.getItem("introShown");
    if (introShown) {
      setShowIntro(false);
    }
  }, []);

  // Animation sequence timing
  useEffect(() => {
    if (!showIntro) return;

    const phaseTimers = [
      setTimeout(() => setAnimationPhase(1), 800),  // Logo appears
      setTimeout(() => setAnimationPhase(2), 2000), // Text appears
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowIntro(false);
          sessionStorage.setItem("introShown", "true");
        }, 1500); // Fade out duration
      }, 5000), // Start fade out after 5 seconds
    ];

    return () => phaseTimers.forEach(timer => clearTimeout(timer));
  }, [showIntro]);

  // Skip animation
  const skipIntro = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem("introShown", "true");
    }, 800); // Fade out duration when skipping
  };

  if (!showIntro) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-white overflow-hidden transition-opacity duration-1500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ transition: "opacity 1.5s ease" }}
    >
      <div className="relative z-20 max-w-lg px-6 py-10 text-center">
        {/* Logo animation */}
        <div 
          className={`transition-all duration-1000 transform ${animationPhase >= 1 ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          style={{ transition: "all 1.5s ease" }}
        >
          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="relative w-28 h-28 mb-4">
              <Shield className="w-28 h-28 text-primary absolute inset-0" strokeWidth={1.5} />
              <Lock className="w-14 h-14 text-white absolute inset-0 m-auto" />
            </div>
            
            <h1 
              className={`text-4xl font-bold transition-opacity duration-1000 ${animationPhase >= 2 ? "opacity-100" : "opacity-0"}`}
              style={{ transition: "opacity 1.5s ease" }}
            >
              <span className="text-primary">PASS</span>GUARD
            </h1>
          </div>
        </div>

        {/* Tagline */}
        <p 
          className={`text-xl transition-opacity duration-1000 mt-2 ${animationPhase >= 2 ? "opacity-100" : "opacity-0"}`}
          style={{ transition: "opacity 1.5s ease" }}
        >
          Your first line of defense
        </p>

        {/* Skip button */}
        <Button 
          onClick={skipIntro} 
          variant="ghost"
          size="sm"
          className="absolute bottom-6 right-6 text-gray-400 hover:text-white hover:bg-transparent"
        >
          Skip
        </Button>
      </div>
    </div>
  );
};

export default IntroAnimation;
