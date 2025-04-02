
import { useState, useEffect } from "react";
import { Shield, Lock, Zap } from "lucide-react";
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
      setTimeout(() => setAnimationPhase(1), 800),  // Shield appears
      setTimeout(() => setAnimationPhase(2), 2000),  // First text appears
      setTimeout(() => setAnimationPhase(3), 3200),  // Second text appears
      setTimeout(() => setAnimationPhase(4), 4400),  // Third text appears
      setTimeout(() => setAnimationPhase(5), 5600),  // Final text appears
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowIntro(false);
          sessionStorage.setItem("introShown", "true");
        }, 1200); // Fade out duration
      }, 7500), // Start fade out
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white overflow-hidden transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden">
        <ParticleBackground />
      </div>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-blue-900/20 to-black/90 z-10"
      ></div>

      {/* Main content container */}
      <div className="relative z-20 max-w-lg px-6 py-10 text-center">
        {/* Shield animation */}
        <div className={`transition-all duration-1000 transform ${animationPhase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <div className="relative mx-auto w-32 h-32 mb-10">
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${animationPhase >= 1 ? "animate-float" : ""}`}>
              <Shield className="w-32 h-32 text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-16 h-16 text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center opacity-50 blur-lg">
              <Shield className="w-40 h-40 text-primary" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Stylish text headings */}
        <h1 
          className={`text-4xl font-bold mb-6 transition-all duration-700 ${animationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          Welcome to the <span className="text-primary">Future</span> of Password Security
        </h1>

        <p 
          className={`text-lg mb-8 transition-all duration-700 delay-100 ${animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          Your first line of defense against cyber threats starts here.
        </p>

        {/* Status messages */}
        <div className="space-y-4 my-10">
          <div className={`flex items-center justify-center transition-all duration-500 ${animationPhase >= 3 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
            <div className={`w-4 h-4 rounded-full bg-primary mr-3 ${animationPhase >= 3 ? "animate-pulse" : ""}`}></div>
            <p className="text-left">Analyzing Password Strength...</p>
          </div>
          
          <div className={`flex items-center justify-center transition-all duration-500 ${animationPhase >= 4 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
            <div className={`w-4 h-4 rounded-full bg-cyan-400 mr-3 ${animationPhase >= 4 ? "animate-pulse" : ""}`}></div>
            <p className="text-left flex items-center">
              AI Security Insights Activated 
              <Zap className="ml-2 h-4 w-4 text-yellow-400" />
            </p>
          </div>
          
          <div className={`flex items-center justify-center transition-all duration-500 ${animationPhase >= 5 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
            <div className={`w-4 h-4 rounded-full bg-green-400 mr-3 ${animationPhase >= 5 ? "animate-pulse" : ""}`}></div>
            <p className="text-left">Generating Unbreakable Passphrases...</p>
          </div>
        </div>

        {/* Tagline */}
        <h2 
          className={`text-2xl font-bold mt-8 transition-all duration-700 ${animationPhase >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="text-primary">Secure Smarter.</span> <span className="text-cyan-400">Defend Better.</span>
        </h2>

        {/* Skip button */}
        <Button 
          onClick={skipIntro} 
          variant="outline"
          size="sm"
          className="absolute bottom-6 right-6 bg-black/50 border-gray-600 hover:bg-black/70 hover:border-gray-400 transition-all duration-300"
        >
          Skip Intro
        </Button>
      </div>
    </div>
  );
};

// Particle animation background
const ParticleBackground = () => {
  useEffect(() => {
    // Canvas setup
    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        
        // Choose color from cybersecurity theme
        const colors = [
          'rgba(155, 135, 245, 0.7)', // Purple
          'rgba(14, 165, 233, 0.7)',  // Blue
          'rgba(6, 182, 212, 0.7)',   // Cyan
          'rgba(34, 211, 238, 0.5)',  // Light blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around screen edges
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create particle array
    const particleArray: Particle[] = [];
    const particleCount = Math.min(150, Math.floor(window.innerWidth * window.innerHeight / 10000));
    
    for (let i = 0; i < particleCount; i++) {
      particleArray.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
        
        // Connect particles with lines
        connectParticles(particleArray[i], particleArray);
      }
      
      requestAnimationFrame(animate);
    };
    
    // Draw connecting lines between nearby particles
    const connectParticles = (particle: Particle, particles: Particle[]) => {
      const maxDistance = 100;
      
      for (let i = 0; i < particles.length; i++) {
        const dx = particle.x - particles[i].x;
        const dy = particle.y - particles[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = 1 - (distance / maxDistance);
          ctx.strokeStyle = `rgba(100, 100, 255, ${opacity * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particles[i].x, particles[i].y);
          ctx.stroke();
        }
      }
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <canvas id="particleCanvas" className="w-full h-full"></canvas>;
};

export default IntroAnimation;
