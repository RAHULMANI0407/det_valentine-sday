import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { saveValentineEntry } from "./firebase";

const triggerConfetti = () => {
  for (let i = 0; i < 30; i++) {
    const heart = document.createElement("div");
    heart.innerHTML = "❤️";
    heart.style.position = "fixed";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.top = "-20px";
    heart.style.fontSize = Math.random() * 20 + 20 + "px";
    heart.style.pointerEvents = "none";
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.style.top = "110vh";
    }, 100);

    setTimeout(() => heart.remove(), 4000);
  }
};

const REJECTION_TEXTS = ["No", "Nope!", "Try again!", "Never 😜", "Catch me!"];

const App = () => {
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState<"name" | "proposal" | "accepted">("name");
  const [romanticMessage, setRomanticMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FIXED FOR VITE
  const ai = useMemo(
    () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY }),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting:", userName);

    const id = await saveValentineEntry(userName);

    console.log("Firebase ID:", id);

    setStep("proposal");
  };

  const generateMessage = async () => {
    setLoading(true);

    try {
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a short romantic poem for ${userName} with heart emojis.`,
      });

      setRomanticMessage(res.text || "I love you ❤️");
    } catch {
      setRomanticMessage("I love you ❤️");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {step === "name" && (
        <form onSubmit={handleSubmit}>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
          />
          <br />
          <button type="submit">Continue</button>
        </form>
      )}

      {step === "proposal" && (
        <>
          <h2>Will you be my Valentine, {userName}?</h2>
          <button
            onClick={() => {
              setStep("accepted");
              triggerConfetti();
              generateMessage();
            }}
          >
            YES ❤️
          </button>

          <button style={{ marginLeft: 10 }}>
            {REJECTION_TEXTS[Math.floor(Math.random() * REJECTION_TEXTS.length)]}
          </button>
        </>
      )}

      {step === "accepted" && (
        <>
          <h1>🥰 I knew it!</h1>
          {loading ? <p>Loading...</p> : <p>{romanticMessage}</p>}
        </>
      )}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
