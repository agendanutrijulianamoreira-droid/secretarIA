import { handleCors, sendError } from "../_lib/cors.js";
import { requireAdmin } from "../_lib/auth.js";
import { db } from "../_lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const COLORS = [
  "#6366F1",
  "#EC4899",
  "#F59E0B",
  "#0EA5E9",
  "#10B981",
  "#8B5CF6",
  "#F43F5E",
];

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await requireAdmin(req);

    // ── GET: Listar todos os clientes ─────────────────────
    if (req.method === "GET") {
      const { status, search, limit: lim } = req.query;
      let query = db.collection("clients").orderBy("created_at", "desc");

      if (status && status !== "all") {
        query = query.where("status", "==", status);
      }

      const pageSize = Math.min(parseInt(lim) || 50, 100);
      query = query.limit(pageSize);

      const snapshot = await query.get();
      const clients = [];

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        // Filtro de busca no servidor (nome ou telefone)
        if (search) {
          const s = search.toLowerCase();
          const match =
            data.name?.toLowerCase().includes(s) ||
            data.phone?.includes(search);
          if (!match) return;
        }
        clients.push(data);
      });

      return res.status(200).json({ clients, total: clients.length });
    }

    // ── POST: Criar novo cliente ──────────────────────────
    if (req.method === "POST") {
      const { name, phone, plan, capabilities } = req.body;

      if (!name || !phone) {
        return res
          .status(400)
          .json({ error: "Nome e telefone são obrigatórios" });
      }

      // Gerar avatar (iniciais)
      const avatar = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      // Contar clientes para gerar WABA_ID e cor
      const countSnap = await db
        .collection("clients")
        .count()
        .get();
      const count = countSnap.data().count;

      const clientData = {
        name,
        phone,
        plan: plan || "Pro",
        capabilities: capabilities || ["text"],
        status: "setup",
        waba_id: `WABA_${String(count + 1).padStart(3, "0")}`,
        n8n_url: "",
        n8n_status: "pending",
        calendar: null,
        avatar,
        color: COLORS[count % COLORS.length],
        msgs_today: 0,
        msgs_month: 0,
        last_active: null,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("clients").add(clientData);

      // Criar subdocumento de briefing vazio
      await db
        .collection("clients")
        .doc(docRef.id)
        .collection("briefing")
        .doc("data")
        .set({
          segment: "",
          description: "",
          site: "",
          instagram: "",
          ai_name: "",
          ai_tone: "",
          ai_goal: "",
          business_hours: "",
          escalation_trigger: "",
          escalation_number: "",
          services: [],
          faqs: [],
          restrictions: "",
          promotions: "",
          updated_at: FieldValue.serverTimestamp(),
        });

      return res.status(201).json({
        id: docRef.id,
        ...clientData,
        created_at: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    sendError(res, err);
  }
}
