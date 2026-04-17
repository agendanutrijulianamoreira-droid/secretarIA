import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return {
      auth: getAuth(),
      db: getFirestore(),
    };
  }

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );

  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || "secretaria-wa-ai",
  });

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export const { auth, db } = getFirebaseAdmin();
