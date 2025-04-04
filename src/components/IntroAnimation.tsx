
import { useState, useEffect } from "react";
import { Shield, Lock } from "lucide-react";
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

  // Skip animation when user taps anywhere
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white overflow-hidden transition-opacity duration-1500"
      style={{ 
        transition: "opacity 1.5s ease",
        opacity: fadeOut ? 0 : 1,
        background: "radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)"
      }}
      onClick={skipIntro} // Skip on tap anywhere
    >
      <div className="relative z-20 max-w-lg px-6 py-10 text-center">
        {/* Logo animation */}
        <div 
          className="transition-all duration-1000 transform"
          style={{ 
            transition: "all 1.5s ease",
            transform: animationPhase >= 1 ? "scale(1)" : "scale(0.9)",
            opacity: animationPhase >= 1 ? 1 : 0
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="relative w-28 h-28 mb-4">
              <Shield 
                className="w-28 h-28 text-primary absolute inset-0" 
                strokeWidth={1.5} 
                style={{ filter: "drop-shadow(0 0 12px rgba(124, 58, 237, 0.5))" }}
              />
              <Lock 
                className="w-14 h-14 text-white absolute inset-0 m-auto" 
                style={{ filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))" }}
              />
            </div>
            
            <h1 
              className="text-4xl font-bold transition-opacity duration-1000"
              style={{ 
                transition: "opacity 1.5s ease, transform 1.5s ease",
                opacity: animationPhase >= 2 ? 1 : 0,
                transform: animationPhase >= 2 ? "translateY(0)" : "translateY(10px)"
              }}
            >
              <span className="text-primary">PASSWORD</span> STRENGTH ANALYZER
            </h1>
          </div>
        </div>

        {/* Tagline */}
        <p 
          className="text-xl transition-opacity duration-1000 mt-2"
          style={{ 
            transition: "opacity 1.5s ease, transform 1.5s ease",
            opacity: animationPhase >= 2 ? 1 : 0,
            transform: animationPhase >= 2 ? "translateY(0)" : "translateY(10px)"
          }}
        >
          Your first line of defense
        </p>
        
        {/* Tap instruction - moved to bottom of screen with proper positioning */}
        <div 
          className="fixed bottom-8 left-0 right-0 text-center"
          style={{ 
            opacity: animationPhase >= 2 ? 1 : 0,
            transition: "opacity 1.5s ease"
          }}
        >
          <p className="text-sm text-gray-400 animate-pulse px-4 py-2 bg-black/30 rounded-full inline-block backdrop-blur-sm">
            Tap anywhere to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
