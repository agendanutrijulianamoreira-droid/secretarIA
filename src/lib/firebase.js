import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBjTV8Xs3zCKKkyAM68dtqaVBl3rjL5as8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "secretaria-wa-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "secretaria-wa-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "secretaria-wa-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "921482596930",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:921482596930:web:8851bc89b3e667fc9fd3db",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export default app;
