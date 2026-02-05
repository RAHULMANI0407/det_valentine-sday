
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { saveValentineEntry } from './firebase';

// Helper for heart confetti
const triggerConfetti = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    for (let i = 0; i < 5; i++) {
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
  "Oops!", "Catch me!", "Wait...", "Error 404", "No Way!", "Think again!", 
  "Can't touch this!", "Never! 😜", "Click Yes instead!"
];

const App = () => {
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState<"name" | "proposal" | "accepted">("name");
  const [romanticMessage, setRomanticMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noButtonText, setNoButtonText] = useState("No");
  const [isDodging, setIsDodging] = useState(false);

  // Use process.env.API_KEY as strictly required
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY || '' }), []);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    await saveValentineEntry(userName);
    setStep("proposal");
  };

  const handleYes = async () => {
    setStep("accepted");
    setLoading(true);
    triggerConfetti();

    try {
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a very sweet, 2-line romantic poem for ${userName} with heart emojis.`,
      });
      setRomanticMessage(res.text || "You are my world ❤️");
    } catch {
      setRomanticMessage(`I love you, ${userName} ❤️`);
    } finally {
      setLoading(false);
    }
  };

  const moveNoButton = (e: React.MouseEvent | React.TouchEvent) => {
    const padding = 100;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let bestX = 0, bestY = 0, maxDistSq = -1;

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
    setNoButtonText(REJECTION_TEXTS[Math.floor(Math.random() * REJECTION_TEXTS.length)]);
    setIsDodging(true);
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 overflow-hidden relative font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute animate-float text-rose-300" 
               style={{ left: `${i * 10}%`, top: '100%', fontSize: '2rem', animationDelay: `${i * 0.5}s` }}>❤️</div>
        ))}
      </div>

      <main className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 text-center transition-all">
        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-6 animate-fadeIn">
            <span className="text-6xl mb-4 block animate-bounce">💌</span>
            <h1 className="text-3xl font-bold text-rose-600">Wait! Who are you?</h1>
            <input
              autoFocus
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-6 py-4 rounded-full border-2 border-rose-100 focus:border-rose-400 focus:outline-none text-rose-600 text-center font-bold text-lg"
            />
            <button type="submit" className="w-full py-4 bg-rose-500 text-white rounded-full font-bold text-xl hover:bg-rose-600 shadow-lg active:scale-95 transition-all">
              Continue ✨
            </button>
          </form>
        )}

        {step === "proposal" && (
          <div className="space-y-8 animate-fadeIn">
            <span className="text-6xl mb-4 block animate-pulse">💝</span>
            <h1 className="text-4xl text-rose-600 font-bold font-serif leading-tight">
              Will you be my Valentine, <br/><span className="italic">{userName}</span>?
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              <button onClick={handleYes} className="px-10 py-4 bg-rose-600 text-white rounded-full font-bold text-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                YES! ❤️
              </button>
              <button
                onMouseEnter={moveNoButton}
                onTouchStart={moveNoButton}
                style={isDodging ? { position: 'fixed', left: noButtonPos.x, top: noButtonPos.y, transform: 'translate(-50%, -50%)', zIndex: 100 } : {}}
                className="px-10 py-4 border-2 border-rose-200 text-rose-400 rounded-full font-bold text-xl hover:bg-rose-100 animate-alive whitespace-nowrap"
              >
                {noButtonText}
              </button>
            </div>
          </div>
        )}

        {step === "accepted" && (
          <div className="space-y-6 animate-slideInUp">
            <span className="text-7xl mb-6 block">🥰</span>
            <h1 className="text-4xl text-rose-600 font-bold">I Knew It!</h1>
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 italic text-rose-700 text-xl min-h-[100px] flex items-center justify-center">
              {loading ? (
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              ) : romanticMessage}
            </div>
            <button onClick={() => setStep("proposal")} className="text-rose-300 text-sm underline hover:text-rose-500 transition-colors">
              Ask me again!
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-float { animation: float 8s infinite linear; }
        @keyframes alive {
          0%, 100% { transform: rotate(0) scale(1); }
          50% { transform: rotate(3deg) scale(1.05); }
        }
        .animate-alive { animation: alive 3s infinite ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
