import { handleCors, sendError } from "../_lib/cors.js";
import { requireAdmin, requireAdminOrOwner } from "../_lib/auth.js";
import { db } from "../_lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do cliente é obrigatório" });
  }

  try {
    const clientRef = db.collection("clients").doc(id);

    // ── GET: Detalhes de um cliente ───────────────────────
    if (req.method === "GET") {
      const user = await requireAdminOrOwner(req, id);
      const doc = await clientRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      // Buscar briefing
      const briefingDoc = await clientRef
        .collection("briefing")
        .doc("data")
        .get();

      // Buscar faturas
      const invoicesSnap = await clientRef
        .collection("invoices")
        .orderBy("created_at", "desc")
        .get();
      const invoices = [];
      invoicesSnap.forEach((d) => invoices.push({ id: d.id, ...d.data() }));

      // Buscar últimas mensagens
      const messagesSnap = await clientRef
        .collection("messages")
        .orderBy("created_at", "desc")
        .limit(50)
        .get();
      const messages = [];
      messagesSnap.forEach((d) => messages.push({ id: d.id, ...d.data() }));
      messages.reverse(); // ordem cronológica

      return res.status(200).json({
        id: doc.id,
        ...doc.data(),
        briefing: briefingDoc.exists ? briefingDoc.data() : null,
        invoices,
        messages,
      });
    }

    // ── PUT: Atualizar cliente ─────────────────────────────
    if (req.method === "PUT") {
      await requireAdmin(req);
      const doc = await clientRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      const allowedFields = [
        "name",
        "phone",
        "status",
        "plan",
        "capabilities",
        "n8n_url",
        "n8n_status",
        "calendar",
        "waba_id",
      ];

      const updates = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      updates.updated_at = FieldValue.serverTimestamp();

      await clientRef.update(updates);

      const updated = await clientRef.get();
      return res.status(200).json({ id: updated.id, ...updated.data() });
    }

    // ── DELETE: Remover cliente ────────────────────────────
    if (req.method === "DELETE") {
      await requireAdmin(req);
      const doc = await clientRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      // Deletar subcoleções
      const subcollections = ["briefing", "invoices", "messages"];
      for (const sub of subcollections) {
        const snap = await clientRef.collection(sub).get();
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        if (snap.docs.length > 0) await batch.commit();
      }

      await clientRef.delete();
      return res.status(200).json({ message: "Cliente removido com sucesso" });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    sendError(res, err);
  }
}
