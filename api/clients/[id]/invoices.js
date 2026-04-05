import { handleCors, sendError } from "../../_lib/cors.js";
import { requireAdmin, requireAdminOrOwner } from "../../_lib/auth.js";
import { db } from "../../_lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do cliente é obrigatório" });
  }

  try {
    const invoicesRef = db
      .collection("clients")
      .doc(id)
      .collection("invoices");

    // ── GET: Listar faturas ───────────────────────────────
    if (req.method === "GET") {
      await requireAdminOrOwner(req, id);

      const snapshot = await invoicesRef
        .orderBy("created_at", "desc")
        .get();

      const invoices = [];
      snapshot.forEach((doc) => {
        invoices.push({ id: doc.id, ...doc.data() });
      });

      return res.status(200).json({ invoices });
    }

    // ── POST: Criar fatura ────────────────────────────────
    if (req.method === "POST") {
      await requireAdmin(req);

      const { desc, amount, status, date, asaas_id } = req.body;

      if (!desc || amount === undefined) {
        return res
          .status(400)
          .json({ error: "Descrição e valor são obrigatórios" });
      }

      const invoiceData = {
        desc,
        amount: Number(amount),
        status: status || "pendente",
        date: date || new Date().toLocaleDateString("pt-BR"),
        asaas_id: asaas_id || null,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };

      const docRef = await invoicesRef.add(invoiceData);

      return res.status(201).json({
        id: docRef.id,
        ...invoiceData,
        created_at: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    sendError(res, err);
  }
}
