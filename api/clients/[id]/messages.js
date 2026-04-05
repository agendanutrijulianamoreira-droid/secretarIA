import { handleCors, sendError } from "../../_lib/cors.js";
import { requireAdminOrOwner } from "../../_lib/auth.js";
import { db } from "../../_lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do cliente é obrigatório" });
  }

  try {
    const user = await requireAdminOrOwner(req, id);
    const messagesRef = db
      .collection("clients")
      .doc(id)
      .collection("messages");

    // ── GET: Listar mensagens ─────────────────────────────
    if (req.method === "GET") {
      const { limit: lim, before } = req.query;
      const pageSize = Math.min(parseInt(lim) || 50, 100);

      let query = messagesRef.orderBy("created_at", "desc").limit(pageSize);

      if (before) {
        const beforeDoc = await messagesRef.doc(before).get();
        if (beforeDoc.exists) {
          query = query.startAfter(beforeDoc);
        }
      }

      const snapshot = await query.get();
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      // Retornar em ordem cronológica
      messages.reverse();

      return res.status(200).json({ messages });
    }

    // ── POST: Enviar mensagem ─────────────────────────────
    if (req.method === "POST") {
      const { text } = req.body;

      if (!text || !text.trim()) {
        return res
          .status(400)
          .json({ error: "Texto da mensagem é obrigatório" });
      }

      const from = user.role === "admin" ? "admin" : "client";

      const messageData = {
        from,
        text: text.trim(),
        sender_uid: user.uid,
        sender_email: user.email,
        created_at: FieldValue.serverTimestamp(),
        ts: new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const docRef = await messagesRef.add(messageData);

      return res.status(201).json({
        id: docRef.id,
        ...messageData,
        created_at: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    sendError(res, err);
  }
}
