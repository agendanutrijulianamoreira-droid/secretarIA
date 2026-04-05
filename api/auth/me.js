import { handleCors, sendError } from "../_lib/cors.js";
import { verifyAuth } from "../_lib/auth.js";
import { db } from "../_lib/firebase.js";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const user = await verifyAuth(req);

    // Buscar dados extras do Firestore
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Se for cliente, buscar dados do client vinculado
    let clientData = null;
    if (userData.client_id) {
      const clientDoc = await db
        .collection("clients")
        .doc(userData.client_id)
        .get();
      if (clientDoc.exists) {
        clientData = { id: clientDoc.id, ...clientDoc.data() };
      }
    }

    res.status(200).json({
      uid: user.uid,
      email: user.email,
      role: userData.role || user.role,
      client_id: userData.client_id || user.client_id,
      displayName: userData.displayName || null,
      client: clientData,
    });
  } catch (err) {
    sendError(res, err);
  }
}
