
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { saveValentineEntry } from './firebase';

// Simple heart confetti effect implementation
const triggerConfetti = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    for(let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = '-20px';
        heart.style.fontSize = randomInRange(10, 30) + 'px';
        heart.style.zIndex = '1000';
        heart.style.pointerEvents = 'none';
        heart.style.transition = `transform ${randomInRange(2, 4)}s linear, top ${randomInRange(2, 4)}s linear`;
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.style.top = '110vh';
            heart.style.transform = `translateX(${randomInRange(-100, 100)}px) rotate(${randomInRange(0, 360)}deg)`;
        }, 100);

        setTimeout(() => heart.remove(), 4000);
    }
  }, 250);
};

const REJECTION_TEXTS = [
  "No", "Nope! 🏃‍♂️", "Not today!", "Nice try!", "Too slow!", "Try again!", 
  "Maybe not?", "Oops!", "Catch me!", "Wait...", "Error 404", "No Way!",
  "Are you sure?", "Think again!", "In your dreams!", "Hahaha", "Can't touch this!",
  "Getting warmer?", "Nope, cold!", "Still no!", "Never! 😜", "Click Yes instead!",
  "Is that all you got?", "I'm too fast!", "Don't be shy!", "Keep trying! 😂"
];

const App = () => {
  const [userName, setUserName] = useState("");
  const [appStep, setAppStep] = useState<'name-entry' | 'proposal' | 'accepted'>('name-entry');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noButtonRotation, setNoButtonRotation] = useState(0);
  const [noButtonText, setNoButtonText] = useState("No");
  const [isDodging, setIsDodging] = useState(false);
  const [romanticMessage, setRomanticMessage] = useState<string>("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY || '' }), []);

  useEffect(() => {
    const handleResize = () => {
      if (isDodging) {
        setNoButtonPos(prev => ({
          x: Math.min(prev.x, window.innerWidth - 100),
          y: Math.min(prev.y, window.innerHeight - 100)
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDodging]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    
    setAppStep('proposal');
    const id = await saveValentineEntry(userName);
    setEntryId(id);
  };

  const generateRomanticMessage = async () => {
    setIsLoadingMessage(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, sweet romantic poem (max 4 lines) for a Valentine proposal for someone named ${userName}. Use heart emojis. Keep it plain text string.`,
        config: {
            temperature: 0.9,
        }
      });
      
      const textResult = response.text;
      setRomanticMessage(textResult || "You've made me the happiest person alive! ❤️");
    } catch (error) {
      console.error("Gemini Error:", error);
      setRomanticMessage(`You've made me the happiest person alive, ${userName}! ❤️`);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleYesClick = () => {
    setAppStep('accepted');
    triggerConfetti();
    generateRomanticMessage();
  };

  const moveNoButton = (e: React.MouseEvent | React.TouchEvent) => {
    const padding = 80;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let bestX = 0;
    let bestY = 0;
    let maxDistSq = -1;

    for (let i = 0; i < 15; i++) {
      const candX = Math.max(padding, Math.min(Math.random() * window.innerWidth, maxX));
      const candY = Math.max(padding, Math.min(Math.random() * window.innerHeight, maxY));
      
      const distSq = Math.pow(candX - clientX, 2) + Math.pow(candY - clientY, 2);
      if (distSq > maxDistSq) {
        maxDistSq = distSq;
        bestX = candX;
        bestY = candY;
      }
    }
    
    setNoButtonPos({ x: bestX, y: bestY });
    setNoButtonRotation(Math.random() * 40 - 20);
    setNoButtonText(REJECTION_TEXTS[Math.floor(Math.random() * REJECTION_TEXTS.length)]);
    setIsDodging(true);
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 overflow-hidden relative font-sans">
      {/* Background Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-rose-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 20}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 5 + 7}s`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <main 
        ref={cardRef}
        className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 text-center transition-all duration-500"
      >
        {appStep === 'name-entry' && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative inline-block">
                <span className="text-6xl mb-4 block animate-pulse">💝</span>
            </div>
            <h1 className="text-3xl font-bold text-rose-600 font-serif">Wait, who is this?</h1>
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <input
                autoFocus
                type="text"
                placeholder="Enter your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-6 py-4 rounded-full border-2 border-rose-100 focus:border-rose-300 focus:outline-none text-rose-600 text-lg text-center font-medium placeholder:text-rose-200 transition-all shadow-inner"
                maxLength={30}
              />
              <button
                type="submit"
                disabled={!userName.trim()}
                className="w-full py-4 bg-rose-500 text-white rounded-full font-bold text-xl shadow-lg hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                Continue ✨
              </button>
            </form>
          </div>
        )}

        {appStep === 'proposal' && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative inline-block">
                <span className="text-6xl mb-4 block animate-bounce">💝</span>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-400 rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl text-rose-600 font-bold leading-tight font-serif">
              Will you be my Valentine, <span className="text-rose-400 italic">{userName}</span>?
            </h1>
            
            <p className="text-rose-400 text-lg font-medium italic">
              "Every moment with you is a dream come true..."
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 min-h-[80px]">
              <button
                onClick={handleYesClick}
                className="group relative px-10 py-4 bg-rose-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-rose-700 hover:scale-110 active:scale-95 transition-all z-20 overflow-hidden"
              >
                <span className="relative z-10">YES! ❤️</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button
                onMouseEnter={moveNoButton}
                onTouchStart={(e) => {
                  e.preventDefault();
                  moveNoButton(e);
                }}
                style={isDodging ? {
                  position: 'fixed',
                  left: `${noButtonPos.x}px`,
                  top: `${noButtonPos.y}px`,
                  transform: `translate(-50%, -50%) rotate(${noButtonRotation}deg)`,
                  zIndex: 50,
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                } : {}}
                className={`px-10 py-4 border-2 border-rose-200 text-rose-400 rounded-full font-bold text-xl hover:bg-rose-100 transition-colors whitespace-nowrap shadow-sm animate-alive ${isDodging ? 'bg-white shadow-xl pointer-events-auto scale-110' : ''}`}
              >
                {noButtonText}
              </button>
            </div>
          </div>
        )}

        {appStep === 'accepted' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="text-7xl mb-6 animate-bounce">🥰</div>
            <h2 className="text-4xl text-rose-600 font-bold font-serif">
              I Knew You'd Say Yes, {userName}!
            </h2>
            
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 min-h-[120px] flex items-center justify-center italic text-rose-700 text-xl leading-relaxed">
              {isLoadingMessage ? (
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              ) : (
                <p className="whitespace-pre-line">
                  {romanticMessage}
                </p>
              )}
            </div>

            <button 
              onClick={() => {
                setAppStep('proposal');
                setIsDodging(false);
                setNoButtonText("No");
              }}
              className="text-rose-300 hover:text-rose-500 text-sm transition-colors mt-4 underline underline-offset-4"
            >
              Wait, ask me again!
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float infinite linear;
        }
        
        @keyframes alive {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(2deg) scale(1.02); }
          75% { transform: rotate(-2deg) scale(0.98); }
        }
        .animate-alive:not(:active) {
          animation: alive 3s ease-in-out infinite;
        }

        .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .font-sans {
          font-family: 'Inter', system-ui, sans-serif;
        }

        .animate-in {
          animation-fill-mode: both;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .zoom-in { animation: zoomIn 0.5s ease-out; }
        .slide-in-from-bottom { animation: slideInUp 0.7s ease-out; }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
