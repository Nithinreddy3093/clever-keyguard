
import { useState, useEffect } from "react";
import { Shield, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IntroAnimation = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
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
      setTimeout(() => setAnimationPhase(1), 1000),  // Shield appears
      setTimeout(() => setAnimationPhase(2), 2500),  // First text appears
      setTimeout(() => setAnimationPhase(3), 4000),  // Second text appears
      setTimeout(() => setAnimationPhase(4), 5500),  // Third text appears
      setTimeout(() => setAnimationPhase(5), 7000),  // Final text appears
      setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem("introShown", "true");
      }, 9000), // End animation
    ];

    return () => phaseTimers.forEach(timer => clearTimeout(timer));
  }, [showIntro]);

  // Skip animation
  const skipIntro = () => {
    setShowIntro(false);
    sessionStorage.setItem("introShown", "true");
  };

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-20 overflow-hidden">
        <MatrixRain />
      </div>

      {/* Glowing gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-blue-900/30 to-slate-900/90 z-10"
        style={{ mixBlendMode: "overlay" }}
      ></div>

      {/* Main content container */}
      <div className="relative z-20 max-w-lg px-4 py-8 text-center">
        {/* Shield animation */}
        <div className={`transition-all duration-700 transform ${animationPhase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <Shield className="w-32 h-32 text-primary" strokeWidth={1} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Glitch text headings */}
        <h1 
          className={`text-4xl font-bold mb-4 glitch-text ${animationPhase >= 2 ? "opacity-100" : "opacity-0"}`} 
          data-text="Welcome to the Future of Password Security!"
        >
          Welcome to the Future of Password Security!
        </h1>

        <p 
          className={`text-lg mb-8 transition-opacity duration-700 ${animationPhase >= 3 ? "opacity-100" : "opacity-0"}`}
        >
          Your first line of defense against cyber threats starts here.
        </p>

        {/* Status messages */}
        <div className="space-y-3 my-8">
          <div className={`flex items-center justify-center transition-opacity duration-500 ${animationPhase >= 3 ? "opacity-100" : "opacity-0"}`}>
            <div className={`w-4 h-4 rounded-full bg-primary mr-3 ${animationPhase >= 3 ? "animate-pulse" : ""}`}></div>
            <p className="text-left">Analyzing Password Strength...</p>
          </div>
          
          <div className={`flex items-center justify-center transition-opacity duration-500 ${animationPhase >= 4 ? "opacity-100" : "opacity-0"}`}>
            <div className={`w-4 h-4 rounded-full bg-cyan-400 mr-3 ${animationPhase >= 4 ? "animate-pulse" : ""}`}></div>
            <p className="text-left flex items-center">
              AI Security Insights Activated 
              <Zap className="ml-2 h-4 w-4 text-yellow-400" />
            </p>
          </div>
          
          <div className={`flex items-center justify-center transition-opacity duration-500 ${animationPhase >= 5 ? "opacity-100" : "opacity-0"}`}>
            <div className={`w-4 h-4 rounded-full bg-green-400 mr-3 ${animationPhase >= 5 ? "animate-pulse" : ""}`}></div>
            <p className="text-left">Generating Unbreakable Passphrases...</p>
          </div>
        </div>

        {/* Tagline */}
        <h2 
          className={`text-2xl font-bold mt-6 transition-opacity duration-700 ${animationPhase >= 5 ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-primary">Secure Smarter.</span> <span className="text-cyan-400">Defend Better.</span>
        </h2>

        {/* Skip button */}
        <button 
          onClick={skipIntro} 
          className="absolute bottom-4 right-4 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

// Matrix-style background animation
const MatrixRain = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrixCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the y position of each column
    const drops: number[] = Array(columns).fill(1);
    
    // Characters to display
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    // Drawing function
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#0fa"; // Green text
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // x = column position, y = drop position
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Move the drop down
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <canvas id="matrixCanvas" className="w-full h-full"></canvas>;
};

export default IntroAnimation;
