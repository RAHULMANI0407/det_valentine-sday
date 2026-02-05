import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 🔥 THIS WAS MISSING
export const saveValentineEntry = async (name: string) => {
  try {
    const docRef = await addDoc(collection(db, "entries"), {
      name,
      createdAt: serverTimestamp(),
    });

    console.log("Saved:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("Firebase error:", err);
    return null;
  }
};
