
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Using process.env as per the environment standard
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let db: any = null;

try {
  // Only initialize if we have the minimum required config
  if (firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase init failed:", e);
}

export const saveValentineEntry = async (name: string) => {
  if (!db) {
    console.warn("Firebase not configured, skipping save.");
    return "demo-" + Date.now();
  }
  try {
    const ref = await addDoc(collection(db, "entries"), { 
      name,
      timestamp: serverTimestamp(),
      status: "opened"
    });
    console.log("Saved entry:", ref.id);
    return ref.id;
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    return null;
  }
};
