import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

let app, db, auth;

try {
  app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
} catch (err) {
  console.error("[Firebase] Falha na inicialização — verifique as variáveis VITE_FIREBASE_* no Railway:", err);
  // Exporta objetos mock para o app não quebrar
  db   = null;
  auth = { currentUser: null };
}

if (!hasConfig) {
  console.warn("[Firebase] Variáveis de ambiente não configuradas. Defina VITE_FIREBASE_* no painel do Railway.");
}

export { db, auth };
export default app;
