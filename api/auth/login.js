import { handleCors, sendError } from "../_lib/cors.js";
import { auth, db } from "../_lib/firebase.js";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    // Nota: Firebase Admin SDK não valida senha diretamente.
    // A validação de login acontece no FRONTEND com signInWithEmailAndPassword.
    // Este endpoint serve para gerar custom tokens se necessário,
    // ou para buscar dados do usuário após login no frontend.

    // Buscar o usuário pelo email
    const userRecord = await auth.getUserByEmail(email);

    // Buscar dados extras do Firestore
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Gerar custom token com claims
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: userData.role || "client",
      client_id: userData.client_id || null,
    });

    res.status(200).json({
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userData.role || "client",
        client_id: userData.client_id || null,
      },
    });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    sendError(res, err);
  }
}
