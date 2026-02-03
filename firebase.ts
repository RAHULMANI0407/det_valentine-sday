
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Placeholder configuration - replace with your actual keys during deployment
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Saves the visitor's name to Firestore.
 * @param name The name of the person opening the valentine.
 */
export const saveValentineEntry = async (name: string) => {
  try {
    const docRef = await addDoc(collection(db, "entries"), {
      name: name,
      timestamp: serverTimestamp(),
      action: "opened"
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.warn("Firebase not yet linked or error saving:", e);
    // Return null so the app can still proceed even if Firebase isn't configured yet
    return null;
  }
};

/**
 * Updates the entry when they finally say YES!
 */
export const markAsAccepted = async (entryId: string | null) => {
  if (!entryId) return;
  // This is a placeholder for updating the specific record
  console.log("Marking entry as accepted:", entryId);
};
