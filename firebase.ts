
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// These values will be pulled from your Vercel Environment Variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase only if we have a project ID
let db: any = null;
try {
  if (firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

/**
 * Saves the visitor's name to Firestore.
 * @param name The name of the person opening the valentine.
 */
export const saveValentineEntry = async (name: string) => {
  if (!db) {
    console.warn("Firebase not configured. Name not saved, but proceeding for demo.");
    return "demo-id-" + Date.now();
  }

  try {
    const docRef = await addDoc(collection(db, "entries"), {
      name: name,
      timestamp: serverTimestamp(),
      action: "opened",
      accepted: false
    });
    console.log("Entry recorded for:", name);
    return docRef.id;
  } catch (e) {
    console.error("Error saving to Firebase:", e);
    return null;
  }
};

/**
 * Updates the entry when they finally say YES!
 */
export const markAsAccepted = async (entryId: string | null) => {
  if (!db || !entryId || entryId.startsWith("demo-id")) return;

  try {
    const entryRef = doc(db, "entries", entryId);
    await updateDoc(entryRef, {
      accepted: true,
      acceptedAt: serverTimestamp()
    });
    console.log("Success! Entry marked as accepted in database.");
  } catch (e) {
    console.error("Error updating document:", e);
  }
};
