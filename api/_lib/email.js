import { auth } from "./firebase.js";

const API_KEY = process.env.FIREBASE_WEB_API_KEY
  || process.env.VITE_FIREBASE_API_KEY
  || "AIzaSyBjTV8Xs3zCKKkyAM68dtqaVBl3rjL5as8";

/**
 * Envia e-mail de redefinição de senha via Firebase Auth (REST API).
 * O Firebase usa seus templates internos — personalizáveis no Console.
 */
export async function sendPasswordResetEmail(email) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    console.log(`✉️ Password reset email sent to ${email}`);
    return data;
  } catch (err) {
    console.error("Firebase email error:", err.message);
    return null;
  }
}
